import axios from "axios";
import { mergeHotelData } from "../utils/dataMerger";
import { Hotel } from "../interfaces/hotelInterfaces";
import { CustomError } from "../utils/CustomError";
import redisClient from "../redisClient";

export const SUPPLIER_URLS = [
  "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/acme",
  "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/patagonia",
  "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/paperflies",
];

export async function getMergedHotelData(
  destinationId?: number,
  hotelIds?: string[],
  page: number = 1,
  limit: number = 10
): Promise<Hotel[]> {
  const cacheKey = `hotels:${destinationId || ""}:${
    hotelIds?.join(",") || ""
  }:${page}:${limit}`;

  // Check if data is in cache
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log("Cache hit:", cacheKey);
    return JSON.parse(cachedData);
  }

  console.log("Cache miss:", cacheKey);

  // Fetch data from external APIs with error handling
  // using all settled here to cater possible some of the data sources is unable to reach
  const responses = await Promise.allSettled(
    SUPPLIER_URLS.map((url) => axios.get(url))
  );

  const successfulResponses = responses
    .filter((result) => result.status === "fulfilled")
    .map((result: any) => result.value.data);

  //if all the data sources throwing error, throw custom error here
  if (successfulResponses.length === 0) {
    throw new CustomError("All suppliers failed to provide data", 503);
  }

  const mergedData = mergeHotelData(successfulResponses);

  let filteredData = mergedData;

  if (destinationId) {
    filteredData = filteredData.filter(
      (hotel) => hotel.destinationId === destinationId
    );
  }

  if (hotelIds && hotelIds.length > 0) {
    filteredData = filteredData.filter((hotel) => hotelIds.includes(hotel.id));
  }
  const startIndex = (page - 1) * limit;
  const paginatedData = filteredData.slice(startIndex, startIndex + limit);
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(paginatedData)); // TTL of 1 hour
  return paginatedData;
}

export const getMergedDataById = async (id: string): Promise<Hotel | null> => {
  const cacheKey = `hotel:${id}`;

  // Check if data is in cache
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log("Cache hit:", cacheKey);
    return JSON.parse(cachedData);
  }

  console.log("Cache miss:", cacheKey);
  // Fetch data from external APIs
  const responses = await Promise.allSettled(
    SUPPLIER_URLS.map((url) => axios.get(url))
  );
  const successfulResponses = responses
    .filter((result) => result.status === "fulfilled")
    .map((result: any) => result.value.data);
  //if all the data sources throwing error, throw custom error here
  if (successfulResponses.length === 0) {
    throw new CustomError("All suppliers failed to provide data", 503);
  }

  const mergedData = mergeHotelData(successfulResponses);

  const hotel = mergedData.find((h) => h.id === id) || null;

  // Store the result in Redis cache with a TTL (Time To Live)
  if (hotel) {
    await redisClient.setEx(cacheKey, 10, JSON.stringify(hotel)); // TTL of 1 hour
  }
  return hotel;
};

import axios from "axios";
import { mergeHotelData } from "../utils/dataMerger";
import { Hotel } from "../interfaces/hotelInterfaces";
import { CustomError } from "../utils/CustomError";

const SUPPLIER_URLS = [
  "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/acme",
  "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/patagonia",
  "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/paperflies",
];

export async function getMergedHotelData(
  destinationId?: number,
  hotelIds?: string[]
): Promise<Hotel[]> {
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

  return filteredData;
}

export const getMergedDataById = async (id: string): Promise<Hotel | null> => {
  // Fetch data from external APIs
  const responses = await Promise.allSettled(
    SUPPLIER_URLS.map((url) => axios.get(url))
  );

  const successfulResponses = responses
    .filter((result) => result.status === "fulfilled")
    .map((result: any) => result.value.data);

  const mergedData = mergeHotelData(successfulResponses);

  const hotel = mergedData.find((h) => h.id === id) || null;

  return hotel;
};

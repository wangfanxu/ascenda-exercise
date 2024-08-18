// src/services/hotelService.ts
import axios from "axios";
import { mergeHotelData } from "../utils/dataMerger";
import { Hotel } from "../interfaces/hotelInterfaces";

const SUPPLIER_URLS = [
  "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/acme",
  "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/patagonia",
  "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/paperflies",
];

export async function getMergedHotelData(
  destinationId?: number,
  hotelIds?: string[]
): Promise<Hotel[]> {
  const responses = await Promise.all(
    SUPPLIER_URLS.map((url) => axios.get(url))
  );
  const rawData = responses.map((response) => response.data);
  const mergedData = mergeHotelData(rawData);

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

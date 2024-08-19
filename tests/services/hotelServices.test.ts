import axios from "axios";
import {
  getMergedHotelData,
  getMergedDataById,
  SUPPLIER_URLS,
} from "../../src/services/hotelService";
import { mergeHotelData } from "../../src/utils/dataMerger";
import { CustomError } from "../../src/utils/CustomError";

// Mock dependencies
jest.mock("axios");
jest.mock("../../src/utils/dataMerger");

describe("Hotel Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getMergedHotelData", () => {
    it("should return merged and filtered hotel data", async () => {
      const mockResponse = [
        { id: "1", destinationId: 123, name: "Hotel A" },
        { id: "2", destinationId: 456, name: "Hotel B" },
      ];

      // Mock axios.get to resolve with an object containing a `data` property
      // mock 3 times for the 3 different url source
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      (mergeHotelData as jest.Mock).mockReturnValue(mockResponse);

      const hotels = await getMergedHotelData(123, ["1"]);

      expect(axios.get).toHaveBeenCalledTimes(SUPPLIER_URLS.length);
      expect(mergeHotelData).toHaveBeenCalledWith([
        mockResponse,
        mockResponse,
        mockResponse,
      ]);
      expect(hotels).toEqual([
        { id: "1", destinationId: 123, name: "Hotel A" },
      ]);
    });
    it("should handle errors when all suppliers fail", async () => {
      //mock all 3 suppliers failed
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Error"));
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Error"));
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Error"));

      await expect(getMergedHotelData(123, ["1"])).rejects.toThrow(
        new CustomError("All suppliers failed to provide data", 503)
      );

      expect(axios.get).toHaveBeenCalledTimes(SUPPLIER_URLS.length);
      expect(mergeHotelData).not.toHaveBeenCalled();
    });

    it("should return all merged data when no filters are applied", async () => {
      const mockResponse = [
        { id: "1", destinationId: 123, name: "Hotel A" },
        { id: "2", destinationId: 456, name: "Hotel B" },
      ];
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      (mergeHotelData as jest.Mock).mockReturnValue(mockResponse);

      const hotels = await getMergedHotelData();

      expect(hotels).toEqual(mockResponse);
    });
  });

  describe("getMergedDataById", () => {
    it("should return hotel data by ID", async () => {
      const mockResponse = [
        { id: "1", destinationId: 123, name: "Hotel A" },
        { id: "2", destinationId: 456, name: "Hotel B" },
      ];
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      (mergeHotelData as jest.Mock).mockReturnValue(mockResponse);

      const hotel = await getMergedDataById("1");

      expect(axios.get).toHaveBeenCalledTimes(SUPPLIER_URLS.length);
      expect(mergeHotelData).toHaveBeenCalled();
      expect(hotel).toEqual({ id: "1", destinationId: 123, name: "Hotel A" });
    });

    it("should return null if hotel with the given ID is not found", async () => {
      const mockResponse = [{ id: "2", destinationId: 456, name: "Hotel B" }];
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      (mergeHotelData as jest.Mock).mockReturnValue(mockResponse);

      const hotel = await getMergedDataById("1");

      expect(axios.get).toHaveBeenCalledTimes(SUPPLIER_URLS.length);
      expect(mergeHotelData).toHaveBeenCalled();
      expect(hotel).toBeNull();
    });

    it("should handle errors when all suppliers fail", async () => {
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Error"));
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Error"));
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Error"));

      await expect(getMergedDataById("1")).rejects.toThrow(
        new CustomError("All suppliers failed to provide data", 503)
      );
    });
  });
});

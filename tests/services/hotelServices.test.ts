import axios from "axios";
import {
  getMergedHotelData,
  getMergedDataById,
  SUPPLIER_URLS,
} from "../../src/services/hotelService";
import { mergeHotelData } from "../../src/utils/dataMerger";
import { CustomError } from "../../src/utils/CustomError";
import redisClient from "../../src/redisClient";

// Mock dependencies
jest.mock("axios");
jest.mock("../../src/utils/dataMerger");
jest.mock("../../src/redisClient", () => {
  const mRedisClient = {
    get: jest.fn(),
    setEx: jest.fn(),
    connect: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
  };
  mRedisClient.on.mockImplementation((event, handler) => {
    if (event === "error") {
      handler(new Error("Mocked Redis client error"));
    }
  });
  return mRedisClient;
});

describe("Hotel Service", () => {
  beforeEach(() => {
    process.env.REDIS_HOST = "localhost";
    process.env.REDIS_PORT = "6379";
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMergedHotelData", () => {
    it("should return merged and filtered hotel data from cache if available", async () => {
      const mockCachedData = [
        { id: "1", destinationId: 123, name: "Hotel A" },
        { id: "2", destinationId: 456, name: "Hotel B" },
      ];

      // Mock Redis client to return cached data
      (redisClient.get as jest.Mock).mockResolvedValue(
        JSON.stringify(mockCachedData)
      );

      const hotels = await getMergedHotelData(123, ["1"]);

      expect(redisClient.get).toHaveBeenCalledWith("hotels:123:1");
      expect(axios.get).not.toHaveBeenCalled();
      expect(mergeHotelData).not.toHaveBeenCalled();
      expect(hotels).toEqual(mockCachedData);
    });

    it("should fetch, merge, cache, and return hotel data if not in cache", async () => {
      const mockResponse = [
        { id: "1", destinationId: 123, name: "Hotel A" },
        { id: "2", destinationId: 456, name: "Hotel B" },
      ];

      (redisClient.get as jest.Mock).mockResolvedValue(null); // Cache miss
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      (mergeHotelData as jest.Mock).mockReturnValue(mockResponse);

      const hotels = await getMergedHotelData(123, ["1"]);

      expect(redisClient.get).toHaveBeenCalledWith("hotels:123:1");
      expect(axios.get).toHaveBeenCalledTimes(SUPPLIER_URLS.length);
      expect(mergeHotelData).toHaveBeenCalledWith([
        mockResponse,
        mockResponse,
        mockResponse,
      ]);
      expect(redisClient.setEx).toHaveBeenCalledWith(
        "hotels:123:1",
        3600,
        JSON.stringify([{ id: "1", destinationId: 123, name: "Hotel A" }])
      );
      expect(hotels).toEqual([
        { id: "1", destinationId: 123, name: "Hotel A" },
      ]);
    });

    it("should handle errors when all suppliers fail", async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null); // Cache miss
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Error"));
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Error"));
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Error"));

      await expect(getMergedHotelData(123, ["1"])).rejects.toThrow(
        new CustomError("All suppliers failed to provide data", 503)
      );

      expect(redisClient.get).toHaveBeenCalledWith("hotels:123:1");
      expect(axios.get).toHaveBeenCalledTimes(SUPPLIER_URLS.length);
      expect(mergeHotelData).not.toHaveBeenCalled();
      expect(redisClient.setEx).not.toHaveBeenCalled();
    });

    it("should return all merged data when no filters are applied", async () => {
      const mockResponse = [
        { id: "1", destinationId: 123, name: "Hotel A" },
        { id: "2", destinationId: 456, name: "Hotel B" },
      ];

      (redisClient.get as jest.Mock).mockResolvedValue(null); // Cache miss
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      (mergeHotelData as jest.Mock).mockReturnValue(mockResponse);

      const hotels = await getMergedHotelData();

      expect(hotels).toEqual(mockResponse);
    });
  });

  describe("getMergedDataById", () => {
    it("should return hotel data by ID from cache if available", async () => {
      const mockCachedData = { id: "1", destinationId: 123, name: "Hotel A" };

      (redisClient.get as jest.Mock).mockResolvedValue(
        JSON.stringify(mockCachedData)
      );

      const hotel = await getMergedDataById("1");

      expect(redisClient.get).toHaveBeenCalledWith("hotel:1");
      expect(axios.get).not.toHaveBeenCalled();
      expect(mergeHotelData).not.toHaveBeenCalled();
      expect(hotel).toEqual(mockCachedData);
    });

    it("should fetch, merge, cache, and return hotel data by ID if not in cache", async () => {
      const mockResponse = [
        { id: "1", destinationId: 123, name: "Hotel A" },
        { id: "2", destinationId: 456, name: "Hotel B" },
      ];

      (redisClient.get as jest.Mock).mockResolvedValue(null); // Cache miss
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      (mergeHotelData as jest.Mock).mockReturnValue(mockResponse);

      const hotel = await getMergedDataById("1");

      expect(redisClient.get).toHaveBeenCalledWith("hotel:1");
      expect(axios.get).toHaveBeenCalledTimes(SUPPLIER_URLS.length);
      expect(mergeHotelData).toHaveBeenCalledWith([
        mockResponse,
        mockResponse,
        mockResponse,
      ]);
      expect(redisClient.setEx).toHaveBeenCalledWith(
        "hotel:1",
        10,
        JSON.stringify({ id: "1", destinationId: 123, name: "Hotel A" })
      );
      expect(hotel).toEqual({ id: "1", destinationId: 123, name: "Hotel A" });
    });

    it("should return null if hotel with the given ID is not found", async () => {
      const mockResponse = [{ id: "2", destinationId: 456, name: "Hotel B" }];

      (redisClient.get as jest.Mock).mockResolvedValue(null); // Cache miss
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      (mergeHotelData as jest.Mock).mockReturnValue(mockResponse);

      const hotel = await getMergedDataById("1");

      expect(redisClient.get).toHaveBeenCalledWith("hotel:1");
      expect(axios.get).toHaveBeenCalledTimes(SUPPLIER_URLS.length);
      expect(mergeHotelData).toHaveBeenCalled();
      expect(hotel).toBeNull();
    });

    it("should handle errors when all suppliers fail", async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null); // Cache miss
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Error"));
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Error"));
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Error"));

      await expect(getMergedDataById("1")).rejects.toThrow(
        new CustomError("All suppliers failed to provide data", 503)
      );

      expect(redisClient.get).toHaveBeenCalledWith("hotel:1");
      expect(axios.get).toHaveBeenCalledTimes(SUPPLIER_URLS.length);
      expect(mergeHotelData).not.toHaveBeenCalled();
      expect(redisClient.setEx).not.toHaveBeenCalled();
    });
  });
});

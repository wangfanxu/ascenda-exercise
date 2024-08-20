import axios from "axios";
import { getMergedHotelData } from "../../src/services/hotelService";
import redisClient, { connectRedis } from "../../src/redisClient";
import { CustomError } from "../../src/utils/CustomError";

describe("Hotel Service Integration Tests", () => {
  beforeAll(async () => {
    await connectRedis(); // Ensure Redis client is connected
  });

  afterAll(async () => {
    await redisClient.quit(); // Close the Redis connection after all tests
  });

  beforeEach(async () => {
    await redisClient.flushAll(); // Clear Redis before each test to ensure clean state
  });

  it("should fetch, merge, cache, and return hotel data", async () => {
    // Mocking the API responses from the suppliers
    const mockResponse1 = [
      { id: "1", destination_id: 123, name: "Hotel A" },
      { id: "2", destination_id: 456, name: "Hotel B" },
    ];

    const mockResponse2 = [
      { id: "1", destination_id: 123, name: "Hotel A" },
      { id: "2", destination_id: 456, name: "Hotel B" },
    ];

    const mockResponse3 = [
      { id: "1", destination_id: 123, name: "Hotel A" },
      { id: "2", destination_id: 456, name: "Hotel B" },
    ];
    axios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: mockResponse1 })
      .mockResolvedValueOnce({ data: mockResponse2 })
      .mockResolvedValueOnce({ data: mockResponse3 });

    const hotels = await getMergedHotelData(123, ["1"]);
    const expected = [
      {
        id: "1",
        destinationId: 123,
        name: "Hotel A",
        location: {
          lat: null,
          lng: null,
          address: null,
          city: null,
          country: null,
          postalCode: null,
        },
        description: null,
        amenities: { general: [], room: [] },
        images: { rooms: [], site: [], amenities: [] },
        bookingConditions: [],
      },
    ];
    expect(hotels).toEqual(expected);
    // // Check if the data is cached
    const cachedData = await redisClient.get("hotels:123:1");

    expect(JSON.parse(cachedData!)).toEqual(expected);
  });
});

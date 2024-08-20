import request from "supertest";
import express, { Application } from "express";
import { getHotels, getHotelById } from "../../src/controllers/hotelController";
import {
  getMergedHotelData,
  getMergedDataById,
} from "../../src/services/hotelService";

// Mock the services
jest.mock("../../src/services/hotelService");

const app: Application = express();
app.use(express.json());

app.get("/hotels", getHotels);
app.get("/hotels/:id", getHotelById);

describe("Hotel Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /hotels", () => {
    it("should return hotels for given destinationId and hotelIds", async () => {
      const mockData = [
        { id: "1", name: "Hotel One" },
        { id: "2", name: "Hotel Two" },
      ];

      // Mock the service function
      (getMergedHotelData as jest.Mock).mockResolvedValue(mockData);

      const response = await request(app)
        .get("/hotels")
        .query({ destinationId: "123", hotelIds: "1,2" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(getMergedHotelData).toHaveBeenCalledWith(123, ["1", "2"],1,10);
    });

    it("should return 500 if there is an error", async () => {
      (getMergedHotelData as jest.Mock).mockRejectedValue(new Error("Error"));

      const response = await request(app)
        .get("/hotels")
        .query({ destinationId: "123", hotelIds: "1,2" });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "message",
        "Error retrieving hotels"
      );
    });
  });

  describe("GET /hotels/:id", () => {
    it("should return a hotel for a given id", async () => {
      const mockHotel = { id: "1", name: "Hotel One" };

      // Mock the service function
      (getMergedDataById as jest.Mock).mockResolvedValue(mockHotel);

      const response = await request(app).get("/hotels/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHotel);
      expect(getMergedDataById).toHaveBeenCalledWith("1");
    });

    it("should return 404 if hotel is not found", async () => {
      (getMergedDataById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get("/hotels/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Hotel not found");
    });

    it("should return 500 if there is an error", async () => {
      (getMergedDataById as jest.Mock).mockRejectedValue(new Error("Error"));

      const response = await request(app).get("/hotels/1");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Error retrieving hotel");
    });
  });
});

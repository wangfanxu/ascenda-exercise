import { Request, Response } from "express";
import { getHotels, getHotelById } from "../../src/controllers/hotelController";
import {
  getMergedDataById,
  getMergedHotelData,
} from "../../src/services/hotelService";

// Mock the service functions
jest.mock("../../src/services/hotelService", () => ({
  getMergedHotelData: jest.fn(),
  getMergedDataById: jest.fn(),
}));

describe("Hotel Controller test suite", () => {
  describe("getHotels", () => {
    it("should return hotels when destinationId and hotelIds are provided", async () => {
      const req = {
        query: {
          destinationId: "123",
          hotelIds: "1,2,3",
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (getMergedHotelData as jest.Mock).mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      await getHotels(req, res);

      expect(getMergedHotelData).toHaveBeenCalledWith(
        123,
        ["1", "2", "3"],
        1,
        10
      );
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });

    it("should handle errors and return a 500 status code", async () => {
      const req = {
        query: {
          destinationId: "123",
          hotelIds: "1,2,3",
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (getMergedHotelData as jest.Mock).mockRejectedValue(new Error("Error"));

      await getHotels(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error retrieving hotels",
        error: expect.any(Error),
      });
    });
  });

  describe("getHotelById", () => {
    it("should return a hotel when the id is valid", async () => {
      const req = {
        params: {
          id: "1",
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (getMergedDataById as jest.Mock).mockResolvedValue({ id: 1 });

      await getHotelById(req, res);

      expect(getMergedDataById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("should return a 404 status code if the hotel is not found", async () => {
      const req = {
        params: {
          id: "1",
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (getMergedDataById as jest.Mock).mockResolvedValue(null);

      await getHotelById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Hotel not found" });
    });

    it("should handle errors and return a 500 status code", async () => {
      const req = {
        params: {
          id: "1",
        },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (getMergedDataById as jest.Mock).mockRejectedValue(new Error("Error"));

      await getHotelById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error retrieving hotel",
        error: expect.any(Error),
      });
    });
  });
});

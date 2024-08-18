// src/controllers/hotelController.ts
import { Request, Response } from "express";
import { getMergedHotelData } from "../services/hotelService";

export const getHotels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { destinationId, hotelIds } = req.query;
    const ids = Array.isArray(hotelIds) ? hotelIds : hotelIds?.split(",");
    const hotels = await getMergedHotelData(
      Number(destinationId),
      ids as string[]
    );
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving hotels", error });
  }
};

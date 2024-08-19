// src/controllers/hotelController.ts
import { Request, Response } from "express";
import { getMergedHotelData } from "../services/hotelService";

export const getHotels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { destinationId, hotelIds } = req.query;
    let ids: string[] | undefined;

    if (typeof hotelIds === "string") {
      ids = hotelIds.split(",");
    } else if (Array.isArray(hotelIds)) {
      ids = hotelIds as string[];
    } else {
      ids = undefined;
    }

    const hotels = await getMergedHotelData(Number(destinationId), ids);
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving hotels", error });
  }
};

import { Request, Response } from "express";
import {
  getMergedDataById,
  getMergedHotelData,
} from "../services/hotelService";

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

export const getHotelById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const hotel = await getMergedDataById(id);

    if (!hotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }

    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving hotel", error });
  }
};

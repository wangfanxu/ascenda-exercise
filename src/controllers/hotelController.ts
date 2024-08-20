import { Request, Response } from "express";
import {
  getMergedDataById,
  getMergedHotelData,
} from "../services/hotelService";

export const getHotels = async (req: Request, res: Response): Promise<void> => {
  try {
    //page and limit are used for pagination
    const { destinationId, hotelIds, page = "1", limit = "10" } = req.query;
    let ids: string[] | undefined;

    if (typeof hotelIds === "string") {
      ids = hotelIds.split(",");
    } else if (Array.isArray(hotelIds)) {
      ids = hotelIds as string[];
    } else {
      ids = undefined;
    }
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const hotels = await getMergedHotelData(
      Number(destinationId),
      ids,
      pageNumber,
      limitNumber
    );
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

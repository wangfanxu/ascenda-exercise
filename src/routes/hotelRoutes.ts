import { Router } from "express";
import { getHotelById, getHotels } from "../controllers/hotelController";

const router = Router();

router.get("/hotels", getHotels);
router.get("/hotels/:id", getHotelById);

export default router;

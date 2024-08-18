// src/app.ts
import express from "express";
import hotelRoutes from "./routes/hotelRoutes";

const app = express();

app.use(express.json());
app.use("/api", hotelRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;

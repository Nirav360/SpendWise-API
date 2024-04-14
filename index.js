import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/dbConnection.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(cookieParser());

//routes import
import userRouter from "./routes/userRoutes.js";

app.use("/", userRouter);
app.use(errorMiddleware);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

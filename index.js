import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./src/config/dbConnection.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorMiddleware } from "./src/middleware/errorMiddleware.js";

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: [
      "https://spendwise-frontend-p8do.onrender.com",
      "http://localhost:5173",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());
app.use(cookieParser());

//routes import
import userRouter from "./src/routes/userRoutes.js";
import transactionRouter from "./src/routes/transactionRoutes.js";
import insightsRouter from "./src/routes/insightsRoutes.js";

app.use("/", userRouter);
app.use("/", transactionRouter);
app.use("/", insightsRouter);

app.use(errorMiddleware);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

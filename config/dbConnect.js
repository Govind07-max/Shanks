import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
dotenv.config();

const connectDB = asyncHandler(async () => {
  try {
    const connect = await mongoose.connect(process.env.DB_CONNECTION_STRING);

    console.log("Database connected: ", connect.connection.name);
  } catch (error) {
    console.error("Error connecting to the database: ", error.message);
    throw new Error("Failed to connect to the database");
  }
});

export { connectDB };

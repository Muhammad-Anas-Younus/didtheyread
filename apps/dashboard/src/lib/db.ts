import mongoose from "mongoose";

export const connectToDB = async () => {
  if (mongoose.connection.readyState) {
    console.log("Already connected to the database.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URL!);
    console.log("Successfully connected to the database.");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw new Error("Database connection error");
  }
};

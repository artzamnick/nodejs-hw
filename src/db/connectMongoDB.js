import mongoose from "mongoose";

export const connectMongoDB = async () => {
  const mongoUrl = process.env.MONGO_URL;

  await mongoose.connect(mongoUrl);

  console.log("MongoDB connection established successfully");
};

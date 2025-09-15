import mongoose, { mongo } from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error ${error.mongoose}`);
    process.exit(1); // code 1 for failure || 0 for success
  }
};

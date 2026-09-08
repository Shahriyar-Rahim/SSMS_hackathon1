import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI;

    const conn = await mongoose.connect(mongoURI);
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[DB Error] ${error.message}`);
    process.exit(1);
  }
};

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async (): Promise<void> => {

  const uri = process.env.MONGODB_URI;
  console.log(uri);
  if (uri) {
    try {
      console.log(`[DB] Attempting connection to MongoDB at: ${uri}`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
      console.log("[DB] Successfully connected to persistent MongoDB.");
      return;
    } catch (err: any) {
      console.warn(`[DB] Could not connect to primary MONGODB_URI: ${err.message}`);
      console.log("[DB] Falling back to embedded MongoMemoryServer for development...");
    }
  }

  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Connected to embedded in-memory MongoDB instance: ${memoryUri}`);
  } catch (memErr: any) {
    console.error("[DB] Failed to initialize embedded MongoDB:", memErr.message);
    throw memErr;
  }
};


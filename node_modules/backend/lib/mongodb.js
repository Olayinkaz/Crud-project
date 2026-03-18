import mongoose from "mongoose";

const globalForMongoose = globalThis;

if (!globalForMongoose.__mongoose) {
  globalForMongoose.__mongoose = {
    conn: null,
    promise: null,
  };
}

export default async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined.");
  }

  const cached = globalForMongoose.__mongoose;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

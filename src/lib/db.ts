import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string | undefined;

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached = (global as any).mongoose as MongooseCache | undefined;

if (!cached) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).mongoose = { conn: null, promise: null } as MongooseCache;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cached = (global as any).mongoose as MongooseCache;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI");
  }
  if (cached?.conn) return cached.conn;
  if (!cached?.promise) {
    cached!.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: process.env.MONGODB_DB || undefined,
      })
      .then((mongooseInstance) => mongooseInstance);
  }
  cached!.conn = await cached!.promise;
  return cached!.conn!;
}
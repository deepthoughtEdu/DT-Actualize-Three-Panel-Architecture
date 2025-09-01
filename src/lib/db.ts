import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "myapp";

// let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
  if (!db) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("✅ MongoDB connected");
  }
  return db;
}

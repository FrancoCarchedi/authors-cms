import "../lib/envConfig";
import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!dbName) throw new Error("MONGODB_DB is not set");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const cols = await db.listCollections().toArray();
  for (const c of cols) {
    await db.dropCollection(c.name);
    console.log(`✓ Dropped: ${c.name}`);
  }

  await client.close();
  console.log("\nAll collections dropped.");
}

main().catch(console.error);

import "../lib/envConfig";
import { MongoClient } from "mongodb";
import { createAllIndexes, listAllIndexes } from "../lib/db-indexes";

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) throw new Error("MONGODB_URI environment variable is not set");
  if (!dbName) throw new Error("MONGODB_DB environment variable is not set");

  console.log(`Connecting to MongoDB...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully!\n");

    const db = client.db(dbName);

    // Ensure collections exist
    const existing = await db.listCollections().toArray();
    const existingNames = new Set(existing.map((c) => c.name));

    const requiredCollections = ["users", "sessions", "accounts", "authors", "articles"];

    for (const name of requiredCollections) {
      if (!existingNames.has(name)) {
        await db.createCollection(name);
        console.log(`✓ Created collection: ${name}`);
      } else {
        console.log(`  Collection already exists: ${name}`);
      }
    }

    // Create indexes
    console.log("");
    await createAllIndexes(db);

    // List all indexes for verification
    await listAllIndexes(db);

    console.log("\nDatabase initialization completed successfully!");
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

main().catch((err) => {
  console.error("Fatal error during DB initialization:", err);
  process.exit(1);
});

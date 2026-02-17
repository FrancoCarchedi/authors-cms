import { Db, IndexSpecification } from "mongodb";

const userIndexes: { spec: IndexSpecification; options?: object }[] = [
  {
    spec: { email: 1 },
    options: { unique: true, name: "email_unique" },
  },
];

const authorIndexes: { spec: IndexSpecification; options?: object }[] = [
  {
    spec: { "user.id": 1 },
    options: { unique: true, name: "user_id_unique" },
  },
  {
    spec: { "user.name": 1 },
    options: { name: "user_name_index" },
  },
];

const articleIndexes: { spec: IndexSpecification; options?: object }[] = [
  {
    spec: { slug: 1 },
    options: { unique: true, name: "slug_unique" },
  },
  {
    // Índice compuesto: listar artículos de un autor ordenados por fecha
    spec: { authorId: 1, createdAt: -1 },
    options: { name: "author_created" },
  },
  {
    // Índice de texto para búsqueda full-text
    spec: {
      title: "text",
      text: "text",
      "author.name": "text",
    },
    options: {
      name: "article_text_search",
      weights: {
        title: 10,
        "author.name": 5,
        text: 1,
      },
      default_language: "spanish",
    },
  },
];

async function createCollectionIndexes(
  db: Db,
  collectionName: string,
  indexes: { spec: IndexSpecification; options?: object }[]
): Promise<void> {
  const collection = db.collection(collectionName);

  console.log(`Creating indexes for collection: ${collectionName}`);

  for (const { spec, options } of indexes) {
    try {
      const indexName = await collection.createIndex(spec, options);
      console.log(`  ✓ Created index: ${indexName}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`  ✗ Error creating index:`, error.message);
      } else {
        console.error(`  ✗ Error creating index:`, error);
      }
    }
  }
}

export async function createAllIndexes(db: Db): Promise<void> {
  console.log("==========================================");
  console.log("Starting index creation...");
  console.log("==========================================\n");

  try {
    await createCollectionIndexes(db, "users", userIndexes);
    await createCollectionIndexes(db, "authors", authorIndexes);
    await createCollectionIndexes(db, "articles", articleIndexes);

    console.log("\n==========================================");
    console.log("Index creation completed!");
    console.log("==========================================");
  } catch (error) {
    console.error("\n==========================================");
    console.error("Error during index creation:");
    console.error(error);
    console.error("==========================================");
    throw error;
  }
}

export async function listCollectionIndexes(
  db: Db,
  collectionName: string
): Promise<void> {
  const collection = db.collection(collectionName);
  const indexes = await collection.listIndexes().toArray();

  console.log(`\nIndexes for ${collectionName}:`);
  indexes.forEach((index) => {
    console.log(`  - ${index.name}:`, JSON.stringify(index.key));
  });
}

export async function listAllIndexes(db: Db): Promise<void> {
  console.log("\n==========================================");
  console.log("Current Database Indexes");
  console.log("==========================================");

  await listCollectionIndexes(db, "users");
  await listCollectionIndexes(db, "authors");
  await listCollectionIndexes(db, "articles");

  console.log("\n==========================================");
}

export async function dropCollectionIndexes(
  db: Db,
  collectionName: string
): Promise<void> {
  const collection = db.collection(collectionName);
  try {
    await collection.dropIndexes();
    console.log(`✓ Dropped all indexes from: ${collectionName}`);
  } catch (error) {
    console.error(`✗ Error dropping indexes from ${collectionName}:`, error);
  }
}

import { Db, IndexSpecification } from "mongodb";

/**
 * Definición de índices para la colección de usuarios
 */
const userIndexes: { spec: IndexSpecification; options?: object }[] = [
  {
    spec: { email: 1 },
    options: { unique: true, name: "email_unique" },
  },
  {
    spec: { createdAt: -1 },
    options: { name: "created_at_desc" },
  },
];

/**
 * Definición de índices para la colección de autores
 */
const authorIndexes: { spec: IndexSpecification; options?: object }[] = [
  {
    spec: { "user.id": 1 },
    options: { unique: true, name: "user_id_unique" },
  },
  {
    spec: { publishedArticles: -1 },
    options: { name: "published_articles_desc" },
  },
  {
    spec: { "user.name": 1 },
    options: { name: "user_name_index" },
  },
  {
    spec: { createdAt: -1 },
    options: { name: "created_at_desc" },
  },
];

/**
 * Definición de índices para la colección de artículos
 */
const articleIndexes: { spec: IndexSpecification; options?: object }[] = [
  {
    spec: { slug: 1 },
    options: { unique: true, name: "slug_unique" },
  },
  {
    // Índice compuesto para queries comunes: listar artículos de un autor
    spec: { authorId: 1, isPublished: 1, createdAt: -1 },
    options: { name: "author_published_created" },
  },
  {
    // Índice para filtrar por estado de publicación
    spec: { isPublished: 1, createdAt: -1 },
    options: { name: "published_created" },
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
  {
    spec: { authorId: 1 },
    options: { name: "author_id_index" },
  },
  {
    spec: { createdAt: -1 },
    options: { name: "created_at_desc" },
  },
];

/**
 * Crea todos los índices para una colección específica
 */
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

/**
 * Crea todos los índices necesarios en la base de datos
 */
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

/**
 * Lista todos los índices existentes en una colección
 */
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

/**
 * Lista todos los índices de todas las colecciones
 */
export async function listAllIndexes(db: Db): Promise<void> {
  console.log("\n==========================================");
  console.log("Current Database Indexes");
  console.log("==========================================");

  await listCollectionIndexes(db, "users");
  await listCollectionIndexes(db, "authors");
  await listCollectionIndexes(db, "articles");

  console.log("\n==========================================");
}

/**
 * Elimina todos los índices de una colección (excepto _id)
 */
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

import { mongoClientPromise } from './mongo';
import './envConfig';

export async function getDb() {
  const client = await mongoClientPromise;
  const dbName = process.env.MONGODB_DB;
  if (!dbName) throw new Error('MONGODB_DB environment variable is not set');
  return client.db(dbName);
}
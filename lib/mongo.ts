import { MongoClient } from 'mongodb';
import './envConfig';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI environment variable is not set');

declare global {
  var _mongoClientPromise: Promise<MongoClient> | null;
}

const client = new MongoClient(uri);

export const mongoClientPromise =
  global._mongoClientPromise ?? (global._mongoClientPromise = client.connect());
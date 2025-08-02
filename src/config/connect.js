import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.URL_DATABASE;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME;

let db;

async function connect() {
  await client.connect();
  db = client.db(dbName);
  console.log("MongoDB conectado");
  return db;
}

function getDB() {
  if (!db) throw new Error("Conexão com DB não estabelecida");
  return db;
}

export { connect, getDB };

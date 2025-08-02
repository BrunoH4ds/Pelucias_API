import { getDB } from "../config/connect.js";
import { ObjectId } from "mongodb";

const collectionName = "Noticias";

async function findAll() {
  return getDB().collection(collectionName).find({}).toArray();
}

async function insertOne(noticia) {
  return getDB().collection(collectionName).insertOne(noticia);
}

async function updateOne(id, updateData) {
  return getDB()
    .collection(collectionName)
    .updateOne({ _id: new ObjectId(id) }, { $set: updateData });
}

async function deleteOne(id) {
  return getDB()
    .collection(collectionName)
    .deleteOne({ _id: new ObjectId(id) });
}

async function findById(id) {
  return getDB().collection(collectionName).findOne({ _id: new ObjectId(id) });
}

export { findAll, insertOne, updateOne, deleteOne, findById };

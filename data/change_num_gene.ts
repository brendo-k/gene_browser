const { MongoClient } = require("mongodb");
const uri: string = 'mongodb://127.0.0.1:27017/';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('genome');
    const collection = database.collection('gene');
    const update_doc = {
      $set: {
        start: "$start",
        end: "$end",
      }
    }
    collection.update({}, update_doc);

  } finally {
    await client.close();
  }
}

run().catch(console.dir);

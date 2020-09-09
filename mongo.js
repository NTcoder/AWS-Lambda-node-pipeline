require('dotenv').config({ path: './function/.env' })
// Mongog DB

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://" + process.env.MDB_USERNAME + ":" + process.env.MDB_PASSWORD + "@"+ process.env.MDB_CLUSTER +".5w4qu.mongodb.net/" + process.env.MDB_NAME + "?retryWrites=true&w=majority";
var getDbAll = function(){
  console.log('## Trying MongoDB connection');
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  client.connect(err => {
    if (err) throw err;
    console.log('## MongoDB connected');
    //const db = client.db(process.env.MDB_NAME);
    const collection = client.db(process.env.MDB_NAME).collection(process.env.MDB_COLLECTION);
    // perform actions on the collection object
    collection.find({}).toArray(function(erro, result) {
      if (erro) throw erro;
      console.log(result);
      client.close();
      //return result
    });
        //db.collection(process.env.MDB_COLLECTION).find({})
    //collection.insertOne({"hello": "covillatemp"},closeDB)    
  });
}
getDbAll();

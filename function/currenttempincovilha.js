const AWS = require('aws-sdk')
// Create client outside of handler to reuse
const lambda = new AWS.Lambda()
require('dotenv').config({ path: '.env' })
const DEVICE_NAME = "Covilha"
// Mongog DB Settings and init

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://" + process.env.MDB_USERNAME + ":" + process.env.MDB_PASSWORD + "@"+ process.env.MDB_CLUSTER +".5w4qu.mongodb.net/" + process.env.MDB_NAME + "?retryWrites=true&w=majority";


// Handler
exports.handler = function(event, context, lamdaresponse) {
  //console.log('## ENVIRONMENT VARIABLES: ' + JSON.stringify(process.env))
  //console.log('## CONTEXT: ' + serialize(context))
  //console.log('## EVENT: ' + serialize(event))
  try {
    console.log('## Trying MongoDB connection');
    //console.log(uri);
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {

      console.log('## MongoDB connected');
      //const db = client.db(process.env.MDB_NAME);
      const collection = client.db(process.env.MDB_NAME).collection(process.env.MDB_COLLECTION);
      var ts_int_now = Math.floor(new Date() / 1000)
      console.log("Looking for data at : " + ts_int_now);
      // perform actions on the collection object

      // fetch the bucket for which current time falls between first and last timestamp of the bucket
      let query = {last:{$gte:ts_int_now}, first:{$lte:ts_int_now}, device:DEVICE_NAME};
      collection.find(query).project({_id:0,device:1,first:1,last:1,samples:1}).toArray(function(erro, result) {

        // result object should be a valid JSON

        //console.log(result);
        resultIterator(result,lamdaresponse,client,ts_int_now)
      });
      //db.collection(process.env.MDB_COLLECTION).find({})
      //collection.insertOne({"hello": "covillatemp"},closeDB)    
    });
  } catch(error) {
    console.log(error);
    return formatError(error)
  }
}

var resultIterator = function(result,cbresultIterator,client,ts_int_now){
  // var last_max = 0
  // var document_last
  // for (var i in result){
  //   if (last_max < result[i]["last"]){
  //       last_max = result[i]["last"]
  //       document_last = result[i]
  //   }
  // }
  var samples = result[0]['samples'].slice().reverse()
  //console.log(samples)
  samples.forEach(function(sample){
    //console.log(sample)
    if (sample[ts_int_now.toString()]){
      console.log(sample[ts_int_now.toString()])
      var response_success = formatResponse(sample);
      client.close();
      //lamdaresponse()
      cbresultIterator(null,response_success)
    }
  });

}
var formatResponse = function(body){
  var response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    isBase64Encoded: false,
    multiValueHeaders: { 
      "X-Custom-Header": ["My value", "My other value"],
    },
    body: JSON.stringify(body)
  }
  //console.log(response);
  return response
}

var formatError = function(error){
  var response = {
    "statusCode": error.statusCode,
    "headers": {
      "Content-Type": "text/plain",
      "x-amzn-ErrorType": error.code
    },
    "isBase64Encoded": false,
    "body": error.code + ": " + error.message
  }
  return response
}
/*
// Use SDK client
var getAccountSettings = function(){
  return lambda.getAccountSettings().promise()
}
*/
const AWS = require('aws-sdk')
// Create client outside of handler to reuse
const lambda = new AWS.Lambda()
require('dotenv').config({ path: '.env' })
const DEVICE_NAME = "Sfax"

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

      // calculate stast time of the window
      var ts_int_pasthour = ts_int_now - parseInt(process.env.AVG_WINDOW)
      console.log("Looking for data between : " + ts_int_pasthour + " : " + ts_int_now);

      // fetch all buckets for a particular device which contain data of the past window

      let query = {last:{$gte:ts_int_pasthour}, first:{$lte:ts_int_now}, device:DEVICE_NAME};
      // perform actions on the collection object
      collection.find(query).project({_id:0,device:1,first:1,last:1,samples:1}).toArray(function(erro, result) {

        // result object should be a valid JSON

        //console.log(result);
        resultIterator(result,lamdaresponse,client,ts_int_now,ts_int_pasthour)
      });
      //db.collection(process.env.MDB_COLLECTION).find({})
      //collection.insertOne({"hello": "covillatemp"},closeDB)    
    });
  } catch(error) {
    console.log(error);
    return formatError(error)
  }
}

var resultIterator = function(result,cbresultIterator,client,ts_int_now,ts_int_pasthour){
  var sample_sum = 0;
  var sample_count = 0;
  // iteration count depends on the amount of data, maximum 18 (+1) because 200 samples for one bucket and max can be 18 for 3600 seconds
  for (var i in result){
    // iterate over the samples key, can go upto max 200
    result[i]['samples'].forEach(function(sample){
      // iterate over only one key
      Object.keys(sample).forEach(function(key) {
        // compute this over max 3600 samples, inclusive of past hour timestamp and exclusive of current hour timestamp [onehour_back : current time)
        if (parseInt(key) < ts_int_now && parseInt(key) >= ts_int_pasthour){
          sample_sum = sample_sum + parseInt(sample[key])
          sample_count = sample_count + 1
        }
      })
    })
  }
  //console.log(sample_sum);
  if (sample_count != 0){
    var avg = sample_sum/sample_count
  }
  var computed_result = {
    avg : avg,
    samples : sample_count,
    compute_ts :ts_int_now,
    compute_window : parseInt(process.env.AVG_WINDOW)
  }
  console.log(computed_result);

  var response_success = formatResponse(computed_result);
  client.close();
  //lamdaresponse()
  cbresultIterator(null,response_success)
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
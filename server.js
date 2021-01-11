const mongo = require("mongodb");
const express = require("express");
const bodyParser  = require("body-parser");

//set up app middleware 
const app = express();
app.use(bodyParser.json());

//set up db client
const mongo_url = 'mongodb://127.0.0.1:27017';
const db_client = new mongo.MongoClient(mongo_url);
app.use(express.static("./dist/gene-browser"));

try{
  db_client.connect(() => {
    const db = db_client.db("genome");
    const gene_collection = db.collection("gene");
    const dna_collection = db.collection("dna");

    app.get('/api/gene', (req, res) => {
      console.log('request recieved');
      let start = parseInt(req.query.start);
      let end = parseInt(req.query.end);
      let chromosome = req.query.chromosome;
      if (start == null || end == null){
        throw new Error('query parameters broken');
      }

      let cursor = gene_collection.find({start: {$lt: end}, end: {$gt: start}, chromosome_num: chromosome});
      cursor.toArray().then((value) => res.send(value));


    });

    var server = app.listen(8080, () => {
      var port = server.address().port;
      console.log("App now running on port", port);
    });
  });
} catch {
  db_client.close();
}


function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
}


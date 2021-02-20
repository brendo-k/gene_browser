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
    const mRNA_collection = db.collection('mrna');
    const exon_collection = db.collection('exon');

    //HTTP request handler for getting genes in range
    app.get('/api/gene', (req, res) => {
      let start = parseInt(req.query.start);
      let end = parseInt(req.query.end);
      let chromosome = req.query.chromosome;
      if (start == null || end == null || chromosome == null){

        throw new Error(`Query parameters broken: ${start} ${end} ${chromosome}`);
      }
      let query = '{start: {$lt: end}, end: {$gt: start}, chromosome_num: chromosome}'
      console.log(query);

      //mongoDB query on gene collection 
      let cursor = gene_collection.find({start: {$lt: end}, end: {$gt: start}, chromosome_num: chromosome});
      //convert cursor to array and send as http response
      cursor.toArray().then((value) => res.send(value));
      
    });

    //HTTP request for getting gene transcripts from gene id
    app.get('/api/mRNA', (req, res) => {
      let gene = req.query.gene;
      let chromosome = req.query.chromosome;
      if (gene == null){
        throw new Error(`Query parameters broken from mRNA: ${gene}`);
      }

      //mongoDB query on gene collection 
      let cursor = mRNA_collection.find({chromosome_num: chromosome, gene: gene});
      //convert cursor to array and send as http response
      cursor.toArray().then((value) => res.send(value));
    });

    //HTTP request for getting gene transcripts from gene id
    app.get('/api/exon', (req, res) => {
      let mRNA = req.query.mRNA;
      let chromosome = req.query.chromosome;
      if (mRNA == null){
        throw new Error(`Query parameters broken from exon: ${mRNA}`);
      }

      //mongoDB query on gene collection 
      let cursor = exon_collection.find({chromosome_num: chromosome, mrna: mRNA});
      //convert cursor to array and send as http response
      cursor.toArray().then((value) => res.send(value));
    });

    app.get('/api/dna', (req, res) => {
      let start = parseInt(req.query.start);
      let end = parseInt(req.query.end);
      let chromosome = req.query.chromosome;
      if (start == null){
        throw new Error(`Query parameters broken dna: ${start}`);
      }
      if (end == null){
        throw new Error(`Query parameters broken dna: ${end}`);
      }
      if (chromosome == null){
        throw new Error(`Query parameters broken dna: ${chromosome}`);
      }

      //mongoDB query on gene collection 
      let query = {start: {$lt: end}, end: {$gt: start}, chromosome: chromosome}
      let cursor = dna_collection.find(query);
      //convert cursor to array and send as http response
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


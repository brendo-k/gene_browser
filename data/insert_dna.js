//adding dependencies
const { MongoClient } = require("mongodb");
const fs = require('fs');
const lineReader = require('line-reader');
const parse = require('./parse_list').parse;


const client = new MongoClient('mongodb://127.0.0.1:27017/' );
//connecting to database
client.connect(function(err, client){
  //error if connecting
  if(err){ 
    throw err;
  }
  //connected
  console.log("sucessfully connected");

  //get the databaase genome
  var db = client.db('genome');
  //get the collection genes
  var dna_collection = db.collection('dna');
  
  fs.readdir(__dirname + "/raw_data", function(err, files){
    //getting the read stream for the gene file
    let counter = 0
    for (let i = 0; i < files.length; i++){

      //read lines on at a time
      var fileName = __dirname + "/raw_data/" + files[i];
      if(fileName.match(/\w+.fa/) != null&& files[i] != 'test.gff3'){
        console.log(`started ${fileName}`);
        let chromosome = fileName.match(/chromosome\.(.+)\.fa/)[1]
        insert_dna(fileName, chromosome, dna_collection).then((val) => {
          counter += 1;
          if (counter == files.length){
            console.log("done insertions");
            client.close();
          }
        });
      }else{
        counter += 1
      }

    }

  });
});

function insert_dna(file, chromosome, collection){
  return new Promise((resolve, reject) => {
    let first = true;
    let start = 1;
    let counter = 0;
    let dna = "";
    lineReader.eachLine(file, (line, last) => {
      if(first){
        first = false;
      }else{
        counter += 1;
        dna += line;
        if(counter == 10 || last){
          let res = {
            start: start,
            end: start + dna.length - 1,
            dna: dna,
            chromosome: chromosome,
          }
          //console.log(res);
          collection.insertOne(res);
          start = res.end + 1;
          dna = "";
          counter = 0;
          if(last){
            console.log(`done chromosome ${chromosome}`);
            resolve(1);
          }
        }

      }
    });
  
  });
}


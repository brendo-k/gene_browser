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
  var gene_collection = db.collection('gene');
  
  fs.readdir(__dirname + "/raw_data", function(err, files){
    //getting the read stream for the gene file
    let counter = 0
    for (let i = 0; i < files.length; i++){

      //read lines on at a time
      var fileName = __dirname + "/raw_data/" + files[i];
      if(files[i].match(/\w+.gff3/) != null && files[i] != 'test.gff3'){
        console.log(`started ${fileName}`);

        lineReader.eachLine(fileName, function(line, last){
          if(line[0] != '#'){
            var splitted = line.split("\t");
            var info = splitted[splitted.length-1];
            splitted[splitted.length-1] = info.split(";");
            if(splitted[2] == 'gene'){
              gene_collection.insertOne(parse(splitted));
            }
          }

          if(last){
            counter += 1;
            console.log(`done ${counter}`);
            if(counter == files.length){
              console.log('finished');
              client.close();
            }
          }
        });


      }else{
        counter += 1
      }

    }

  });
});



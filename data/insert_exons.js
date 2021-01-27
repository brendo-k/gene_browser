//adding dependencies
const { MongoClient } = require("mongodb");
const fs = require('fs');
const lineReader = require('line-reader');
const parse = require('./parse_list').parse;


const client = new MongoClient('mongodb://127.0.0.1:27017/', );
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
  var exon = db.collection('exon');

  //read directory
  fs.readdir(__dirname + "/raw_data", function(err, files){
    //getting the read stream for the gene file
    let counter = 0;
    for (let i = 0; i < files.length; i++){

      if(files[i].match(/\w+.gff3/) == null || files[i] == 'test.gff3'){
        counter += 1;
        continue;
      }

      //read lines on at a time
      var fileName = __dirname + "/raw_data/" + files[i];
      console.log(`started ${fileName}`);
      lineReader.eachLine(fileName, function(line, last){
        if(line[0] != '#'){
          var splitted = line.split("\t");
          if (splitted[2] == 'exon'){
            var json = {};
            var headers = ["chromosome_num", "source", "gene", "start", "end", "score", 
              "strand", "phase", "attributes"];

            for(let i = 0; i < splitted.length; i++){
              //skip if it is mRNA
              if(i == 2){
                continue;
              }
              json[headers[i]] = splitted[i] 
            }
            json.attributes = json.attributes.split(';');
            json._id = json.attributes[1].split("=")[1];
            json.mrna = json.attributes[0].split("=")[1].substring(11);
            exon.insertOne(json).catch((err) => {})

          }
        }


        if(last){
          console.log(`done file: ${counter}`)
          counter += 1;
          if(counter == files.length){
            client.close();
          }
        }
      });
    }

  });

});

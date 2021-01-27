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
  var mRNA = db.collection('mrna');

  //read directory
  fs.readdir(__dirname + "/raw_data", function(err, files){
    //getting the read stream for the gene file
    let counter = 0;
    for (let i = 0; i < files.length; i++){
      if(files[i].match(/\w+.gff3/) == null || files[i]=="test.gff3"){
        counter += 1;
        continue;
      }
      //read lines on at a time
      var fileName = __dirname + "/raw_data/" + files[i];
      console.log(`started ${fileName}`);
      var gene = [];

      var dict = new Map();
      lineReader.eachLine(fileName, function(line, last)
      {
        if(line[0] != '#')
        {
          var splitted = line.split("\t");


          if (splitted[2] == 'mRNA')
          {
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
            json._id = json.attributes[0].split("=")[1].substring(11);
            json.gene = json.attributes[1].split("=")[1].substring(5);
            if(dict.has(json.chromosome_num)){
              dict.set(json.chromosome_num, dict.get(json.chromosome_num) + 1);
            }else{
              dict.set(json.chromosome_num, 1);
            }

            mRNA.insertOne(json);
          }
        }

        if(last){
          counter += 1
          console.log('done counter');
          if (counter == files.length){
            console.log(dict)
            client.close();
          }
        }


      });

    }

  });
});



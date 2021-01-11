//adding dependencies
const { MongoClient } = require("mongodb");
const fs = require('fs');
const lineReader = require('line-reader');
const parse = require('./parse_list').parse;
const process = require('process');


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
    var gene_collection = db.collection('gene');
    var dna_collection = db.collection('dna'); 
    gene_data = {};
    fs.readdir(__dirname + "/raw_data", function(err, files){
        //getting the read stream for the gene file
        for (let i = 0; i < files.length; i++){
            
            //read lines on at a time
            var fileName = __dirname + "/raw_data/" + files[i];
            console.log(`started ${fileName}`);
            lineReader.eachLine(fileName, function(line, last){

                if(files[i].match(/\w+.gff3/) != null){
                    if(line[0] != '#'){
                        var splitted = line.split("\t");
                        var info = splitted[splitted.length-1];
                        splitted[splitted.length-1] = info.split(";");
                        if(splitted[2] == 'gene'){
                            gene_collection.insertOne(parse(splitted));
                        }
                    }

                }else{
                    var num = files[i].match(/chromosome\.(.+)\.fa/);
                    if(line[0] == '>'){
                        gene_data[num[1]] = [];
                    }else{
                        gene_data[num[1]].push(line); 
                    }
                    if(last){
                        var chromosome = num[1];
                        var chromosome_data = gene_data[num[1]].join("");
                        var sub_sequences = chromosome_data.match(/.{1,1000}/g);
                        var lower_bound = [];
                        var upper_bound = [];
                        
                        for(let i = 0; i < sub_sequences.length; i++){
                            lower_bound[i] = 1 + 1000*i;
                            upper_bound[i] = 1000*(i+1);
                        }
                        
                        upper_bound[sub_sequences.length-1] = chromosome_data.length;

                        for(let i = 0; i < sub_sequences.length; i++){

                            var data = {};
                            data.chromosome = chromosome; 
                            data.lower_bound = lower_bound[i];
                            data.upper_bound = upper_bound[i];
                            data.sequence = sub_sequences[i];

                            dna_collection.insertOne(data);

                        }
                    }
                }
                if(last && i === files.length - 1){
                    console.log("done :", files[i]);
                    if(i == files.length - 1){
                        console.log('done');
                        client.close();
                    }
                }


            });

        }

    });
});



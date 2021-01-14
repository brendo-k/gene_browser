
var parse = function(list){

  var json = {};
  var headers = ["chromosome_num", "source", "gene_name", "start", "end", "score", 
    "strand", "phase", "attributes"];

  for(let i = 0; i < list.length; i++){
    json[headers[i]] = list[i] 
  }
  json.gene_name = json.attributes[1].split("=")[1]; 
  json._id = json.attributes[0].split("=")[1].substring(5);
  json.start = parseInt(json.start);
  json.end = parseInt(json.end);


  return json;
}

exports.parse = parse;

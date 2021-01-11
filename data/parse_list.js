
var parse = function(list){

    var json = {};
    var headers = ["chromosome_num", "source", "gene_name", "start", "end", "score", 
                    "strand", "phase", "attributes"];

    for(let i = 0; i < list.length; i++){
       json[headers[i]] = list[i] 
    }
    json.gene_name = json.attributes[1].split("=")[1]; 

    return json;
}

exports.parse = parse;

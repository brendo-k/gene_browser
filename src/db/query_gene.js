const MongoClient = require("mongoDB").MongoClient;


exports.query_gene = function(query){

    const client = new MongoClient('mongodb://127.0.0.1:27017/' );
    //connecting to database
    async function run(){
        try{
            await client.connect();

            var db = await client.db("genome");
            console.log("successfullly connected");

            var gene_collection = await db.collection('genes');

            var result = await gene_collection.findOne({Gene: query});

            console.log(result);

        } finally{
            
            await client.close();
        }
    }

    run().catch(console.dir);

};


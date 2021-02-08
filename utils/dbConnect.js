const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(process.env.MONGODB_LOCAL_INSTANCE_URL, {useUnifiedTopology: true});

(async function connectToDb() {
  await client.connect()
})();

//returns an instance of db
module.exports = {
  client
};


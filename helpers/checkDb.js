const client = require('../utils/dbConnect').client;

module.exports = () => {
  return new Promise(async resolve => {
    await client.connect();

    async function checkDbEmpty() {
      console.log('--CheckingDB: Looking for a data ...')
      const dataAny = await client.db(process.env.MONGODB_DEV_DBNAME).collection('orders').find({}).count();
      if (dataAny) {
        console.log('--CheckingDB: DB is NOT empty')
        resolve(false)
      } else {
        console.log('--CheckingDB: DB is empty')
        resolve(true)
      }
    }

    await checkDbEmpty()
  })
}


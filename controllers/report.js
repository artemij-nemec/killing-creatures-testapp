const client = require('../utils/dbConnect').client

module.exports = {
  //handle a report request
  async getFreshReport(req, res) {
    try {
      const report = await client.db('test').collection('reports')
        .aggregate([{$project: {_id:0,bestSellers: 1}}]).sort({_id: -1}).limit(1).toArray();
      res.status(200).json(report[0])
    } catch (err) {
      console.error(err.message)
      res.status(500).json(err)
    }
  }
};
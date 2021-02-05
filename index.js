require('dotenv').config()
//web api server imports
const express = require('express');
const app = express();
const router = require('./routes/index');

//workers imports
const path = require('path');
const Bree = require('bree');
const isDbEmpty = require('./helpers/checkDb');
const parseAndLoadToDb = require('./utils/parser');
//bree logger for extended data about job
const Graceful = require('@ladjs/graceful');
const Cabin = require('cabin');

//bree worker configuration
const bree = new Bree({
  logger: new Cabin(),
  jobs: [
    {
      name: 'make a report',
      path: path.join(__dirname, 'jobs', 'makeReport.js'),
      interval: '1day'
    }
  ]
});

const graceful = new Graceful({brees: [bree]});
graceful.listen();

//launch web server
app.use(express.json())
app.use('/api/v01',router)

app.listen(process.env.WEB_API_PORT,()=>{
  console.log(`web server is running on port: ${process.env.WEB_API_PORT || 5000}`)
})

async function checkDbForData() {
  console.log('---DB init: Checking data presence')
  await isDbEmpty()
    .then(async result => {
      if (result) {
        console.log('---DB init: Inserting data')
        await parseAndLoadToDb()
      }
    })

  console.log('---DB init: Database is ready')
  return('dbIsReady')
}


async function mainWorkerBranch() {
  const dataBaseReady = await checkDbForData()
  if (dataBaseReady) {
    console.log('---Launching workers---')
    bree.start();
    bree.run('make a report')
  }
}

//launch scheduled jobs
mainWorkerBranch()

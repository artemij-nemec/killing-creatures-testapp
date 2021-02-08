require('dotenv').config();
const client = require('../utils/dbConnect').client;
const parentPort = require("worker_threads").parentPort;

const DAYS30 = 30;
const DAYS90 = 90;
const DAYS180 = 180;
const DAYS365 = 365;
const reportPeriods = [DAYS30, DAYS90, DAYS180, DAYS365];

//prepare report for a period
function makeReportForPeriod(period,dbName,collectionName) {

  return new Promise(async (resolve,reject) => {
    const variants = ['S','M','L','XL']

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - period);

    //fetch and aggregate data within a period
    let data;
    try {
       data = await client.db(dbName).collection(collectionName).aggregate([
        {
          $match: {
            "order.orderDate": {
              $gte: start.toISOString(),
              $lt: end.toISOString()
            }
          }
        },
        {
          "$group": {
            "_id": {
              "productId": "$productId",
              "variant": "$variant",

            },
            "sales": {
              $sum: 1
            },
            "priceSum": {
              $sum: "$order.price"
            }
          }
        }
      ], {allowDiskUse: true}).toArray()
    } catch (err) {
      reject(new Error('DB connection error'))
    }


    //prepare report for a period
    const periodSummary = await Promise.all(variants.map(async period => await makeReportVariantBestseller(data,period)))

    //container for report with results within period
    let middleResult = {};

    for (let part of periodSummary) {
      middleResult = {
        ...middleResult, ...part
      }
    }

    resolve({[period + 'days']: {...middleResult}})
  })
}

//prepare report for a variant
async function makeReportVariantBestseller(data,variantString) {
  return new Promise (async (resolve,reject) => {
    if (!data.length || typeof data === 'string') reject(new Error('TypeError: Data must be an Array.'))
    //filter data by variant
    let onlyOneVariant = data.filter(obj => obj._id.variant === variantString)
    //find product with maxSales
    let maxSales = onlyOneVariant.reduce((max, item) => max.sales > item.sales ? max : item)
    //prepare report for variant
    const obj = {
      [variantString]: {
        productId: maxSales._id.productId,
        cashFlow: maxSales.priceSum,
        sales: maxSales.sales
      }
    };
    resolve (obj)
  })
}

//write report to db
async function writeDocumentToDb(client,data,dbName,collectionName) {
  client.db(dbName).collection(collectionName).insertOne({['bestSellers']: {...data}})
}



//main function to make a report
(async function () {
  //await client.connect();

  const reportSummary = await Promise.all(reportPeriods.map(async period => await makeReportForPeriod(
    period,
    process.env.MONGODB_DEV_DBNAME,
    process.env.MONGODB_DEV_ORDER_COLLECTION_NAME
  )))

  let result = {}

  for (let part of reportSummary) {result = {...result, ...part}}

  await writeDocumentToDb(client,result,process.env.MONGODB_DEV_DBNAME,process.env.MONGODB_DEV_REPORT_COLLECTION_NAME)

  if (parentPort) parentPort.postMessage("done")
  else process.exit(0);
})();

module.exports = {
  makeReportForPeriod,
  makeReportVariantBestseller,
  writeDocumentToDb
}
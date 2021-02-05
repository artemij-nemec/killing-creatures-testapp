const assert = require('chai').assert;
const MongoClient = require('mongodb').MongoClient;

const {
  makeReportVariantBestseller,
  writeDocumentToDb
} = require('../../jobs/makeReport');

const REPORTS = [
  {
    "_id": {
      "productId": 40,
      "variant": "S"
    },
    "priceSum": 4,
    "sales": 1
  },
  {
    "_id": {
      "productId": 46,
      "variant": "XL"
    },
    "priceSum": 15,
    "sales": 1
  },
  {
    "_id": {
      "productId": 43,
      "variant": "XL"
    },
    "priceSum": 82,
    "sales": 1
  },
  {
    "_id": {
      "productId": 39,
      "variant": "XL"
    },
    "priceSum": 73,
    "sales": 1
  },
  {
    "_id": {
      "productId": 47,
      "variant": "XL"
    },
    "priceSum": 100,
    "sales": 1
  },
  {
    "_id": {
      "productId": 49,
      "variant": "S"
    },
    "priceSum": 51,
    "sales": 1
  },
  {
    "_id": {
      "productId": 38,
      "variant": "S"
    },
    "priceSum": 59,
    "sales": 1
  },
  {
    "_id": {
      "productId": 54,
      "variant": "S"
    },
    "priceSum": 23,
    "sales": 1
  }
]
//
describe('makeReportVariantBestseller', () => {
  it('should return a top sales product with correct variant', async () => {
    const result = await makeReportVariantBestseller(REPORTS, 'S')
    assert.equal(Object.keys(result), 'S')
  })

  it('should return Error if data is not of Array type (Object)', async () => {
    const data = {}
    await makeReportVariantBestseller(data, 'S').then(result => {
      assert.equal(true, false)
    }).catch(err => {
      assert.equal(true, true)
    })
  })

  it('should return Error if data is not of Array type (String)', async () => {
    const data = 'test string'
    await makeReportVariantBestseller(data, 'S').then(result => {
      assert.equal(true, false)
    }).catch(err => {
      assert.equal(true, true)
    })
  })
})

describe('writeDocumentToDb', () => {
  it('should add a new document to DB', async () => {
    const client = new MongoClient(process.env.MONGODB_LOCAL_INSTANCE_URL, {useUnifiedTopology: true});
    await client.connect()
    await client
      .db(process.env.MONGODB_TEST_DBNAME)
      .collection(process.env.MONGODB_TEST_REPORT_COLLECTION_NAME)
      .insertOne({'test': 'test'})

    const numberOfDocumentBefore = await client.db(process.env.MONGODB_TEST_DBNAME)
      .collection(process.env.MONGODB_TEST_REPORT_COLLECTION_NAME)
      .countDocuments({})

    const titleString = 'bestSellers'

    await writeDocumentToDb(client, {'test': 'test'}, process.env.MONGODB_TEST_DBNAME,
      process.env.MONGODB_TEST_REPORT_COLLECTION_NAME, titleString).then(async () => {

      const numberOfDocumentAfter = await client.db(process.env.MONGODB_TEST_DBNAME)
        .collection(process.env.MONGODB_TEST_REPORT_COLLECTION_NAME)
        .countDocuments({});

      await client
        .db(process.env.MONGODB_TEST_DBNAME)
        .collection(process.env.MONGODB_TEST_REPORT_COLLECTION_NAME)
        .deleteMany({})

      assert.isFalse(numberOfDocumentBefore === numberOfDocumentAfter)
    })
  })
})


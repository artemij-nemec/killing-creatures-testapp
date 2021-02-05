const fs = require('fs')
let writeStream = fs.createWriteStream('example.jsonl')

const variants = ['S', 'M', 'L', 'XL']
const totalRecords = 1200000
const rounds = 10000
const records = totalRecords / rounds

for (let j = 0; j < rounds; j++) {
  let i = 0
  while (i < records) {
    i++

    const order = createOrder()
    let variant = variants[Math.floor(Math.random() * variants.length)]

    const object = {
      productId: i,
      variant,
      order,
    }

    const newLine = `\n`
    writeStream.write(`${JSON.stringify(object)}${newLine}`)
  }
}

writeStream.on('finish', () => {
  console.log('wrote all data to file')
})

writeStream.end()

function createOrder() {
  const date = randomDate(new Date(2005, 0, 1), new Date())
  const price = randomNumber()

  return {
    orderDate: date,
    price,
  }
}

function randomNumber() {
  const number = Math.floor(Math.random() * records + 1)

  return number
}

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  )
}

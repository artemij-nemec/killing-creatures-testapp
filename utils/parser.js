const fs = require('fs');
const exec = require('child_process').exec;

module.exports =()=> {
  return new Promise(resolve => {

    //container for execution of shell command
    async function sh(cmd) {
      return new Promise(function (resolve, reject) {
        exec(cmd, (err, stdout, stderr) => {
          if (err) {
            reject(err);
          } else {
            resolve({stdout, stderr});
          }
        });
      });
    }

    async function main() {
      //import via shell script
      let {stdout} = await sh('mongoimport --db test --collection orders --file orders.json --jsonArray');
      for (let line of stdout.split('\n')) {
        console.log(`ls: ${line}`);
      }
      //import of data to DB
      resolve()
    }

    //read a stream from generated dataset (.jsonl)
    const readStream = fs.createReadStream('./example.jsonl');

    const orders = [];
    let incomplete = ''

    // parse each line of dataset
    readStream.on('data', (data) => {
      const string = data.toString();
      const res = string.split('\n');
      if (incomplete) {
        res[0] = incomplete + res[0];
        incomplete = '';
      }

    //make an object from each line and push to orders array
      res.forEach(async str => {
        if (str) {
          try {
            const order = JSON.parse(str);
            orders.push(order)
          } catch (e) {
            incomplete = str;
          }
        }
      })
    })

    //make a json file for import to DB
    readStream.on("end", () => {
      console.log("Stream reading finished.")

      const data = JSON.stringify(orders);
      fs.writeFile('orders.json', data, (err) => {
        if (err) {
          throw err;
        }
        console.log("JSON data is saved.");
      });
      //call for importing function
      main();
    })
  })
}
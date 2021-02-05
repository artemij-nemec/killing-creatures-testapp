#Node.JS test app

Added:
1. Parser to handle 1mln+ records
2. Cron job 
3. REST API Call
   
###Prerequesites:

1. Install [MongoDB Community Edition](https://docs.mongodb.com/manual/administration/install-community/)
2. Install [Node.JS (ver15.4.0)](https://nodejs.org/en/blog/release/v15.4.0/)
3. Run mongodb
4. Rename .env.example to .env

###To start:

    cd cron-scheduler/
    yarn install
    node ./generator.js
    yarn start

Web API is available at http://localhost:5000/api/v01/report
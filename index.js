// const url = require('url');
// const { StringDecoder } = require('string_decoder');

const server = require('./lib/server');
const worker = require('./lib/worker');

// const lib = require('./lib/data');
// const { sendTwilioSms } = require('./helpers/notifications');

const app = {};

// todo twilio test delete
// sendTwilioSms('01303737379', 'hello rumi', (err) => {
//     console.log(err);
// });

// create server
app.init = () => {
    // start server
    server.init();
    // start workers
    worker.init();
};

app.init();

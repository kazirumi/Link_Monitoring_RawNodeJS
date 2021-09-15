const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const enviroment = require('../helpers/enviroments');
// const { sendTwilioSms } = require('./helpers/notifications');

const server = {};

// todo twilio test delete
// sendTwilioSms('01303737379', 'hello rumi', (err) => {
//     console.log(err);
// });

// create server
server.createServer = () => {
    const serverCreate = http.createServer(server.handleReqRes);
    serverCreate.listen(enviroment.port, () => {
        console.log(`${process.env.NODE_ENV}`);
        console.log(`listening to port ${enviroment.port}`);
    });
};

server.handleReqRes = handleReqRes;

server.init = () => {
    server.createServer();
};

module.exports = server;

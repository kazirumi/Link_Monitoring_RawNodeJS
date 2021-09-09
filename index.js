const http = require('http');
// const url = require('url');
// const { StringDecoder } = require('string_decoder');
const { handleReqRes } = require('./helpers/handleReqRes');
const enviroment = require('./helpers/enviroments');
// const lib = require('./lib/data');

const app = {};
// lib.delete('test', 'newFile', (err) => {
//     console.log(err);
// });

app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(enviroment.port, () => {
        console.log(`${process.env.NODE_ENV}`);
        console.log(`listening to port ${enviroment.port}`);
    });
};

app.handleReqRes = handleReqRes;

app.createServer();

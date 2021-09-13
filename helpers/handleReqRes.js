const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler');
const { parseJSON } = require('./utilities');

const handler = {};

handler.handleReqRes = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = parsedUrl.query;
    const headersObject = req.headers;

    const requestProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headersObject,
    };
    // console.log(queryStringObject);
    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });
    req.on('end', () => {
        realData += decoder.end();

        requestProperties.body = parseJSON(realData);

        chosenHandler(requestProperties, (statusCode, payload) => {
            const statusCodeFinal = typeof statusCode === 'number' ? statusCode : 500;
            const payloadFinal = typeof payload === 'object' ? payload : {};

            const payloadStringFianl = JSON.stringify(payload);

            // return the final response
            res.setHeader('Content-Type', 'Application/json');
            res.writeHead(statusCodeFinal);
            // res.write(payloadStringFianl);
            res.end(payloadStringFianl);
        });

        // res.end('hello world');
    });
};
module.exports = handler;

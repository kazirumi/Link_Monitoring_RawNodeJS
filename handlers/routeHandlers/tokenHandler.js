// Token Maintanance
const data = require('../../lib/data');
const { hash, parseJSON, hashcreateRandomString } = require('../../helpers/utilities');

const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
    const phoneNumber =
        typeof requestProperties.body.phoneNumber === 'string' &&
        requestProperties.body.phoneNumber.trim().length === 11 ?
            requestProperties.body.phoneNumber
            : false;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0 ?
            requestProperties.body.password
            : false;

    if (phoneNumber && password) {
        data.read('users', phoneNumber, (err1, userData) => {
            if (!err1) {
                const hasedPassword = hash(password);
                if (hasedPassword === parseJSON(userData).password) {
                    const tokenId = hashcreateRandomString(20);
                    const expires = Date.now() + 60 * 60 * 100;
                    const tokenObject = {
                        phoneNumber,
                        id: tokenId,
                        expires,
                    };
                    data.create('tokens', tokenId, tokenObject, (err2) => {
                        if (!err2) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, { error: 'There is a server side error' });
                        }
                    });
                } else {
                    callback(400, { error: 'Password is not valid' });
                }
            } else {
                callback(400, { error: 'phone Number does not exist, Could not generate token' });
            }
        });
    } else {
        callback(400, { error: 'you have a problem in your request' });
    }
};

handler._token.get = (requestProperties, callback) => {
    // check phone number
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20 ?
            requestProperties.queryStringObject.id
            : false;

    if (id) {
        // find token
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) }; // Bujhi nai raw project 3
            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'requested token is not found inside',
                });
            }
        });
    } else {
        callback(404, {
            error: 'requested token is not found',
        });
    }
};

handler._token.put = (requestProperties, callback) => {
    const id =
        typeof requestProperties.body.id === 'string' &&
        requestProperties.body.id.trim().length === 20 ?
            requestProperties.body.id
            : false;

    const extend =
        typeof requestProperties.body.extend === 'boolean' && requestProperties.body.extend === true ?
            requestProperties.body.extend
            : false;

    if (id && extend) {
        data.read('tokens', id, (err1, tokenData) => {
            if (!err1) {
                if (parseJSON(tokenData).expires > Date.now()) {
                    const tokenObject = parseJSON(tokenData);
                    tokenObject.expires = Date.now() + 1 * 60 * 60 * 1000;

                    // store updated token
                    data.update('tokens', id, tokenObject, (err2) => {
                        if (!err2) {
                            callback(200, {
                                message: 'token updated',
                                token: tokenObject,
                            });
                        } else {
                            callback(500, {
                                error: 'server side error',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'token already expired',
                    });
                }
            } else {
                callback(404, {
                    error: 'token does not exist',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Problem in Request',
        });
    }
};

handler._token.delete = (requestProperties, callback) => {
    // check token if valid
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20 ?
            requestProperties.queryStringObject.id
            : false;
    if (id) {
        data.read('tokens', id, (err1, tokenData) => {
            if (!err1 && tokenData) {
                data.delete('tokens', id, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'Token was Successfully Deleted',
                        });
                    } else {
                        callback(500, {
                            message: 'Server Side error',
                        });
                    }
                });
            } else {
                callback(404, {
                    message: 'Token Not found',
                });
            }
        });
    } else {
        callback(400, {
            message: 'Problem in Request',
        });
    }
};

handler._token.verify = (id, phoneNumber, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if (!err && parseJSON(tokenData)) {
            if (
                parseJSON(tokenData).phoneNumber === phoneNumber &&
                parseJSON(tokenData).expires > Date.now()
            ) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handler;

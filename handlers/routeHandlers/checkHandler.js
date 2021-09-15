// Links for checking will be Maintain by this module

const data = require('../../lib/data');
const { hash, parseJSON, hashcreateRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/enviroments');

const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

// Authentication Done
handler._check.post = (requestProperties, callback) => {
    // validate inputs
    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;

    const method =
        typeof requestProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;

    const successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
        requestProperties.body.successCodes instanceof Array ?
            requestProperties.body.successCodes
            : false;

    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1
            ? requestProperties.body.timeoutSeconds
            : false;
    if (protocol && url && method && successCodes) {
        // token verify
        const token =
            typeof requestProperties.headersObject.token === 'string' &&
            requestProperties.headersObject.token.trim().length === 20 ?
                requestProperties.headersObject.token
                : false;

        // find user phone Number by Reading the token
        data.read('tokens', token, (err1, tokenData) => {
            if (!err1 && tokenData) {
                const userPhone = parseJSON(tokenData).phoneNumber;
                // look for user data
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObject = parseJSON(userData);
                                const userChecks =
                                    typeof userObject.checks === 'object' &&
                                    userObject.checks instanceof Array ?
                                        userObject.checks
                                        : [];

                                if (userChecks.length < maxChecks) {
                                    const checkId = hashcreateRandomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        phoneNumber: userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };
                                    // savr the check
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            // add check Id to User's Object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);
                                            // update the new user data
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if (!err4) {
                                                    // return the data about new check
                                                    callback(200, userObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'Server side error',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'Server side error',
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: 'User Already reached max check limit!',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Token Expired',
                                });
                            }
                        });
                    } else {
                        callback(404, {
                            error: 'User not found',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication Problem',
                });
            }
        });
    } else {
        callback(400, {
            error: 'you have a problem in your request',
        });
    }
};
// Authentication Done
handler._check.get = (requestProperties, callback) => {
    // Check ID verify
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20 ?
            requestProperties.queryStringObject.id
            : false;

    if (id) {
        data.read('checks', id, (err1, checkData) => {
            if (!err1 && checkData) {
                const singleCheck = { ...parseJSON(checkData) }; // Bujhi nai raw project 3
                // token verify

                const token =
                    typeof requestProperties.headersObject.token === 'string' &&
                    requestProperties.headersObject.token.trim().length === 20
                        ? requestProperties.headersObject.token
                        : false;

                if (token) {
                    tokenHandler._token.verify(token, singleCheck.phoneNumber, (tokenState) => {
                        if (tokenState) {
                            callback(200, singleCheck);
                        } else {
                            callback(403, {
                                error: 'Authentication failed',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'requested token is not proper',
                    });
                }
            } else {
                callback(404, {
                    error: 'requested user is not found inside',
                });
            }
        });
    } else {
        callback(400, {
            error: 'problem in request',
        });
    }
};
// Authentication Done
handler._check.put = (requestProperties, callback) => {
    const id =
        typeof requestProperties.body.id === 'string' &&
        requestProperties.body.id.trim().length === 20 ?
            requestProperties.body.id
            : false;

    // validate inputs
    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;

    const method =
        typeof requestProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;

    const successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
        requestProperties.body.successCodes instanceof Array ?
            requestProperties.body.successCodes
            : false;

    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1
            ? requestProperties.body.timeoutSeconds
            : false;

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err1, checkData) => {
                if (!err1 && checkData) {
                    const checkObject = parseJSON(checkData);
                    // token verify
                    const token =
                        typeof requestProperties.headersObject.token === 'string' &&
                        requestProperties.headersObject.token.trim().length === 20 ?
                            requestProperties.headersObject.token
                            : false;
                    if (token) {
                        tokenHandler._token.verify(token, checkObject.phoneNumber, (tokenState) => {
                            if (tokenState) {
                                if (protocol) {
                                    checkObject.protocol = protocol;
                                }
                                if (url) {
                                    checkObject.url = url;
                                }
                                if (method) {
                                    checkObject.method = method;
                                }
                                if (successCodes) {
                                    checkObject.successCodes = successCodes;
                                }
                                if (timeoutSeconds) {
                                    checkObject.timeoutSeconds = timeoutSeconds;
                                }

                                // store to database
                                data.update('checks', id, checkObject, (err2) => {
                                    if (!err2) {
                                        callback(200, {
                                            message: ' check Updated successfull',
                                        });
                                    } else {
                                        callback(500, {
                                            message: 'There was a server sider error',
                                        });
                                    }
                                });
                            } else {
                                callback(403, {
                                    error: 'authentication failed',
                                });
                            }
                        });
                    } else {
                        callback(400, {
                            error: 'requested token is not proper',
                        });
                    }
                } else {
                    callback(500, {
                        error: 'Server side error',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'you must provide atleast one field',
            });
        }
    } else {
        callback(400, {
            error: 'you have a problem in your request',
        });
    }
};
// Authentication Done
handler._check.delete = (requestProperties, callback) => {
    // Check ID verify
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20 ?
            requestProperties.queryStringObject.id
            : false;

    if (id) {
        data.read('checks', id, (err1, checkData) => {
            if (!err1 && checkData) {
                const singleCheck = { ...parseJSON(checkData) }; // Bujhi nai raw project 3
                // token verify

                const token =
                    typeof requestProperties.headersObject.token === 'string' &&
                    requestProperties.headersObject.token.trim().length === 20
                        ? requestProperties.headersObject.token
                        : false;

                if (token) {
                    tokenHandler._token.verify(token, singleCheck.phoneNumber, (tokenState) => {
                        if (tokenState) {
                            // delete the check data
                            data.delete('checks', id, (err2) => {
                                if (!err2) {
                                    data.read(
                                        'users',
                                        singleCheck.phoneNumber,
                                        (err3, userData) => {
                                            const userObject = parseJSON(userData);
                                            if (!err3 && userData) {
                                                const userChecks =
                                                    typeof userObject.checks === 'object' &&
                                                    userObject.checks instanceof Array
                                                        ? userObject.checks
                                                        : [];

                                                // find the index number of checks array in user
                                                const checkIndex = userObject.checks.indexOf(id);
                                                if (checkIndex > -1) {
                                                    userChecks.splice(checkIndex, 1);
                                                    userObject.checks = userChecks;

                                                    // update user
                                                    data.update(
                                                        'users',
                                                        userObject.phoneNumber,
                                                        userObject,
                                                        (err4) => {
                                                            if (!err4) {
                                                                callback(200, {
                                                                    error: 'check deleted successfully from users and checks',
                                                                });
                                                            } else {
                                                                callback(500, {
                                                                    error: 'User Checks update failed',
                                                                });
                                                            }
                                                        }
                                                    );
                                                } else {
                                                    callback(500, {
                                                        error: 'The check id could not be found in user for delete',
                                                    });
                                                }
                                            } else {
                                                callback(500, {
                                                    error: 'Server Side error',
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    callback(500, {
                                        error: 'Server Side error',
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: 'Authentication failed',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'requested token is not proper',
                    });
                }
            } else {
                callback(404, {
                    error: 'requested user is not found inside',
                });
            }
        });
    } else {
        callback(400, {
            error: 'problem in request',
        });
    }
};

module.exports = handler;

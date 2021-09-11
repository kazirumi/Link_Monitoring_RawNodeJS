const data = require('../../lib/data');
const { hash, parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
    const firstName =
        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0 ?
            requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0 ?
            requestProperties.body.lastName
            : false;

    const phoneNumber =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.phoneNumber.trim().length === 11 ?
            requestProperties.body.phoneNumber
            : false;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0 ?
            requestProperties.body.password
            : false;

    const termsAgreement =
        typeof requestProperties.body.termsAgreement === 'boolean' ?
            requestProperties.body.termsAgreement
            : false;

    if (firstName && lastName && phoneNumber && password && termsAgreement) {
        // make sure that User not already exist
        data.read('users', phoneNumber, (err1) => {
            if (err1) {
                const userObject = {
                    firstName,
                    lastName,
                    phoneNumber,
                    password: hash(password),
                    termsAgreement,
                };
                // store user
                data.create('users', phoneNumber, userObject, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'user was created successfully',
                        });
                    } else {
                        callback(500, { error: 'could not create user!' });
                    }
                });
            } else {
                callback(500, {
                    error: 'there is a server side problem, already User Exist',
                });
            }
        });
    } else {
        callback(400, { error: 'you have a problem in your request' });
    }
};
// Authentication Done
handler._users.get = (requestProperties, callback) => {
    // check phone number
    const phoneNumber =
        typeof requestProperties.queryStringObject.phoneNumber === 'string' &&
        requestProperties.queryStringObject.phoneNumber.trim().length === 11 ?
            requestProperties.queryStringObject.phoneNumber
            : false;

    if (phoneNumber) {
        // token verify
        const token =
            typeof requestProperties.headersObject.token === 'string' &&
            requestProperties.headersObject.token.trim().length === 20
                ? requestProperties.headersObject.token
                : false;
        if (token) {
            tokenHandler._token.verify(token, phoneNumber, (tokenState) => {
                if (tokenState) {
                    // find user

                    data.read('users', phoneNumber, (err, u) => {
                        const user = { ...parseJSON(u) }; // Bujhi nai raw project 3
                        if (!err && user) {
                            delete user.password;
                            callback(200, user);
                        } else {
                            callback(404, {
                                error: 'requested user is not found inside',
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
        callback(404, {
            error: 'requested user is not found',
        });
    }
};
// Authentication Done
handler._users.put = (requestProperties, callback) => {
    const phoneNumber =
        typeof requestProperties.body.phoneNumber === 'string' &&
        requestProperties.body.phoneNumber.trim().length === 11 ?
            requestProperties.body.phoneNumber
            : false;

    const firstName =
        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0 ?
            requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0 ?
            requestProperties.body.lastName
            : false;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0 ?
            requestProperties.body.password
            : false;
    // console.log(requestProperties.body);
    if (phoneNumber) {
        // token verify
        const token =
            typeof requestProperties.headersObject.token === 'string' &&
            requestProperties.headersObject.token.trim().length === 20
                ? requestProperties.headersObject.token
                : false;
        if (token) {
            tokenHandler._token.verify(token, phoneNumber, (tokenState) => {
                if (tokenState) {
                    if (firstName || lastName || password) {
                        // look up the user
                        data.read('users', phoneNumber, (err1, uData) => {
                            const userData = { ...parseJSON(uData) };
                            if (!err1 && userData) {
                                if (firstName) {
                                    userData.firstName = firstName;
                                }
                                if (lastName) {
                                    userData.lastName = lastName;
                                }
                                if (password) {
                                    userData.password = hash(password);
                                }

                                // store to database
                                data.update('users', phoneNumber, userData, (err2) => {
                                    if (!err2) {
                                        callback(200, {
                                            message: ' User Updated successfull',
                                        });
                                    } else {
                                        callback(500, {
                                            message: 'There was a server sider error',
                                        });
                                    }
                                });
                            } else {
                                callback(404, {
                                    error: 'User Could not be found for Update Against the Phone Number',
                                });
                            }
                        });
                    }
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
        callback(400, {
            error: 'you have a problem in your request',
        });
    }
};
// Authentication Done
handler._users.delete = (requestProperties, callback) => {
    // check phone number
    const phoneNumber =
        typeof requestProperties.queryStringObject.phoneNumber === 'string' &&
        requestProperties.queryStringObject.phoneNumber.trim().length === 11 ?
            requestProperties.queryStringObject.phoneNumber
            : false;
    if (phoneNumber) {
        // token verify
        const token =
            typeof requestProperties.headersObject.token === 'string' &&
            requestProperties.headersObject.token.trim().length === 20
                ? requestProperties.headersObject.token
                : false;
        if (token) {
            tokenHandler._token.verify(token, phoneNumber, (tokenState) => {
                if (tokenState) {
                    data.read('users', phoneNumber, (err1, uData) => {
                        if (!err1 && uData) {
                            data.delete('users', phoneNumber, (err2) => {
                                if (!err2) {
                                    callback(200, {
                                        message: 'Successfully Deleted',
                                    });
                                } else {
                                    callback(500, {
                                        message: 'Server Side error',
                                    });
                                }
                            });
                        } else {
                            callback(500, {
                                message: 'Server Side error',
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
        callback(400, {
            message: 'Problem in Request',
        });
    }
};

module.exports = handler;

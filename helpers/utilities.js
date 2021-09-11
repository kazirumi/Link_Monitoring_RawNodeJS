/*
utilities
*/
const crypto = require('crypto');
const enviroments = require('./enviroments');

const utilities = {};
// parase json string to object
utilities.parseJSON = (jsonString) => {
    let output = {};

    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }

    return output;
};
// hash string
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', enviroments.secretKey).update(str).digest('hex');

        return hash;
    }
    return false;
};

// Create Random String
utilities.hashcreateRandomString = (strLength) => {
    let length = strLength;
    length = typeof strLength === 'number' && strLength > 0 ? strLength : false;

    if (length) {
        const pssibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let output = '';
        for (let i = 1; i <= length; i += 1) {
            const randomCharacter = pssibleCharacters.charAt(
                Math.floor(Math.random() * pssibleCharacters.length)
            );
            output += randomCharacter;
        }
        return output;
    }
    return false;
};

module.exports = utilities;

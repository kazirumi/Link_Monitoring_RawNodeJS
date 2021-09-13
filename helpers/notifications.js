// this module is for  generate notification for user

// dependencies
const https = require('https');
const queryString = require('querystring');
const { twilio } = require('./enviroments');

// module scaffolding
const notifications = {};

// send sms to user using twilio api
notifications.sendTwilioSms = (phoneNumber, msg, callback) => {
    // input validate
    const userPhone =
        typeof phoneNumber === 'string' && phoneNumber.trim().length === 11
            ? phoneNumber.trim()
            : false;

    const userMsg =
        typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600
            ? msg.trim()
            : false;

    if (userPhone && userMsg) {
        // configure the request payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };

        // stringify the payload
        const stringifyPaylaod = queryString.stringify(payload);

        // https request details generation
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        // instantiate the requst object
        const req = https.request(requestDetails, (res) => {
            // get status code from response
            const status = res.statusCode;

            // callback successfully if the request went through
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`staus code returned  ${status}`);
            }
        });
        req.on('error', (e) => {
            callback(e);
        });

        req.write(stringifyPaylaod);
        req.end();
    } else {
        callback('Given parameters were missing or invalid');
    }
};

// export the module
module.exports = notifications;

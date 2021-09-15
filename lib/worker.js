// dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const { sendTwilioSms } = require('../helpers/notifications');
const { parseJSON } = require('../helpers/utilities');
const data = require('./data');

// worker object -module scaffolding
const worker = {};

// look for the checks
worker.gatherAllChecks = () => {
    data.list('checks', (err1, allChecks) => {
        if (!err1 && allChecks && allChecks.length > 0) {
            allChecks.forEach((check) => {
                // read the checkdata
                data.read('checks', check, (err2, originalCheckData) => {
                    if (!err2 && originalCheckData) {
                        // pass the data to the check validator
                        worker.validateCheckData(parseJSON(originalCheckData));
                    } else {
                        console.log('error reading one of the check data');
                    }
                });
            });
        } else {
            console.log('could not find any check for process');
        }
    });
};

// validate Checks
worker.validateCheckData = (originalCheckData) => {
    const originalData = originalCheckData;
    if (originalCheckData && originalCheckData.id) {
        originalData.state =
            typeof originalCheckData.state === 'string' &&
            ['up', 'down'].indexOf(originalCheckData.state) > -1
                ? originalCheckData.state
                : 'down';

        originalData.lastChecked =
            typeof originalCheckData.lastChecked === 'number' && originalCheckData.lastChecked > 0
                ? originalCheckData.lastChecked
                : false;

        worker.performCheck(originalData);
    } else {
        console.log('error : Check was invalid or not properly formatted');
    }
};

// perform check
worker.performCheck = (originalCheckData) => {
    // prepare the initial check outcome
    let checkOutCome = {
        error: false,
        responseCode: false,
    };
    // mark the outcome has not been sent yet
    let outcomeSent = false;
    // parse the hostname & full url from originalCheckData
    const parsedUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true);
    const hostName = parsedUrl.hostname;
    const { path } = parsedUrl;

    // construct the requestObject for make request
    const requstDetails = {
        protocol: `${originalCheckData.protocol}:`,
        hostname: hostName,
        method: originalCheckData.method.toUpperCase(),
        path,
        timeout: originalCheckData.timeoutSeconds * 1000,
    };

    const protocolToUse = originalCheckData.protocol === 'http' ? http : https;

    const req = protocolToUse.request(requstDetails, (res) => {
        // see status code
        const status = res.statusCode;

        checkOutCome = {
            error: false,
            responseCode: status,
        };
        // Update teh check outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('error', (e) => {
        checkOutCome = {
            error: true,
            value: e,
        };
        // Update teh check outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('timeout', () => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };
        // Update teh check outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.end();
};

// check outcome and update the check if the state change and get to next process
worker.processCheckOutcome = (originalCheckData, checkOutCome) => {
    // check if checkoutcome is up or down
    const state =
        !checkOutCome.error &&
        checkOutCome.responseCode &&
        originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1 ?
            'up'
            : 'down';

    // decide whether we should alert the user or not
    const alertWanted = !!(originalCheckData.lastChecked && originalCheckData.state !== state);

    // update the check data
    const newCheckData = originalCheckData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // update the check to the file
    data.update('checks', newCheckData.id, newCheckData, (err) => {
        // console.log(err);
        if (!err) {
            if (alertWanted) {
                // send the check data to next process
                worker.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Alert is not needed as there is no state change!');
            }
        } else {
            console.log('Error trying to save check data of one of the check!');
        }
    });
};

// State change alert generation
worker.alertUserToStatusChange = (newCheckData) => {
    const msg = `Alert Your Check for ${newCheckData.method.toUpperCase} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
    console.log(msg);
    sendTwilioSms(newCheckData.phoneNumber, msg, (err) => {
        if (!err) {
            console.log('usewr was alerted to a status change via sms');
        } else {
            console.log(`There was a problem sending sms to ${newCheckData.phoneNumber}`);
        }
    });
};

// timer to execute the worker process once per miniute
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 5000);
};

// create worker
worker.init = () => {
    // Execute all the checks
    worker.gatherAllChecks();

    // loop for checking redundantly
    worker.loop();
};

// export
module.exports = worker;

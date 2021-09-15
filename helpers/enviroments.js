/*
Enviroments
*/
const enviroments = {};

enviroments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'gjhvjvshghbv',
    maxChecks: 5,
    twilio: {
        fromPhone: '+15752196614',
        accountSid: 'AC0b92be5a47d6bf81d3c099ec96fc2bec',
        authToken: 'b300c09052b83de1b9b4f9c6211175ab',
    },
};

enviroments.production = {
    port: 4000,
    envName: 'Production',
    secretKey: 'kjndfblnbllnb',
    maxChecks: 5,
    twilio: {
        fromPhone: '+15558675310',
        accountSid: 'AC0b92be5a47d6bf81d3c099ec96fc2bec',
        authToken: 'b300c09052b83de1b9b4f9c6211175ab',
    },
};
// Determine Enviroment
const currentEnviroment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// Export Corresponding enviroment object
const enviromentToExport =
    typeof enviroments[currentEnviroment] === 'object'
        ? enviroments[currentEnviroment]
        : enviroments.staging;

module.exports = enviromentToExport;

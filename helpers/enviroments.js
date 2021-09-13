/*
Enviroments
*/
const enviroments = {};

enviroments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'gjhvjvshghbv',
    maxChecks: 5,
};

enviroments.production = {
    port: 4000,
    envName: 'Production',
    secretKey: 'kjndfblnbllnb',
    maxChecks: 5,
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

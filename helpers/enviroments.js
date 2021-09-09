/*
Enviroments
*/
const enviroments = {};

enviroments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'gjhvjvshghbv',
};

enviroments.production = {
    port: 4000,
    envName: 'Production',
    secretKey: 'kjndfblnbllnb',
};
// Determine Enviroment
const currentEnviroment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// Export Corresponding enviroment object
const enviromentToExport =
    typeof enviroments[currentEnviroment] === 'object' ?
        enviroments[currentEnviroment]
        : enviroments.staging;

module.exports = enviromentToExport;

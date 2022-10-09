// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const randomstring = require('randomstring');
// const sql = require('mssql');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');


    const test = "AzureWebJobsStorage: " + process.env["BCRYPT_SALT_ROUNDS"];

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: test
    };
}
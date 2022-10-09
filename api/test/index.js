const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
const sql = require('mssql');

module.exports = async function (context, req, process) {
    context.log('JavaScript HTTP trigger function processed a request.');


    context.res = {
        // status: 200, /* Defaults to 200 */
        body: process.env.test
    };
}
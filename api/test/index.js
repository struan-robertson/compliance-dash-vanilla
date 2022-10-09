const sql = require('tedious');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const responseMessage = req.body.name;

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}
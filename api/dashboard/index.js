const jwt = require('jsonwebtoken');
const sql = require('mssql');

const dbConnectionString = process.env["TEST_DATABASE_CONNECTION_STRING"];
const hmacSecret = process.env["HMAC_SECRET"];

var access;

module.exports = async function (context, req) {

    try {

        var token = req.body.jwt;

        let pool = await sql.connect(dbConnectionString);

        //verify JWT token
        try {

            var decoded = jwt.verify(token, hmacSecret);
            access = decoded.sub;

        } catch(err) {
            //invalid token
        
            context.res = {
                // status: 200, /* Defaults to 200 */
                mimetype: "application/json",
                body: {
                    success: false,
                    data: {
                        message: "invalid token"
                    }
                }
            };
        }

        let getDashQuery = await pool.request()
                .output('rule_id', sql.Int)
                .output('rule_name', sql.VarChar(255))
                .output('rule_description', sql.VarChar(255))
                .output('occurences', sql.Int)
                .query('SELECT * FROM [dashboard]')

        context.res = {
            mimetype: "application/json",
            body: {
                success: true,
                data: getDashQuery.recordsets
            }
        }

    } catch
    {

    }

}
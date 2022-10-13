const sql = require('mssql');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

const hmacSecret = process.env["HMAC_SECRET"];

module.exports = async function (context, req) {

    var token = req.body.jwt;

    //verify JWT token
    try {

        var decoded = jwt.verify(token, hmacSecret);

    } catch (err) {
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

        return;
    }

    let pool = await sql.connect(process.env["TEST_DATABASE_CONNECTION_STRING"]);

    var cookies = cookie.parse(req.headers.cookie || '');

    var reqToken = cookies.refresh;

    if (reqToken == null)
    {
        context.res = {
            body: {
                success: false,
                message: "missing refresh token"
            }
        }
    }

    let logoutQuery = await pool.request()
        .input('token', sql.VarChar(255), reqToken)
        .query('DELETE FROM [dbo].[tokens] WHERE [token] = @token')

    if (logoutQuery.rowsAffected == 0)
    {
        context.res = {
            body: {
                success: false,
                message: "invalid refresh token"
            }
        }
    } else
    {
        context.res = {
            body: {
                success: true
            }
        }
    }

}
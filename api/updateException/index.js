const jwt = require('jsonwebtoken');
const sql = require('mssql');

const dbConnectionString = process.env["TEST_DATABASE_CONNECTION_STRING"];
const hmacSecret = process.env["HMAC_SECRET"];

module.exports = async function (context, req, res) {

    var token = req.body.jwt;
    var exception = req.body.exception;
    var justification = req.body.justification;
    var reviewDateString = req.body.date;

    var user;

    try {

        //verify JWT token
        try {

            var decoded = jwt.verify(token, hmacSecret);

            var role = decoded.role;

            user = decoded.sub;

            if (role != "manager")
            {
                context.res = {
                    // status: 200, /* Defaults to 200 */
                    mimetype: "application/json",
                    body: {
                        success: false,
                        data: {
                            message: "incorrect privilages"
                        }
                    }
                };

                return;
            }

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

        let pool = await sql.connect(dbConnectionString);

        var today = new Date();
        today.setDate(today.getDate());

        var reviewDate = Date.parse(reviewDateString);

        let storeTokenQuery = pool.request()
                .input('justification', sql.VarChar(255), justification)
                .input('review_date', sql.DateTime, reviewDateString)
                .input('last_updated', sql.DateTime, today)
                .input('last_updated_by', sql.Int, user)
                .input('exception_id', sql.Int, exception)
                .query('UPDATE exception SET justification=@justification, review_date=@review_date, last_updated=@last_updated, last_updated_by=@last_updated_by WHERE exception_id=@exception_id')

        context.res = {
            // status: 200, /* Defaults to 200 */
            mimetype: "application/json",
            body: {
                success: true,
                data: storeTokenQuery.rowsAffected
            }
        };

    } catch (err) {
        context.log(err);
        context.res = {
            // status: 200, /* Defaults to 200 */
            mimetype: "application/json",
            body: {
                success: false,
                message: err
            }
        };
    }
}
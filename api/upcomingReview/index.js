const jwt = require('jsonwebtoken');
const sql = require('mssql');

const dbConnectionString = process.env["TEST_DATABASE_CONNECTION_STRING"];
const hmacSecret = process.env["HMAC_SECRET"];

module.exports = async function (context, req, res) {

    var token = req.body.jwt;

    var customer;

    try {

        //verify JWT token
        try {

            var decoded = jwt.verify(token, hmacSecret);

            customer = decoded.customer;

            if (customer == null)
            {
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

        let getTrendQuery = await pool.request()
            .input('customer_id', sql.Int, customer)
            .query(`SELECT [rule].[rule_id], [rule].rule_name, exception_value, justification, review_date 
            FROM exception
            INNER JOIN [rule] 
            ON [exception].rule_id = [rule].rule_id
            WHERE review_date < DATEADD(Month, +2, GETDATE()) AND customer_id = @customer_id 
            ORDER BY review_date`)

        let result = getTrendQuery.recordset;

        context.res = {
            // status: 200, /* Defaults to 200 */
            mimetype: "application/json",
            body: {
                success: true,
                data: result
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
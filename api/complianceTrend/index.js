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

        context.log(customer);

        let getTrendQuery = await pool.request()
            .input('customer_id', sql.Int, customer)
            .query(`SELECT DATEADD(MONTH, DATEDIFF(MONTH, 0, complience_history.day), 0) AS month, AVG(complience_history.complient) AS complient, AVG(complience_history.non_complient) as non_complient 
            FROM complience_history 
            WHERE customer_id = @customer_id AND day > DATEADD(year, -1, GETDATE())
            GROUP BY DATEADD(MONTH, DATEDIFF(MONTH, 0, complience_history.day), 0), complience_history.customer_id`)

        let result = getTrendQuery.recordset;

        const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

        console.log(getTrendQuery);

        for (let i=0; i<result.length; i++)
        {
            result[i].month = month[result[i].month.getMonth()];
        }


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
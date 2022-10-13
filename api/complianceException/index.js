const jwt = require('jsonwebtoken');
const sql = require('mssql');

const dbConnectionString = process.env["TEST_DATABASE_CONNECTION_STRING"];
const hmacSecret = process.env["HMAC_SECRET"];

module.exports = async function (context, req, res) {

    var token = req.body.jwt;

    try     {

        //verify JWT token
        try {

            var decoded = jwt.verify(token, hmacSecret);

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

            return;
        }

        let pool = await sql.connect(dbConnectionString);
        let query = 'select (select count(resource_id) from resource) - (select count(resource_id) from non_compliance) as Compliant, (select count(resource_id) from non_compliance) as NonCompliant, (select count(resource_id) from [resource] )as total'
        
        let count = await pool.request()
            .query(query)

        var result = count.recordset[0];

        context.res = {
            // status: 200, /* Defaults to 200 */
            mimetype: "application/json",
            body: {
                success: true,
                message: result
            }
        };

    }catch (err)
    {
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
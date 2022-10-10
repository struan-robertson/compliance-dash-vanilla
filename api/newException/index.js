const jwt = require('jsonwebtoken');
const sql = require('mssql');

const dbConnectionString = process.env["TEST_DATABASE_CONNECTION_STRING"];
const hmacSecret = process.env["HMAC_SECRET"];

module.exports = async function (context, req, res) {
   
    try {

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

        var rule= req.body.resource;
        var justification= req.body.justification;
        var nextReview= req.body.nextReview;

        console.log(nextReview);
        
        let pool = await sql.connect(dbConnectionString);
        let statement = "INSERT INTO exception (customer_id, rule_id, last_updated_by, exception_value, justification, review_date, last_updated)"+ 
         "values (1,"+rule+",1,	'todo','"+justification+"','2022-12-12 16:23:59.759', '2022-09-12 17:25:36.091')";

        let count = await pool.request()
            .query(statement)
        
        
        // const result = await sql.query`select count(*) as count  from [resource]`;
        console.dir('Queried database with query: ' + statement)
        console.dir('Result:')
        console.dir(count)
        context.res = {
            // status: 200, /* Defaults to 200 */
            mimetype: "application/json",
            body: {
                success: true,
                message: count
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
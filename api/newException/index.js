const jwt = require('jsonwebtoken');
const sql = require('mssql');

const dbConnectionString = process.env["TEST_DATABASE_CONNECTION_STRING"];
const hmacSecret = process.env["HMAC_SECRET"];

module.exports = async function (context, req, res) {
   
    var token = req.body.jwt;

    try {

        //verify JWT token
        try {

            var decoded = jwt.verify(token, hmacSecret);

            context.log("valid token");

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

        var resource= req.body.resource;
        var rule = req.body.rule;
        var justification= req.body.justification;
        var nextReview= req.body.nextReview;
        var action = req.body.action;
        var now = Date.now();
        var today = new Date(now).toISOString();

        
        // INSERT INTO Exception TABLE
        let pool = await sql.connect(dbConnectionString);
        let exceptionStatement = "INSERT INTO exception (customer_id, rule_id, last_updated_by, exception_value, justification, review_date, last_updated)"+ 
         "values (1,"+rule+",1,	'"+resource+"','"+justification+"','"+nextReview+"', '"+today+"')";
         console.dir('Queried database with query: ' + exceptionStatement)

        
         let count = await pool.request()
            .query(exceptionStatement)
        
        // INSERT INTO ExceptionAudit TABLE
        // todo: exception ID, date values, rule ID
        let exceptionAuditStatement = "INSERT INTO exception_audit (exception_id, user_id, customer_id, rule_id, [action], old_exception_value, new_exception_value, old_justification, new_justification, old_review_date, new_review_date) "+ 
         "values (13, 1,1, "+rule+", '"+action+"', 'n/a', '"+resource+"', 'n/a', '"+justification+"','"+nextReview+"','"+nextReview+"')";
        
        console.dir('Queried database with query: ' + exceptionAuditStatement)

        count = await pool.request()
            .query(exceptionAuditStatement)
        
   
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
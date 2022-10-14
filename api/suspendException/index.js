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

            var role = decoded.role;

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
        let pool = await sql.connect(dbConnectionString);

        var exception_id = req.body.exception_id;
        var action = req.body.action;
        var now = Date.now();
        var today = new Date(now).toISOString();

        let previousStatement = "SELECT * FROM [exception] WHERE [exception_id] = "+exception_id;
        console.log(previousStatement);
        
        let previousValues = await pool.request()
        .query(previousStatement)

        console.log(previousValues);
        console.log("Accessing value: " + previousValues.recordset[0].exception_id);

        // Example response from SELECT, just used for testing
        // {
        //        recordsets: [ [ [Object] ] ],
        //        recordset: [
        //          {
        //            exception_id: 6,
        //            customer_id: 1,
        //            rule_id: 2,
        //            exception_value: 'todo',
        //            justification: 'test 1123456',
        //            review_date: 2022-12-12T16:23:59.760Z,
        //            last_updated: 2022-09-12T17:25:36.090Z,
        //            last_updated_by: 1
        //          }
        //        ],
        //        output: {},
        //        rowsAffected: [ 1 ]
        //      }
            
        // INSERT INTO Exception TABLE
        let suspendException = "UPDATE [exception] SET [review_date] = '"+today+"' WHERE [exception_id] = "+exception_id;
         console.dir('Queried database with query: ' + suspendException)

        
         let count = await pool.request()
            .query(suspendException)

            var rule_id = previousValues.recordset[0].rule_id;
            var resource =  previousValues.recordset[0].exception_value;
            var justification = previousValues.recordset[0].justification; 
            var oldReviewDate = previousValues.recordset[0].review_date;

            


        
        // // INSERT INTO ExceptionAudit TABLE
        // // todo: exception ID, date values, rule ID
        let exceptionAuditStatement = "INSERT INTO exception_audit (exception_id,user_id, customer_id, rule_id,[action], old_exception_value, new_exception_value, old_justification, new_justification, old_review_date, new_review_date) "+ 
        "values("+exception_id+",1,1,"+rule_id+",'"+action+"', '"+resource+"','"+resource+"', '"+justification+"', 'manager override','"+oldReviewDate.toISOString()+"','"+today+"')";
        
        console.dir('Queried database with query: ' + exceptionAuditStatement)

        count = await pool.request()
            .query(exceptionAuditStatement)
        
   
        // context.res = {
        //     // status: 200, /* Defaults to 200 */
        //     mimetype: "application/json",
        //     body: {
        //         success: true,
        //         message: count
        //     }
        // };

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
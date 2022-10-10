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
        let query = 'select A.[rule_id],A.[rule_name], A.[rule_description],B.num from [rule] A '+ 
        'inner join (select non_compliance.rule_id, count(*) as num from non_compliance group by rule_id) B ' +
        'on A.[rule_id] = B.rule_id';
        
        let count = await pool.request()
            .query(query)
        
        let result = count.recordsets;
        
        // const result = await sql.query`select count(*) as count  from [resource]`;
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
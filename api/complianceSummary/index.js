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

            var account = decoded.account;
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

        var order = req.query.order;
        var direction = req.query.direction;

        if (order == null)
        {
            order = "rule_id";
            direction = "asc";
        }

        let pool = await sql.connect(dbConnectionString);
        let query = `SELECT [non_compliance].rule_id, [rule].rule_name, [rule].[rule_description], COUNT(*) as occurences 
        FROM [non_compliance] 
        INNER JOIN [rule] 
        ON [non_compliance].rule_id = [rule].rule_id 
        INNER JOIN [resource] 
        ON [non_compliance].resource_id = [resource].resource_id
        WHERE [resource].account_id = ` + account + `
        GROUP BY [non_compliance].[rule_id], [rule].[rule_name], [rule].[rule_description]
        ORDER BY ` + order + ' ' + direction;
        
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
const sql = require('mssql');
const jwt = require('jsonwebtoken');

const dbConnectionString = process.env["TEST_DATABASE_CONNECTION_STRING"];
const hmacSecret = process.env["HMAC_SECRET"];

module.exports = async function (context, req, res) {
   
    try     
    {
        var token = req.body.jwt;

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
        let query = '  SELECT [resource_id], [resource].[resource_type_id], [resource_name], [last_updated], [rule_id]  FROM [resource] INNER JOIN [rule] ON [resource].[resource_type_id] = [rule].[resource_type_id] WHERE [resource_id] NOT IN (SELECT [resource_id] FROM [non_compliance])';
        
         let count = await pool.request()
            .query(query)
        

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
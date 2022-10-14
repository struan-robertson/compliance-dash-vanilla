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
        let query = 'SELECT  distinct([non_compliance].[resource_id]), [non_compliance].[rule_id],[resource].[resource_name], [resource].[last_updated] FROM [resource] INNER JOIN [non_compliance] ON [resource].[resource_id] = [non_compliance].[resource_id] ';

         let count = await pool.request()
            .query(query)
        

            
        // const result = await sql.query`select count(*) as count  from [resource]`;
        console.dir('Queried database with query: ' + query)
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
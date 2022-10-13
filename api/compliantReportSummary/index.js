const sql = require('mssql');

const dbConnectionString = process.env["TEST_DATABASE_CONNECTION_STRING"];

module.exports = async function (context, req, res) {
   
    try     
    {

        
        let pool = await sql.connect(dbConnectionString);
        let query = '  SELECT [resource_id], [resource].[resource_type_id], [resource_name], [last_updated], [rule_id]  FROM [resource] INNER JOIN [rule] ON [resource].[resource_type_id] = [rule].[resource_type_id] WHERE [resource_id] NOT IN (SELECT [resource_id] FROM [non_compliance])';
        
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
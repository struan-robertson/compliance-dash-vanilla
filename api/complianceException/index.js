const jwt = require('jsonwebtoken');
const sql = require('mssql');

module.exports = async function (context, req, res) {
   
    try     {

        let pool = await sql.connect('Server=localhost,1433;Database=testdatabase;User Id=sa;Password=Pa55w0rd;Encrypt=false');
        let query = 'select (select count(resource_id) from resource) - (select count(resource_id) from non_compliance) as Compliant, (select count(resource_id) from non_compliance) as NonCompliant, (select count(resource_id) from [resource] )as total'
        
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
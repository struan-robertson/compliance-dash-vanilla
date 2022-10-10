const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
const sql = require('mssql');

module.exports = async function (context, req, res) {
   
    try     {

        let pool = await sql.connect('Server=localhost,1433;Database=testdatabase;User Id=sa;Password=Pa55w0rd;Encrypt=false');
        let query = 'select [rule].[rule_id], [rule].[rule_name] from [rule]' 
        
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
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
const sql = require('mssql');

module.exports = async function (context, req, res) {
   
    try     {

        var rule= req.body.resource;
        var justification= req.body.justification;
        var nextReview= req.body.nextReview;

        console.log(nextReview);
        
        let pool = await sql.connect('Server=localhost,1433;Database=testdatabase;User Id=sa;Password=Pa55w0rd;Encrypt=false');
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
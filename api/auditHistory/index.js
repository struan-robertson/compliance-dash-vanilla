const sql = require('mssql');

const dbConnectionString = process.env["TEST_DATABASE_CONNECTION_STRING"];

module.exports = async function (context, req, res) {
   
    try     
    {

        let pool = await sql.connect(dbConnectionString);
        let query = 'SELECT [exception_audit_id], [exception_id],[rule_id], [old_justification], [new_justification], [old_review_date], [new_review_date] FROM [exception_audit]'
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
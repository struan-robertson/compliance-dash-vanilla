const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const sql = require('mssql');

const dbConnectionString = process.env["TEST_DATABASE_CONNECTION_STRING"];
const hmacSecret = process.env["HMAC_SECRET"];

module.exports = async function (context, req) {

    try {
        var username = req.body.username;

        let pool = await sql.connect(dbConnectionString);

        let passwordQuery = await pool.request()
            .input('username', sql.VarChar(255), username)
            .query(`SELECT [pass], [user_id], [user_role_name], [user].[customer_id] , [account_id]
            FROM [user] 
            INNER JOIN [user_role] 
            ON [user].[role_id] = .[user_role].[user_role_id] 
            INNER JOIN [account]
            ON [user].[customer_id] = [account].[customer_id]
            WHERE [user_name] = @username`)

        //no account with that username found
        if (passwordQuery.rowsAffected == 0)
        {
            context.res = {
                // status: 200, /* Defaults to 200 */
                mimetype: "application/json",
                body: {
                    success: false,
                    message: "Incorrect Username"
                }
            };
        }

        var hashedPW = passwordQuery.recordset[0].pass;

        var plaintextPW = req.body.password;

        //not working with online bcrypt site, might have just got password wrong
        const match = await bcrypt.compare(plaintextPW, hashedPW);

        //if password correct
        if (match)
        {
            var role = passwordQuery.recordset[0].user_role_name;
            
            var refreshToken = randomstring.generate(100);

            var user_id = passwordQuery.recordset[0].user_id;

            var customer_id = passwordQuery.recordset[0].customer_id;

            var account_id = passwordQuery.recordset[0].account_id;

            //ensure token is unique to avoid collisions
            while (true)
            {    
                let collisionQuery = await pool.request()
                    .input('token', sql.VarChar(255), refreshToken)
                    .query('SELECT * FROM [dbo].[tokens] WHERE [token] = @token')

                if (collisionQuery.rowsAffected < 1)
                    break;
                
                refreshToken = randomstring.generate(255);
            }

            var expires = new Date();
            expires.setDate(expires.getDate() + 1);

            //dont await as we need no return from this, so can happen async
            let storeTokenQuery = pool.request()
                .input('token', sql.VarChar(255), refreshToken)
                .input('user_id', sql.Int, user_id)
                .input('expires', sql.DateTime, expires) //1 day
                .query('INSERT INTO [dbo].[tokens] (token, user_id, expires) VALUES (@token, @user_id, @expires)')

            var JWTpayload = {
                sub: user_id,
                role: role,
                customer: customer_id,
                account: account_id
            }

            //secret must be set in local.settigns.json
            var jwToken = jwt.sign(JWTpayload, hmacSecret, { expiresIn: 60 * 10 }) //10 minutes

            context.res = {
                // status: 200, /* Defaults to 200 */
                mimetype: "application/json",
                body: {
                    success: true,
                    data: {
                        idToken: jwToken
                    }
                },
                cookies: [ 
                    {
                        //TODO: restore security cookies in production
                        name: "refresh",
                        value: refreshToken,
                        expires: expires,
                        //secure: true, //doesnt work for localhost
                        httpOnly: true,
                        //sameSite: "Strict",
                        //path: "/api/refresh-token"
                    }
                ]
            };
        
    } else 
    {
        context.res = {
            // status: 200, /* Defaults to 200 */
            mimetype: "application/json",
            body: {
                success: false,
                message: "Incorrect Login"
            }
        };
    }

    } catch (err)
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

    sql.on('error', err => {
        context.log(err);
        context.res = {
            // status: 200, /* Defaults to 200 */
            mimetype: "application/json",
            body: {
                success: false,
                message: err
            }
        };
    })

    
}
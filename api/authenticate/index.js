const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
const sql = require('mssql');

module.exports = async function (context, req, passwordQuery) {
   
    try {
        var username = req.body.username;

        let pool = await sql.connect(process.env["TEST_DATABASE_CONNECTION_STRING"]);

        let passwordQuery = await pool.request()
            .input('username', sql.VarChar(255), username)
            .query('SELECT [pass], [user_id], [user_role_name] FROM [dbo].[user] FULL OUTER JOIN [dbo].[user_role] ON [dbo].[user].[role_id] = [dbo].[user_role].[user_role_id] WHERE [user_name] = @username')

        context.log(req.body);

        var hashedPW = passwordQuery.recordset[0].pass;

        var plaintextPW = req.body.password;

        //not working with online bcrypt site, might have just got password wrong
        const match = await bcrypt.compare(plaintextPW, hashedPW);

        //if password correct
        if (match)
        {
            var role = passwordQuery.recordset[0].user_role_name;
            
            var refreshToken = randomstring.generate(255);

            var user_id = passwordQuery.recordset[0].user_id;

            //delete old tokens if they still exist
            let deleteOldToken = await pool.request()
                .input('user_id', sql.Int, user_id)
                .query('DELETE FROM [dbo].[tokens] WHERE [user_id] = @user_id')

            context.log(deleteOldToken);

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

            let storeTokenQuery = await pool.request()
                .input('token', sql.VarChar(255), refreshToken)
                .input('user_id', sql.Int, user_id)
                .input('expires', sql.DateTime, expires) //1 day
                .query('INSERT INTO [dbo].[tokens] (token, user_id, expires) VALUES (@token, @user_id, @expires)')

            var JWTpayload = {
                "sub": user_id,
                "role": role
            }

            //secret must be set in local.settigns.json
            var jwToken = jwt.sign(JWTpayload, process.env["HMAC_SECRET"], { expiresIn: 60 * 10 }) //10 minutes

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
                        name: "refresh",
                        value: refreshToken,
                        expires: expires,
                        secure: true,
                        httpOnly: true,
                        sameSite: "Strict",
                        path: "/api/refresh-token"
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
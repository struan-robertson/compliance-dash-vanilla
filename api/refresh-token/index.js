const randomstring = require('randomstring');
const sql = require('mssql');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

module.exports = async function (context, req) {

    let pool = await sql.connect(process.env["TEST_DATABASE_CONNECTION_STRING"]);

    var cookies = cookie.parse(req.headers.cookie || '');

    var reqToken = cookies.refresh;

    if (reqToken == null)
    {
        context.res = {
            body: {
                success: false,
                message: "missing refresh token"
            }
        }
    }

    let getTokenQuery = await pool.request()
        .input('token', sql.VarChar(255), reqToken)
        .output('expires', sql.DateTime)
        .query('SELECT * FROM [dbo].[tokens] WHERE [token] = @token')


    var storedToken = getTokenQuery.recordset[0];

    if (getTokenQuery.rowsAffected == 0)
    {
        context.res = {
            body: {
                success: false,
                message: "invalid refresh token"
            }
        }
        return;
    }
    
    //if valid refresh token
    if (storedToken.expires > Date.now())
    {
        var reqJwt = req.body.jwt;
        var decoded = jwt.verify(reqJwt, process.env["HMAC_SECRET"], { ignoreExpiration: true });

        //although expired, the data provided is still known to be true as it is signed by us
        //should probably change tho, beacuse if key was changed then all users would have to sign in again
        var user_id = decoded.sub;
        var user_role = decoded.role;
        var customer = decoded.customer;
        var account = decoded.account;

        //new refresh token, so that user never gets signed out whilst using app
        var newRefreshToken = randomstring.generate(255);

        //ensure token is unique to avoid collisions
        while (true)
        {    
            let collisionQuery = await pool.request()
                .input('token', sql.VarChar(255), newRefreshToken)
                .query('SELECT * FROM [dbo].[tokens] WHERE [token] = @token')

            if (collisionQuery.rowsAffected < 1)
                break;
            
            newRefreshToken = randomstring.generate(255);
        }
        
        var expires = new Date();
        expires.setDate(expires.getDate() + 1);

        //TODO: cron job to delete old tokens
        let updateRefreshTokenQuery = await pool.request()
            .input('token', sql.VarChar(255), newRefreshToken)
            .input('expires', sql.DateTime, expires)
            .input('user_id', sql.Int, user_id)
            .query('INSERT INTO [dbo].[tokens] (token, expires, user_id) VALUES (@token, @expires, @user_id)')

        var JWTpayload = {
            "sub": user_id,
            "role": user_role,
            "customer": customer,
            "account": account
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
                    //TODO: restore security cookies in production
                    name: "refresh",
                    value: newRefreshToken,
                    expires: expires,
                    //secure: true,
                    httpOnly: true,
                    //sameSite: "Strict",
                    //path: "/api/refresh-token"
                }
            ]
        };

    } else 
    {
        context.res = {
            body: {
                success: false,
                message: "expired token"
            }
        }
    }

}
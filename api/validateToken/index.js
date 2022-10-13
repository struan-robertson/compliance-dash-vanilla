const jwt = require('jsonwebtoken');

const hmacSecret = process.env["HMAC_SECRET"];

module.exports = async function (context, req, res) {

    var token = req.body.jwt;

    var customer;

    try {

        //verify JWT token
        try {

            var decoded = jwt.verify(token, hmacSecret);

        } catch (err) {
            //invalid token

            context.res = {
                // status: 200, /* Defaults to 200 */
                mimetype: "application/json",
                body: {
                    success: false,
                }
            };

            return;
        }
       
        context.res = {
            // status: 200, /* Defaults to 200 */
            mimetype: "application/json",
            body: {
                success: true,
            }
        };

    } catch (err) {
        context.log(err);
        context.res = {
            // status: 200, /* Defaults to 200 */
            mimetype: "application/json",
            body: {
                success: false,
            }
        };
    }
}
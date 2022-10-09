function login()
{
    var username = document.getElementById("uname").value;
    var password = document.getElementById("pass").value;

    axios.post('/api/authenticate', 
    {
        username: username,
        password: password
    })
    .then(function (response) 
    {
        var data = response.data;

        //TODO: implement failed login
        if (data.success)
        {
            //store jwt in local storage
            localStorage.setItem("jwt", data.data.idToken);

            console.log(tokenExpired());
        }
    })
    .catch(function (error) 
    {
        console.log(error);
    });
}

function refreshToken()
{
    axios.post('/api/refresh-token',
    {
        jwt: localStorage.getItem("jwt")
    })
    .then(function (response)
    {
        var data = response.data;

        //TODO: implemtnt expired refresh token
        if (data.success)
        {
            localStorage.setItem("jwt", data.data.idToken);
        }
    })
}

function tokenExpired()
{
    var jwt = localStorage.getItem("jwt");

    var payload = jwt.split(".")[1];

    var decoded = atob(payload);

    var expires = JSON.parse(decoded).exp;

    // if expires time is less than current time then token has expired 
    if (expires < Math.floor(Date.now() /  1000))
        return true;
    else 
        return false;

}
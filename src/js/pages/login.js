docReady(async function () {
    //if there is a valid JWT, no need to login
    if (localStorage.getItem("jwt") != null && isTokenExpired() == false)
    {
        await checkValidToken();
    }

});

function loginForm()
{
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    login(username, password);
}

async function checkValidToken()
{
    await axios.post('/api/validateToken',
    {
        jwt: localStorage.getItem("jwt")
    })
    .then(function (response) {
        var data = response.data;

        if (data.success) {
            window.location = '/';
        }
    })
    .catch(function (error) {
        console.log(error);
    });
}
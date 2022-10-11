//if user has never logged in
if (localStorage.getItem("jwt") == null && window.location.pathname != '/login.html') {
    window.location = '/login.html';
}

async function login(username, password) {

    axios.post('/api/authenticate',
        {
            username: username,
            password: password
        })
        .then(function (response) {
            var data = response.data;

            if (data.success) {
                //store jwt in local storage
                localStorage.setItem("jwt", data.data.idToken);

                window.location = '/';
            } else {
                console.log(data.message)
                //handle incorrect login
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function logout() {

    //make sure we're not trying to logout with an expired token
    await checkTokenAge();

    axios.post('/api/logout',
        {
            jwt: localStorage.getItem("jwt")
        })
        .then(function (response) {
            var data = response.data;

            if (data.success) {
                localStorage.removeItem("jwt");
                window.location = '/login.html';
            } else {
                console.log(data.message)
                //handle incorrect logout
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function isTokenExpired() {
    var jwt = localStorage.getItem("jwt");

    var payload = jwt.split(".")[1];

    var decoded = atob(payload);

    var expires = JSON.parse(decoded).exp;

    // if expires time is less than current time then token has expired 
    if (expires < Math.floor(Date.now() / 1000))
        return true;

    return false;
}

async function checkTokenAge() {

    var expired = isTokenExpired();

    if (expired == true) {

        await axios.post('/api/refresh-token',
            {
                jwt: localStorage.getItem("jwt")
            })
            .then(function (response) {
                var data = response.data;

                if (data.success) {
                    localStorage.setItem("jwt", data.data.idToken);
                } else 
                {
                    localStorage.removeItem("jwt");
                    window.location('/login.html');
                }
            })
    }
}
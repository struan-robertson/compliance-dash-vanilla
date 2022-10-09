function validate()
{
    var username = document.getElementById("username").value
    var password = document.getElementById("password").value

    if (username == "manager" || username == "auditor"  && password == "user")
    {
        alert("Login successful");
        window.open("index.html");
        return false;
    }
    else
    {
        alert("Login failed");
    }
} 
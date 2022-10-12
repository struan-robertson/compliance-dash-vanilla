var complianceArray;

$(document).ready(function() {

    tokenExpired();

    

    //post required because cannot send body with get requests in xmr for some reason, and sending in url is insecure as logged by server
    axios.post('/api/complianceException', { jwt: window.localStorage.jwt })
    .then(function (response) 
    {
        console.log('response from api:')
        
        console.log(response);
        if (response.data.success)
        {      
            complianceArray = response.data.message.recordset[0];
        }
        
        console.log("--------");
        console.log(complianceArray);

        var ctx = $("#chart-line");
        var myLineChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ["Compliant", "Non-Compliant"],
            datasets: [{
                data: [complianceArray.Compliant, complianceArray.NonCompliant],
                backgroundColor: ["rgba(0, 139, 139, 0)", "rgba(196, 77, 86, 1)", "rgba(239, 239, 240, 1)"]
            }]
        },
        options: {
            
            
        }
    });

    })
    .catch(function (error) 
    {
        console.log(error);
    });

    
});
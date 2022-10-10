docReady(async function() 
{
    //ensure we have a valid token before continuing 
    await checkTokenAge();

    populateDoughnut();   
    
    populateSummaryTable();
});

async function populateDoughnut()
{
    axios.post('/api/complianceException', { jwt: window.localStorage.jwt })
    .then(function (response) 
    {

        if (response.data.success)
        {      
            let complianceResult = response.data.message

            let doughnut = document.getElementById("chart-doughnut");

            var doughnutChart = new Chart(doughnut, {
                type: 'doughnut',
                data: {
                    labels: ["Compliant", "Non-Compliant"],
                    datasets: [{
                        data: [complianceResult.Compliant, complianceResult.NonCompliant],
                        backgroundColor: ["rgba(46, 204, 113, 1)", "rgba(196, 77, 86, 1)", "rgba(239, 239, 240, 1)"]
                    }]
                }
            })
        }

    })
    .catch(function (error) 
    {
        console.log(error);
    });
}


async function populateSummaryTable() {

    //post required because cannot send body with get requests in xmr for some reason, and sending in url is insecure as logged by server
    axios.post('/api/complianceSummary', { jwt: window.localStorage.getItem("jwt") })
    .then(function (response) 
    {
        if (response.data.success)
        {        

            let summaryResult = response.data.message[0];

            var summaryTable = document.getElementById('ruleSummary')

            for (var i=0; i <summaryResult.length;i++ )
            {
                var row = `<tr><td>${summaryResult[i].rule_id}</td><td>${summaryResult[i].rule_name}</td><td>${summaryResult[i].rule_description}</td><td>${summaryResult[i].num}</td></tr>`
                summaryTable.innerHTML+=row

                // var option = `<option value="${summaryResult[i].rule_id}">${summaryResult[i].rule_name}</option>`        
                // summaryTable.innerHTML+=option
            }


        }
    })
    .catch(function (error) 
    {
        console.log(error);
    });
}

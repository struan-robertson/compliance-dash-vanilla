docReady(async function () {
    //ensure we have a valid token before continuing 
    await checkTokenAge();

    populateDoughnut();

    populateSummaryTable();

    populateLineChart();
});

async function populateDoughnut() {
    axios.post('/api/complianceException', { jwt: window.localStorage.jwt })
        .then(function (response) {

            if (response.data.success) {
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
        .catch(function (error) {
            console.log(error);
        });
}


async function populateSummaryTable() {

    //post required because cannot send body with get requests in xmr for some reason, and sending in url is insecure as logged by server
    axios.post('/api/complianceSummary', { jwt: window.localStorage.getItem("jwt") })
        .then(function (response) {
            if (response.data.success) {

                let summaryResult = response.data.message[0];

                var summaryTable = document.getElementById('ruleSummary')

                for (var i = 0; i < summaryResult.length; i++) {
                    var row = `<tr><td>${summaryResult[i].rule_id}</td><td>${summaryResult[i].rule_name}</td><td>${summaryResult[i].rule_description}</td><td>${summaryResult[i].num}</td></tr>`
                    summaryTable.innerHTML += row

                    // var option = `<option value="${summaryResult[i].rule_id}">${summaryResult[i].rule_name}</option>`        
                    // summaryTable.innerHTML+=option
                }


            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function populateLineChart() {

    const NUM_MONTHS = 12;

    var months = [];
    var complientDataSet = [];
    var nonCompliantDataSet = [];

    await axios.post('/api/complianceTrend', { jwt: window.localStorage.getItem("jwt") })
        .then(function (response) {
            if (response.data.success) {

                let trendResult = response.data.data;

                for (let i=0; i<trendResult.length; i++)
                {
                    months.push(trendResult[i].month);
                    complientDataSet.push(trendResult[i].complient);
                    nonCompliantDataSet.push(trendResult[i].non_complient)
                }
            }
        })
        .catch(function (error) {
            console.log(error);
        });


    console.log(complientDataSet);

    new Chart("lineChart", {
        type: "line",
        data: {
            labels: months,
            datasets: [{
                label: 'Complient Resources',
                data: complientDataSet,
                borderColor: "rgba(46, 204, 113, 1)",
                fill: false
            }, {
                label: 'Non-Complient Resources',
                data: nonCompliantDataSet,
                borderColor: "rgba(196, 77, 86, 1)",
                fill: false
            }]
        },
        options: {
            legend: {
                display: true
            },
            title: {
                display: true,
                text: 'Trend Line'
            }
        }
    });
}
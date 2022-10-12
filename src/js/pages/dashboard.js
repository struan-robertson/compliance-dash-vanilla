docReady(async function () {
    //ensure we have a valid token before continuing 
    await checkTokenAge();

    sessionStorage.setItem("order", "rule_id");
    sessionStorage.setItem("direction", "asc");

    populateDoughnut();

    populateSummaryTable(null);

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


async function populateSummaryTable(search) {

    var order = sessionStorage.getItem("order");
    var direction = sessionStorage.getItem("direction")

    var url = '/api/complianceSummary?order=' + order + '&direction=' + direction;

    if (search != null) {
        url += '&search=' + search;
    }

    console.log(url);

    //post required because cannot send body with get requests in xmr for some reason, and sending in url is insecure as logged by server
    axios.post(url, { jwt: window.localStorage.getItem("jwt") })
        .then(function (response) {

            if (response.data.success) {

                let summaryResult = response.data.message[0];

                var summaryTable = document.getElementById('ruleSummary')

                //delete old rows
                summaryTable.innerHTML = "";

                for (var i = 0; i < summaryResult.length; i++) {
                    var row = `<tr><td>${summaryResult[i].rule_id}</td><td>${summaryResult[i].rule_name}</td><td>${summaryResult[i].rule_description}</td><td>${summaryResult[i].occurences}</td></tr>`
                    summaryTable.innerHTML += row
                }


            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function orderSummaryTable(order) {


    var storedOrder = sessionStorage.getItem("order");
    var storedDirection = sessionStorage.getItem("direction");

    var rule_id = document.getElementById("complianceTableRuleID");
    var rule_name = document.getElementById("complianceTableRuleName");
    var rule_description = document.getElementById("complianceTableRuleDescription");
    var occurences = document.getElementById("complianceTableOccurences");

    console.log(storedOrder);

    switch (storedOrder) {
        case "rule_id":
            rule_id.innerText = rule_id.innerText.slice(0, rule_id.innerText.length - 1);
            break;
        case "rule_name":
            rule_name.innerText = rule_name.innerText.slice(0, rule_name.innerText.length - 1);
            break;
        case "rule_description":
            rule_description.innerText = rule_description.innerText.slice(0, rule_description.innerText.length - 1);
            break;
        case "occurences":
            occurences.innerText = occurences.innerText.slice(0, occurences.innerText.length - 1);
            break;
    }

    switch (order) {
        case "rule_id":
            if (storedOrder == "rule_id" && storedDirection == "asc") {
                rule_id.innerText += "▲";

                sessionStorage.setItem("order", "rule_id");
                sessionStorage.setItem("direction", "desc");
            } else {
                rule_id.innerText += "▼";

                sessionStorage.setItem("order", "rule_id");
                sessionStorage.setItem("direction", "asc");
            }
            break;
        case "rule_name":
            if (storedOrder == "rule_name" && storedDirection == "asc") {
                rule_name.innerText += "▲";

                sessionStorage.setItem("order", "rule_name");
                sessionStorage.setItem("direction", "desc");
            } else {
                rule_name.innerText += "▼";

                sessionStorage.setItem("order", "rule_name");
                sessionStorage.setItem("direction", "asc");
            }
            break;
        case "rule_description":
            if (storedOrder == "rule_description" && storedDirection == "asc") {
                rule_description.innerText += "▲";

                sessionStorage.setItem("order", "rule_description");
                sessionStorage.setItem("direction", "desc");
            } else {
                rule_description.innerText += "▼";

                sessionStorage.setItem("order", "rule_description");
                sessionStorage.setItem("direction", "asc");
            }
            break;
        case "occurences":
            if (storedOrder == "occurences" && storedDirection == "asc") {
                occurences.innerText += "▲";

                sessionStorage.setItem("order", "occurences");
                sessionStorage.setItem("direction", "desc");
            } else {
                occurences.innerText += "▼";

                sessionStorage.setItem("order", "occurences");
                sessionStorage.setItem("direction", "asc");
            }
            break;
    }

    populateSummaryTable(null);
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

                for (let i = 0; i < trendResult.length; i++) {
                    months.push(trendResult[i].month);
                    complientDataSet.push(trendResult[i].complient);
                    nonCompliantDataSet.push(trendResult[i].non_complient)
                }
            }
        })
        .catch(function (error) {
            console.log(error);
        });

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
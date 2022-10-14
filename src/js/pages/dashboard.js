var reviewModal;

docReady(async function () {
    //ensure we have a valid token before continuing 
    await checkTokenAge();

    var search = sessionStorage.getItem("search");

    if (search != null && search != "") {
        let query = document.getElementById("query");

        query.value = search;
    } else {
        sessionStorage.setItem("search", "");
    }

    //set env variables to defaults
    sessionStorage.setItem("order", "rule_id");
    sessionStorage.setItem("direction", "asc");

    populateDoughnut();

    populateSummaryTable();

    let upcomingTableExceptions = document.getElementById("upcomingTableExceptions");
    let suspendException = document.getElementById("suspendException");

    if (privilage() == 'manager')
    {
        upcomingTableExceptions.style.display = "table-cell";
        suspendException.style.display = "table-cell"
    }

    populateUpcomingTable();

    populateLineChart();

    reviewModal = new bootstrap.Modal(document.getElementById("reviewModal"), {});
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

    var order = sessionStorage.getItem("order");
    var direction = sessionStorage.getItem("direction")
    var search = sessionStorage.getItem("search");

    var url = '/api/complianceSummary?order=' + order + '&direction=' + direction + '&search=' + search;

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
                    var row = `<tr><td>${summaryResult[i].rule_id}</td><td>${summaryResult[i].rule_name}</td><td>${summaryResult[i].rule_description}</td><td>${summaryResult[i].occurences}</td><td><a href="rule${summaryResult[i].rule_id}.html" class="btn btn-primary">View More Details</a></td></tr>`
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

    switch (storedOrder) {
        case "rule_id":
            rule_id.innerText = rule_id.innerText.slice(0, rule_id.innerText.length - 1);
            rule_id.innerText += " ";
            break;
        case "rule_name":
            rule_name.innerText = rule_name.innerText.slice(0, rule_name.innerText.length - 1);
            rule_name.innerText += " ";
            break;
        case "rule_description":
            rule_description.innerText = rule_description.innerText.slice(0, rule_description.innerText.length - 1);
            rule_description.innerText += " ";
            break;
        case "occurences":
            occurences.innerText = occurences.innerText.slice(0, occurences.innerText.length - 1);
            occurences.innerText += " ";
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

    populateSummaryTable();
}

function search() {
    var query = document.getElementById("query").value;

    sessionStorage.setItem("search", query);

    populateSummaryTable();
}

async function populateUpcomingTable() {

    //post required because cannot send body with get requests in xmr for some reason, and sending in url is insecure as logged by server
    axios.post('/api/upcomingReview', { jwt: window.localStorage.getItem("jwt") })
        .then(function (response) {

            console.log(response.data);

            if (response.data.success) {

                let upcomingResult = response.data.data;

                var upcomingTable = document.getElementById('upcomingTable')

                //delete old rows
                upcomingTable.innerHTML = "";

                for (var i = 0; i < upcomingResult.length; i++) {

                    let reviewDate = new Date(Date.parse(upcomingResult[i].review_date));
                    

                    var row = `<tr><td>${upcomingResult[i].rule_name}</td><td>${upcomingResult[i].exception_value}</td><td>${upcomingResult[i].justification}</td><td>${reviewDate.toLocaleDateString() + ' ' + reviewDate.toLocaleTimeString()}</td></tr>`

                    if (privilage() == 'manager')
                    {
                        row = row.slice(0, row.length - 5);
                        row += `<td><button type="button" class="btn btn-primary" onclick="genModal(` + upcomingResult[i].exception_id + `, '` + upcomingResult[i].rule_name + `', '` + upcomingResult[i].exception_value + `')">Review</button></td>`
                        row += `<td><button class="btn btn-primary " onclick="suspendException(${upcomingResult[i].exception_id})">Suspend Exception</button></td></tr>`
                    }

                    upcomingTable.innerHTML += row
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
                label: 'Compliant Resources',
                data: complientDataSet,
                borderColor: "rgba(46, 204, 113, 1)",
                fill: false
            }, {
                label: 'Non-Compliant Resources',
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
            },
            aspectRatio: 1.3
        }
    });
}

function genModal(exception_id, rule_name, exception) {
    //90 days from now
    var today = new Date();

    today.setDate(today.getDate() + 90);

    var template = `
        <h4>Rule: ` + rule_name + `</h4>
        <h5>Exception: ` + exception + `</h5>
        <form>
            <input placeholder="Justification" maxlength="255" id="exceptionJustification"></input> <br>
            <p style="margin-bottom:0px; margin-top:15px;">Review Date:</p>
            <input type="date" id="date-object" name="review" value="` + today.toISOString().substring(0, 10) + `" min=""></input>
        </form>
    `;

    var reviewModalBody = document.getElementById("reviewModalBody");
    reviewModalBody.innerHTML = template;

    var updateExceptionButton = document.getElementById("updateExceptionButton");
    updateExceptionButton.onclick = function () { updateException(exception_id) };
    
    reviewModal.show();

}

async function updateException(exception_id) {
    var exceptionJustification = document.getElementById("exceptionJustification").value;
    var exceptionDate = document.getElementById("date-object").value;

    await axios.post('/api/updateException', {
        jwt: window.localStorage.getItem("jwt"),
        exception: exception_id,
        justification: exceptionJustification,
        date: exceptionDate + 'T00:00:00.000Z'
    })
        .then(function (response) {
            console.log(response.data);
            if (response.data.success) {
                reviewModal.hide();                
                populateUpcomingTable();
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}


function getDate() {
    var now = Date.now();
    var today = new Date(now);
    return today.toISOString(); 
}

async function suspendException(exception_id){

    var action = 'suspend';

    axios.post('/api/suspendException',
    {
        jwt: window.localStorage.getItem("jwt"),
        exception_id:exception_id,
        action:action
        
    })

    populateUpcomingTable();

}
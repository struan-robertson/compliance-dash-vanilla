

function getComplianceSummary() {    
    tokenExpired();

    //post required because cannot send body with get requests in xmr for some reason, and sending in url is insecure as logged by server
    axios.post('/api/complianceException', { jwt: window.localStorage.jwt })
    .then(function (response) 
    {
        console.log('response from api:')
        var array;
        console.log(response);
        if (response.data.success)
        {
            //TODO: parse server side so client recieves less info
            console.log(response.data.message.recordset[0]);            
            array = response.data.message.recordset;
        }
        
        console.log(array[0]);
        buildComplianceTable(array);
    })
    .catch(function (error) 
    {
        console.log(error);
    });
}

function buildComplianceTable(array) {
    var table = document.getElementById('complianceTable')
    var row = `<tr><td>${array[0].Compliant}</td><td>${array[0].NonCompliant}</td><td>${array[0].total}</td></tr>`

    table.innerHTML+=row
    
}


function getRuleSummary() {
    tokenExpired();

    //post required because cannot send body with get requests in xmr for some reason, and sending in url is insecure as logged by server
    axios.post('/api/complianceSummary', { jwt: window.localStorage.getItem("jwt") })
    .then(function (response) 
    {
        console.log('response from api:')
        var array;
        console.log(response);
        if (response.data.success)
        {
            //TODO: parse server side so client recieves less info
            console.log(response.data.message.recordset[0]);            
            array = response.data.message.recordset;
        }
        
        console.log(array[0]);
        buildSummaryTable(array);
        populateRules(array);
    })
    .catch(function (error) 
    {
        console.log(error);
    });
}

function buildSummaryTable(array) {
    var summaryTable = document.getElementById('ruleSummary')
    for (var i=0; i <array.length;i++ )
    {
        var row = `<tr><td>${array[i].rule_id}</td><td>${array[i].rule_name}</td><td>${array[i].rule_description}</td><td>${array[i].num}</td><td> <a href="rule${array[i].rule_id}.html" class="btn btn-primary ">View More Details</a></td></tr>`
        summaryTable.innerHTML+=row
    }
    
}

function getAuditSummary() {
    // tokenExpired();

    //post required because cannot send body with get requests in xmr for some reason, and sending in url is insecure as logged by server
    axios.post('/api/auditHistory', { jwt: window.localStorage.getItem("jwt") })
    .then(function (response) 
    {
        console.log('response from api:')
        var array;
        console.log(response);
        if (response.data.success)
        {
            console.log('success');            

            //TODO: parse server side so client recieves less info
            console.log(response.data.message.recordset[0]);            
            array = response.data.message.recordset;
        }
        
        buildAuditSummaryTable(array);
    })
    .catch(function (error) 
    {
        console.log(error);
    });
}

function buildAuditSummaryTable(array){
    var summaryTable = document.getElementById('auditSummary')
    for (var i=0;i<array.length;i++)
    {
        var row = `<tr><td>${array[i].exception_audit_id}</td><td>${array[i].exception_id}</td><td>${array[i].rule_id}</td><td>${array[i].old_justification}</td><td>${array[i].new_justification}</td><td>${array[i].old_review_date}</td><td>${array[i].new_review_date}</td></tr>`
        summaryTable.innerHTML+=row
    }
}

/* Function calls the api to get data from the database so it can populate the table in the webpage
*/
function getCompliantReportSummary() {
    // tokenExpired();

    //post required because cannot send body with get requests in xmr for some reason, and sending in url is insecure as logged by server
    
    console.log("calling rule ")
    axios.post('/api/compliantReportSummary', { jwt: window.localStorage.getItem("jwt")}) //calls the api
    .then(function (response) 
    {
        console.log('response from api: ' +i)
        var array;
        console.log(response);
        if (response.data.success)
        {
            console.log('success');            

            //TODO: parse server side so client recieves less info
            console.log(response.data.message.recordset[0]);            
            array = response.data.message.recordset;
        }
        
      
        buildCompliantReportSummaryTable(array); //calls the buildTableFunction
        
    })
    .catch(function (error) 
    {
        console.log(error);
    });

}
function buildCompliantReportSummaryTable(array){
   
    for (var i=0;i<array.length;i++)
    {
        var element = 'compliantSummary'
        element+= array[i].rule_id
        console.log("Writing to elemen: " + element)
        var summaryTable = document.getElementById(element)
        var row = `<tr><td>${array[i].resource_id}</td><td>${array[i].resource_name}</td><td>${array[i].last_updated}</td><td>Compliant</td><td></td</tr>`
        summaryTable.innerHTML+=row
    }
}

/* Function calls the api to get data from the database so it can populate the table in the webpage
*/
function getReportSummary() {
    // tokenExpired();

    //post required because cannot send body with get requests in xmr for some reason, and sending in url is insecure as logged by server
    
    console.log("calling rule ")
    axios.post('/api/reportSummary', { jwt: window.localStorage.getItem("jwt")}) //calls the api
    .then(function (response) 
    {
        console.log('response from api: ' +i)
        var array;
        console.log(response);
        if (response.data.success)
        {
            console.log('success');            

            //TODO: parse server side so client recieves less info
            console.log(response.data.message.recordset[0]);            
            array = response.data.message.recordset;
        }
        
      
        buildReportSummaryTable(array); //calls the buildTableFunction
        
    })
    .catch(function (error) 
    {
        console.log(error);
    });


}

function buildReportSummaryTable(array){
   
    for (var i=0;i<array.length;i++)
    {
        var element = 'compliantSummary'
        //var element = 'ruleSummary'
        element+= array[i].rule_id
        var summaryTable = document.getElementById(element)
        var row = `<tr><td>${array[i].resource_id}</td><td>${array[i].resource_name}</td><td>${array[i].last_updated}</td><td>Non-Compliant</td><td> <button class="open-button" onclick="openForm(${array[i].resource_id},${array[i].rule_id},)">Create new exception</button></td></tr>
        </td></tr>`
        summaryTable.innerHTML+=row
    }
}

function populateRules(array) {
    var summaryTable = document.getElementById('non_compliant')
    for (var i=0; i <array.length;i++ )
    {
        var option = `<option value="${array[i].rule_id}">${array[i].rule_name}</option>`        
        summaryTable.innerHTML+=option
    }
    

}






/* Function calls the api to get data from the database so it can populate the table in the webpage
*/
function getRuleReportSummary(ruleNum) {
    // tokenExpired();

    //post required because cannot send body with get requests in xmr for some reason, and sending in url is insecure as logged by server
    
    console.log("calling rule ")
    axios.post('/api/reportSummary', { jwt: window.localStorage.getItem("jwt")}) //calls the api
    .then(function (response) 
    {
        console.log('response from api: ' +i)
        var array;
        console.log(response);
        if (response.data.success)
        {
            console.log('success');            

            //TODO: parse server side so client recieves less info
            console.log(response.data.message.recordset[0]);            
            array = response.data.message.recordset;
        }
        
      
        buildRuleReportSummaryTable(array, ruleNum); //calls the buildTableFunction
        
    })
    .catch(function (error) 
    {
        console.log(error);
    });


}

function buildRuleReportSummaryTable(array, ruleNum){
   
    for (var i=0;i<array.length;i++)
    {
        var element = 'compliantSummary'
        //var element = 'ruleSummary'
        element+= ruleNum
        if (array[i].rule_id == ruleNum) {
            var summaryTable = document.getElementById(element)
            var row = `<tr><td>${array[i].resource_id}</td><td>${array[i].resource_name}</td><td>${array[i].last_updated}</td><td>Non-Compliant</td><td> <button class="open-button" onclick="openForm(${array[i].resource_id},${array[i].rule_id},)">Create new exception</button></td></tr>`
            summaryTable.innerHTML+=row
        }
        
    }
}



function getCompliantRuleReportSummary(ruleNum) {
    // tokenExpired();

    //post required because cannot send body with get requests in xmr for some reason, and sending in url is insecure as logged by server
    
    console.log("calling rule ")
    axios.post('/api/compliantReportSummary', { jwt: window.localStorage.getItem("jwt")}) //calls the api
    .then(function (response) 
    {
        console.log('response from api: ' +i)
        var array;
        console.log(response);
        if (response.data.success)
        {
            console.log('success');            

            //TODO: parse server side so client recieves less info
            console.log(response.data.message.recordset[0]);            
            array = response.data.message.recordset;
        }
        
      
        buildCompliantRuleReportSummaryTable(array, ruleNum); //calls the buildTableFunction
        
    })
    .catch(function (error) 
    {
        console.log(error);
    });

}
function buildCompliantRuleReportSummaryTable(array, ruleNum){
   
    for (var i=0;i<array.length;i++)
    {
        var element = 'compliantSummary'
        element+= ruleNum
        if (array[i].rule_id == ruleNum) {
            console.log("Writing to elemen: " + element)
            var summaryTable = document.getElementById(element)
            var row = `<tr><td>${array[i].resource_id}</td><td>${array[i].resource_name}</td><td>${array[i].last_updated}</td><td>Compliant</td><td></td></tr>`
            summaryTable.innerHTML+=row
        }
    }
}

function insertNewException() {
    var resource = document.getElementById("resource_id").innerHTML;

    var rule = document.getElementById("rule_id").innerHTML;
    var justification =  document.getElementById("justification").value;
    var nextReview = document.querySelector('input[name="review"]:checked').value;
    var input = document.querySelector('#date-object');
   
    
    var reviewDate;
    if(nextReview == 'on'){
        var  dateControl = document.querySelector('input[type="date"]');
        var date = new Date(dateControl.valueAsNumber);
        reviewDate = date.toISOString();
    }
    else {
        reviewDate = getDate(nextReview);
    }

    var action= 'create';
    console.log(resource);
    console.log(justification);
    console.log(nextReview);
    console.log(reviewDate);

   

    
    
    axios.post('/api/newException',
    { jwt: window.localStorage.getItem("jwt"),

        rule:rule,
        resource:resource,
        justification:justification,
        nextReview: reviewDate,
        action: action

    }).then(function (response){
        var result = document.getElementById('submitstatus')
        
        var data = response.data;
        if (data.success)
        {
            result.innerHTML="Submission Status: success";
        }
        else
        {
            result.innerHTML="Submission Status: failure";
        }
    }) 
}


// reference: https://stackoverflow.com/questions/5645058/how-to-add-months-to-a-date-in-javascript
function getDate(numMonths) {

    var num = parseInt(numMonths);

    var now = Date.now();
    var today = new Date(now);
    
    var someMonths  = today.setMonth(today.getMonth() + num);
    var newDate = new Date(someMonths);
    console.log(newDate);
    return newDate.toISOString(); 
}

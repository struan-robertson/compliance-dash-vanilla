


function getComplianceSummary() {    
    axios.get('/api/complianceException')
    .then(function (response) 
    {
        console.log('response from api:')
        var array;
        console.log(response);
        if (response.data.success)
        {

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
    axios.get('/api/complianceSummary')
    .then(function (response) 
    {
        console.log('response from api:')
        var array;
        console.log(response);
        if (response.data.success)
        {
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
        var row = `<tr><td>${array[i].rule_id}</td><td>${array[i].rule_name}</td><td>${array[i].rule_description}</td></tr>`
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
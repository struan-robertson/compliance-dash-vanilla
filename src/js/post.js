function insertNewException() {
    var resource = document.getElementById("non_compliant").value;
    var justification =  document.getElementById("justification").value;
    var nextReview = document.querySelector('input[name="review"]:checked').value;

    console.log(resource);
    console.log(justification);
    console.log(nextReview);
    
    axios.post('/api/newException',{
        resource:resource,
        justification:justification,
        nextReview: nextReview

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

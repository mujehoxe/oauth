request('/userInfo')
.then((resolve) => {   
    if(resolve.target.status === 302 || resolve.target.status === 200){
        response = JSON.parse(resolve.target.response)
        if(response.picture){
            document.getElementById('profilePic').src = response.picture
        }
        if(response.username){
            document.getElementById('username').placeholder += ' (' + response.username + ')'
        }
        else{
            document.getElementById('username').placeholder += ' (Not Set)'
        }
        if(response.age){
            document.getElementById('age').placeholder += ' (' + response.age + ')'
        }
        else{
            document.getElementById('age').placeholder += ' (Not Set)'
        }
    }
},(reject) => {
    console.log(reject.target)
})

var reader = new FileReader();
var loadFile = function(event) {
    reader.onload = function(){
        var output = document.getElementById('profilePic');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
};

document.getElementById('submitInfo').addEventListener('click', ()=>{
    let data = {
        username: document.getElementById('username').value,
        age: document.getElementById('age').value,
    }
    
    if(reader.result){
        data.picture = reader.result
    }
    request('/edit', data, 'POST')
    .then((resolve) => {
        
        if(resolve.target.status === 302 || resolve.target.status === 200){
            location.replace(resolve.target.responseURL)
        }       
    },(reject) => {   
        console.log(reject.target)
    })
})
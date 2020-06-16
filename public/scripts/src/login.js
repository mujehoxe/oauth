

document.getElementById('submit').addEventListener('click', ()=>{
    let data = {
        email_user: document.getElementById('email_user').value,
        password: document.getElementById('password').value,
    }
    
    request('/login', data, 'POST')
    .then((resolve) => {
        
        if(resolve.target.status === 302 || resolve.target.status === 200){
            location.replace(resolve.target.responseURL)
        } 
    }
    ,(reject) => {
        console.log(reject.target)
    })
})

document.getElementById('submit').addEventListener('click', ()=>{
    let data = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('ConfimPassword').value
    }

    request('/registration', data, 'POST')
    .then((resolve) => {
        if(resolve.target.status === 302 || resolve.target.status === 200){
            location.replace(resolve.target.responseURL)
        } 
    }
    ,(reject) => {
        console.log(reject.target)
    })
})
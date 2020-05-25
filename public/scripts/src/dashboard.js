
document.getElementById('create').addEventListener('click', listener)
// document.getElementById('join').addEventListener('click', listener)

function listener(event){
    data = { req: event.path[0].id }
    
    request('/dashboard', data, 'POST')
    .then((resolve) => {   
        if(resolve.target.status === 200){
            location.assign(resolve.target.responseURL)
        }       
    },(reject) => {
        console.log(reject.target)
    })
}


document.getElementById('logout').addEventListener('click', logout)
document.getElementById('edit').addEventListener('click', edit)
document.getElementById('contact').addEventListener('click', getContact)


request('/userInfo')
.then((resolve) => {   
    if(resolve.target.status === 302 || resolve.target.status === 200){
        response = JSON.parse(resolve.target.response)
        if(response.picture){
            document.getElementById('profilePic').src = response.picture
        }
        if(response.username){
            document.getElementById('info').append(createElement('p', "Username: " + response.username, ["Paragraph", "Info"]))
        }
        document.getElementById('info').append(createElement('p', "Email: " + response.email, ["Paragraph", "Info"]))
        if(response.age){
            document.getElementById('info').append(createElement('p', "Age: " + response.age, ["Paragraph", "Info"]))
        }
        if(response.connections){
            var grab = document.getElementById("grab");
            grab.parentNode.removeChild(grab);
            
            response.connections.forEach((person) => {
                console.log(person.emailAddresses);
                console.log(person.photos);
                
                var email = createElement('p', person.emailAddresses[0].value, ["Paragraph"])
                email.style.cssText = 'font-size: 3vh; color: #c0c0c0; align-self: center;'

                var picture = createElement('img', '', ["ProfileImage"])
                picture.src = person.photos[0].url
                picture.style.cssText = 'width: 50px; height: 50px;'

                var card = createElement('div', "", ["Person"])
                card.append(picture)
                card.append(email)
                
                document.getElementById('contact').append(card)
            })
        }
    }       
},(reject) => {
    console.log(reject.target)
})


function logout(event){
    request('/logout')
    .then((resolve) => {   
        if(resolve.target.status === 302 || resolve.target.status === 200){
            location.assign(resolve.target.responseURL)
        }       
    },(reject) => {
        console.log(reject.target)
    })
}
function edit(event){ 
    location.assign('/edit')
}
function getContact(event){

    request('/contact/google')
    .then((resolve) => {
        if(resolve.target.status === 302 || resolve.target.status === 200){
            location.assign(resolve.target.response)
        }       
    },(reject) => {
        console.log(reject.target)
    })
}

function createElement(type, innerHTML, classes){
    var element = document.createElement(type)
    element.innerHTML = innerHTML
    classes.forEach(cls => {
        element.classList.add(cls)    
    })
    return element
}

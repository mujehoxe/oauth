
function request(url, data, method = 'GET'){
    let xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {

        xhr.open(method, url, true);

        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = resolve;
        xhr.onerror = reject;
        
        xhr.send(JSON.stringify(data));

    })    
}

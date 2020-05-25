const express = require('express')
const app = express();


const favicon = require('serve-favicon');
app.use(favicon(__dirname + '/public/assets/favicon.ico'));

const serveStatic = require('serve-static')
app.use(
    serveStatic('public', {
            'index': ['index.html', 'index.htm'],
        }
    )
)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

session = require('./session')
app.use(session)


const initDb = require('./db.js')

const routes = require('./routes')

initDb()
.then(db => {
    // Initialize the application once database connections are ready.

    const server = routes(app, db).listen(3000, () => console.log('Listening on port 3000'))
    const io = require('socket.io').listen(server)

    io.use(function(socket, next) {
        session(socket.request, socket.request.res || {}, next);
    });
    const sockets = require('./socket')
    sockets(io, session.roomId)
    
}).catch(err => {
    console.error('Failed to make all database connections!')
    console.error(err)
    process.exit(1)
})







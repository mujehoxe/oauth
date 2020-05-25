
const session = require('express-session')

const MongoStore = require('connect-mongo')(session);


module.exports = session({
    secret: 'keyboard cat',
    cookie: { maxAge: 60000 *60*24 *2},
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
        url: 'mongodb://localhost/chess',
        autoRemove: 'native',
    })
})

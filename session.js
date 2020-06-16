
const session = require('express-session')

const MongoStore = require('connect-mongo')(session);


module.exports = session({
    secret: 'super secret key',
    cookie: { maxAge: 60000 *60*24 *10},
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
        url: 'mongodb://localhost/oauth',
        autoRemove: 'native',
    })
})

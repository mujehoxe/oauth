
const bcrypt = require('bcryptjs');

const {check, oneOf, validationResult} = require('express-validator')

const verifyRegistration = require('./verifyRegistration.js')

const verifyLogin = require('./verifyLogin.js')

const passport = require('../passport')

module.exports = function(app, db) {

    const loggedIn = function (req, res, next) {
        if(req.session.userId){
            console.log(req.session)
            console.log('you are logged in')
            res.redirect('/dashboard')
            return
        }
        next()
    }

    const loggedOut = function (req, res, next) {
        if(!req.session.userId){
            console.log(req.session)
            console.log('you are logged out')
            res.redirect('/login')
            return
        }
        next()
    }
     
    app.get('/dashboard', loggedOut, (req, res) => {
        res.sendFile('/dashboard.html', { root: __dirname+ '/../public' })
    })
    app.post('/dashboard', loggedOut, (req, res) => {
        
        console.log(req.body)
        if(req.body.req === 'create'){
            res.redirect('/room')
        }
        if(req.body.req === 'join'){
            res.redirect('/search')
        }
    })

    app.get('/registration', loggedIn, (req, res) => {
        res.sendFile('/register.html', { root: __dirname+ '/../public' })
    })
    app.post('/registration', loggedIn, verifyRegistration(db, check), async (req, res) => {  

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body

        const salt = bcrypt.genSaltSync(12);

        const hash = bcrypt.hashSync(password, salt);

        try {
            const result = await createUser(db, username, email, hash)
            req.session.userId = result.ops[0]._id
            req.session.save()
            res.redirect(301,'/dashboard')
        } catch (err) {
            res.redirect(500, '/registration')
        }
    })

    app.get('/login', loggedIn, (req, res) => {
        res.sendFile('/login.html', { root: __dirname+ '/../public' })
    })

    app.post('/login', loggedIn, verifyLogin(db, check, oneOf), (req, res) => {
                
        let errors = validationResult(req)

        if (!errors.isEmpty()) {
            console.log(errors)
            return res.status(422).json(errors.array())
        }
        errors = []

        const { email_user, password } = req.body

        db.collection('users').find({ $or: [{email: email_user},{username: email_user}] })
        .toArray().then(result => {
            const user = result[0]
            const salt = bcrypt.getSalt(user.hash)
            const hash = bcrypt.hashSync(password, salt)
            
            if(user.email == email_user || user.username == email_user){
                
                if(user.hash === hash){
                    req.session.userId = user._id
                    req.session.save()
                    res.redirect(301,'/dashboard')
                    return
                }
            }
            errors.push({"msg":"Credentials didn't match our records.", "param":"credentials", "location":"body"})
            return res.status(422).json(errors)
        })

    })

    app.get('/room', loggedOut, (req, res) => {
        
        const min = 4000000000000 ,
                max= 4999999999999
        let roomId = (Math.floor(Math.random() * (max - min) + min)).toString()

        res.redirect('/room'+roomId)
    })
    app.get('/room:id', loggedOut, (req, res) => {

        res.sendFile('/room.html', { root: __dirname+ '/../public' })
        
        console.log('id', req.params.id)
        req.session.roomId = req.params.id
    })

    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/auth/google', loggedIn, passport.authenticate('google', { 
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ] 
    }))

    app.get('/auth/google/callback', loggedIn,
        passport.authenticate('google', { failureRedirect: '/dashboard' }),
        function(req, res) {
            const googleId = req.user.id
            const email = req.user._json.email
        
            try {
                db.collection('users').findOneAndUpdate(
                    { googleId: googleId },
                    { $setOnInsert: { googleId: googleId, email: email } },
                    { upsert: true, returnOriginal: false},

                    function(err, doc) {
                        if (err) { throw err }
                        req.session.userId = doc.value._id
                        req.session.save()
                    }
                )
            } catch( err ) { console.log(err) }      
            res.redirect('/dashboard');
        }
    );

    
    return app
}

function createUser(db, username, email, hash){
    return db.collection('users').insertOne({ username, email, hash})
}
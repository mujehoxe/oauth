
const bcrypt = require('bcryptjs');

const {check, oneOf, validationResult} = require('express-validator')

const verifyRegistration = require('./verifyRegistration.js')

const verifyLogin = require('./verifyLogin.js')

const ObjectId = require('mongodb').ObjectId

const { google } = require('googleapis')

const axios = require('axios')

const fs = require('fs').promises

const crypto = require('crypto');

module.exports = function(app, db) {

    const loggedIn = function (req, res, next) {
        if(req.session.userId){
            res.redirect('/dashboard')
            console.log(req.session)
            return
        }
        next()
    }

    const loggedOut = function (req, res, next) {
        if(!req.session.userId){
            res.redirect('/login')
            return
        }
        next()
    }
     
    app.get('/dashboard', loggedOut, (req, res) => {
        res.sendFile('/dashboard.html', { root: __dirname+ '/../public' })
    })

    app.get('/uploads/:id', loggedOut, (req, res) => {
        res.sendFile(req.params.id, { root: __dirname+ '/../uploads' })
    })
    app.get('/edit', loggedOut, (req, res) => {
        res.sendFile('/edit.html', { root: __dirname + '/../public' })
    })
    app.post('/edit', loggedOut, async(req, res) => {
        const data = {}

        if(req.body.picture){
            let base64String = req.body.picture;
            let base64Image = base64String.split(';base64,')
            let image = base64Image.pop()
            let extention = base64Image.pop()
            extention = '.' + extention.slice(extention.indexOf("/") + 1, extention.length)

            const current_date = (new Date()).valueOf().toString();
            const random = Math.random().toString();
            const fileName = crypto.createHash('md5').update(current_date + random).digest('hex');
            
            path = __dirname + '/../uploads/' + fileName + extention
            data.picture = './uploads/' + fileName + extention

            fs.writeFile(path, image, {encoding: 'base64'}, function(err) {
                if(err) { throw err }
            });
        }

        if(req.body.username) { data.username = req.body.username }

        if(req.body.age) { data.age = req.body.age }

        if(!(JSON.stringify(data) === '{}'))
        try{
            db.collection('users').updateOne(
                { _id: new ObjectId(req.session.userId) },
                { $set: data }
                ,
                function(err, result) {
                    if (err) { throw err }
                    res.send('success')
                }
            )
        }
        catch{
            res.send('fail');
        }
        else{
            res.send('fail');
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
            res.redirect(302,'/dashboard')
        } catch (err) {
            console.log(err)
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
        	if(result.length != 0){
		        const user = result[0]
		        const salt = bcrypt.getSalt(user.hash)
		        const hash = bcrypt.hashSync(password, salt)
		        	
		        if(user.hash === hash){
		            req.session.userId = user._id
		            req.session.save()
		        	res.redirect(302,'/dashboard')
		            return
		        }
		    }
            errors.push({"msg":"Credentials didn't match our records.", "param":"credentials", "location":"body"})
            return res.status(422).json(errors)
        })

    })

    app.get('/logout', loggedOut, (req, res) => {
	    req.session.destroy()
	    res.send('success')
    })

    app.get('/auth/google', loggedIn, (req, res) => {
        const oauthClient = new google.auth.OAuth2(
            '374495845688-8ra0nksfosq5s6p91kj7pe40arass74p.apps.googleusercontent.com',
            'LSE0vXnUaV7_NjTCjnZ6rXJq',
            'http://127.0.0.1:3000/auth/google/callback'
        )
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'openid'
        ]
        
        const url = oauthClient.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            state: JSON.stringify({
                callbackUrl: req.body.callbackUrl,
                userId: req.body.userid
            })
        })
        res.redirect(302,url)
    })

    app.get('/auth/google/callback', loggedIn, async (req, res) => {
        const code = req.query.code
        
        const oauthClient = new google.auth.OAuth2(
            '374495845688-8ra0nksfosq5s6p91kj7pe40arass74p.apps.googleusercontent.com',
            'LSE0vXnUaV7_NjTCjnZ6rXJq',
            'http://127.0.0.1:3000/auth/google/callback'
        )
        const response = await oauthClient.getToken(code)
        const { tokens } = response
        const token = tokens.id_token.split('.')
        const data = JSON.parse(Buffer.from(token[1], 'base64'))
        
        try { 
            if(data) {
                const { sub, email, picture } = data

                db.collection('users').findOneAndUpdate(
                { sub: sub },
                { $setOnInsert: { sub, email, picture} },
                { upsert: true, returnOriginal: false}
                ,
                function(err, doc) {
                    if (err) { throw err }
                    req.session.userId = doc.value._id
                    req.session.save()
                    res.redirect(302,'/dashboard')
                })
            }
        } catch (error) {
            console.log(error)
            res.redirect(302,'/registration')
        }      
    })

    app.get('/contact/google', loggedOut,  (req, res) => {
        const oauthClient = new google.auth.OAuth2(
            '374495845688-8ra0nksfosq5s6p91kj7pe40arass74p.apps.googleusercontent.com',
            'LSE0vXnUaV7_NjTCjnZ6rXJq',
            'http://127.0.0.1:3000/contact/google/callback'
        )
        const scopes = ['https://www.googleapis.com/auth/contacts.readonly']
        const url = oauthClient.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            state: JSON.stringify({
                callbackUrl: req.body.callbackUrl,
                userId: req.body.userid
            })
        })
        res.send(url)
    })

    app.get('/contact/google/callback', loggedOut, async (req, res) => {
        const code = req.query.code

        const oauthClient = new google.auth.OAuth2(
            '374495845688-8ra0nksfosq5s6p91kj7pe40arass74p.apps.googleusercontent.com',
            'LSE0vXnUaV7_NjTCjnZ6rXJq',
            'http://127.0.0.1:3000/contact/google/callback'
        )
        const { tokens } = await oauthClient.getToken(code)

        try {
           const {data} = await axios({
               method: 'GET',
               headers:{
                   authorization: 'Bearer ' + tokens.access_token,
               },
               'Content-Type': 'application/json',
               url: 'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,photos'
            })

            if(data) {
                const { connections } = data
                db.collection('users').updateOne(
                    { _id: new ObjectId(req.session.userId) },
                    { $set: { connections } }
                    ,
                    function(err, res) {
                        if (err) { throw err }
                        console.log(res.modifiedCount)
                    }
                )
                res.redirect('/dashboard')
            } else {
                console.log('No connections found.');
            }
        } catch (error) {
            console.log(error)
        }
    })

    
    app.get('/userInfo', loggedOut, (req, res) => {
        db.collection('users').findOne({ _id: new ObjectId(req.session.userId) }, { projection: { _id: 0, googleId:0, hash: 0 } } )
        .then(result => { res.send(result) })
    })  
    return app
}

function createUser(db, username, email, hash){
    return db.collection('users').insertOne({ username, email, hash})
}

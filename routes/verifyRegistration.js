
module.exports = (db, check) => {
    const findUserBy = function(property, value){
        let object = {}
        object[property] = value
        return db.collection('users').find(object).toArray().then(result => {
            if (result.length > 0) {
                let msg = property.charAt(0).toUpperCase() + //
                        property.slice(1) + ' not available.'
                return Promise.reject(msg);
            }
        })
    }

    return [
        check('username').exists().bail()
        .trim().isLength({ min: 5 }).withMessage('Username must have more than 5 characters.').bail()
        .escape()
        .custom(username => {
            return findUserBy('username', username)
        })
        ,
        check('email').exists().bail()
        .isEmail().withMessage('Invalid Email.').bail()
        .normalizeEmail()
        .custom(email => {
            return findUserBy('email', email)
        })
        ,
        check('password').exists().bail()
        .isLength({ min: 8 }).withMessage('Password contain at least 8 characters').bail()
        .custom((password, { req }) => {
            
            if (password !== req.body.confirmPassword) {
                return Promise.reject('Password confirmation is incorrect.');
            }else {
                return password;
            }

        })
    ] 

}
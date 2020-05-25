
module.exports = (db, check, oneOf) => {

    return [
        check('email_user')
        .exists().withMessage('Email/Username is required.').bail()
        ,
        oneOf(
            [
            check('email_user')
            .isEmail().withMessage('Invalid Email.').bail()
            .normalizeEmail()
            ,
            check('email_user')
            .trim().isLength({ min: 5 }).withMessage('Username must have more than 5 characters.').bail()
            .escape()
        ])
        ,
        check('password').exists().bail().isLength({ min: 8 }).withMessage('Password contain at least 8 characters').bail()    
    ]
}
const {body} = require('express-validator'); 
const {validationResult} =require('express-validator');
const { DateTime } = require('luxon');

exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid connection id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
};


exports.validateSignUp= [body('firstName', 'First Name cannot be empty').notEmpty().trim().escape(),
body('lastName','Last name cannot be empty').notEmpty().trim().escape(),
body('email','Email must be a valid email address').isEmail().trim().escape().normalizeEmail(), 
body('password','Password must be atleast 8 characters and atmost 64 characters').isLength({min:8, max:64})];

exports.validateLogIn = [body('email','Email must be a valid email address').isEmail().trim().escape().normalizeEmail(), 
body('password','Password must be atleast 8 characters and atmost 64 characters').isLength({min:8, max:64})];


exports.validateConnection= [body('topic', 'Topic must be 3 or more characters').trim().escape().isLength({min:3}),
body('tagLine', 'Tagline must be 3 or more characters').trim().escape().isLength({min:3}),
body('name', 'Name must be 3 or more characters').trim().escape().isLength({min:3}),
body('details','Detail must be atleast 10 characters').trim().escape().isLength({min:10}),
body('address', 'Address cannot be empty').notEmpty().trim().escape(),
body('date','date cannot be empty' ).notEmpty().trim().escape().isISO8601().withMessage('Date must be a valid date').isAfter((DateTime.now().toLocaleString())).withMessage('Date must be after todays date'),
body('startTime', 'start time cannot be empty').notEmpty().trim().escape().matches( '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$').withMessage('Invalid start time'),
body('endTime', 'endTime cannot be empty').notEmpty().trim().escape().matches( '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$').withMessage('Invalid end time').custom((value,{req} )=> value > req.body.startTime).withMessage('End time needs to be greater than start time.'),
body('image', 'image cannot be empty').notEmpty().trim()];


exports.validateResult = (req,res, next) =>{
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        errors.array().forEach(error => {
            req.flash('error',error.msg);
        });
        return res.redirect('back');
    }
    else{
        return next();
    }
}
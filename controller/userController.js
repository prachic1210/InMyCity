const connection = require('../models/connection.js');
const model = require('../models/user');
const rsvp = require('../models/rsvp');

exports.new = (req,res) =>{
    res.render('./user/new');
};

exports.create = (req,res,next)=>{
    let user = new model(req.body);
    console.log('USer '+ user.firstName + user.lastName);
    user.save()
    .then(()=>{
        req.flash('success', 'Registration succeeded!');
        res.redirect('/users/login');
    })
    .catch(err => {
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('back');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('back');
        }
        next(err);
    });

}

exports.getUserlogin = (req,res,next)=>{
    res.render('./user/login');
}

exports.login = (req,res,next)=>{
    let email = req.body.email;
    //authenticate users login request 
    //let email = req.body;
    if(email)
    email = email.toLowerCase();
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if(!user){
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
        }
        else{
            //user found in database
            user.comparePassword(password)
            .then(result =>{
                if(result){
                    req.session.user = user._id;
                    console.log(user.firstName);
                    req.session.firstName = user.firstName;
                    req.session.lastName = user.lastName;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/');
                }
                else{
                    req.flash('error', 'wrong password');  
                    res.redirect('/users/login');
                }
            })
        }
    })
}

exports.profile = (req,res,next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id), connection.find({hostName: id}), rsvp.find({userId: id}).populate('connection', 'id name topic')])
    .then(result => {
        const [user, connections, rsvpEvents] = result;
        console.log('YAYYUGUGUGE' + rsvpEvents + rsvpEvents.connection  +  rsvpEvents.response);
        res.render('./user/profile',{user, connections, rsvpEvents})
    })
    .catch(err => next(err));
 // res.render('./user/profile');

}

exports.logout = (req,res,next)=>{
    req.session.destroy(err=> {
        if(err)
        return next(err);
        else
        res.redirect('/');
    });
}
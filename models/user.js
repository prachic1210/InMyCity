const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');


const userSchema = new Schema({
    firstName:{type: String, required:[true,'First Name is required and cannot be empty']},
    lastName:{type: String, required:[true,'Last Name is required and cannot be empty']},
    email:{type: String, required:[true,'Email is required and cannot be empty'], unique: true},
    password:{type: String, required:[true,'Password is required and cannt be empty']}
   });


//replace plain text password with hashed password


//pre middleware
userSchema.pre('save',function(next){
    let user = this;
    if(!user.isModified('password')){
        return next();
    }
    // (plaintext pwd, 10)
    bcrypt.hash(user.password, 10)
    .then(hash => {
        user.password = hash;
        next();
    })
    .catch(err => next(err));
});

//compare the loggged in paasowrd and stored db pwd
userSchema.methods.comparePassword = function(loginPassword){
   return bcrypt.compare(loginPassword, this.password);
}


//name of the collection in database is connections
module.exports = mongoose.model('User', userSchema);

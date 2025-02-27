const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true,'Please provide username'],
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: [true,'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide valid email'
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true,'Please provide password'],
        minlength: 5,
      
    },
    cteatedAt: {
        type: Date, 
        default: Date.now
    },
});

UserSchema.pre('save', async function(next){
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.createJWT = function() {
    return jwt.sign({
        userId: this._id, 
        username: this.username}, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_LIFETIME })
};

UserSchema.methods.comparePassword = async function (candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
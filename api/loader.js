const mongoose = require('mongoose');
const Schemas = require('./models/schemas');


Schemas.User.deleteMany({}, err => console.log("Users removed"))

var user = new Schemas.User({
    username: "neilshweky",
    email: "nshweky@seas.upenn.edu",
    password: "cis557sucks",
})

user.save(err => {
    if (!err) 
        console.log("User saved")
    else 
        console.log("There was an error", err);
})


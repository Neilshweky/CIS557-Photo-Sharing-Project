const mongoose = require('mongoose');
const Schemas = require('./models/schemas');

var user = new Schemas.User({
    username: "neilshweky",
    email: "nshweky@seas.upenn.edu",
    password: "cis557sucks",
})

var post = new Schemas.Post({
    pic: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/New_York_Rangers.svg/2000px-New_York_Rangers.svg.png",
    uid: "hello"
})

Schemas.User.deleteMany({}, err => {
    console.log("Users removed")
    user.save(err => {
        if (!err) 
            console.log("User saved")
        else 
            console.log("There was an error", err);
    })
})
Schemas.Post.deleteMany({}, err => {
    console.log("Posts removed")
    post.save(err => {
        if (!err) 
            console.log("Post saved")
        else 
            console.log("There was an error", err);
    })
})




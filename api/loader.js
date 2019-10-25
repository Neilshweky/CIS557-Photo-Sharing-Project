const mongoose = require('mongoose');
const Schemas = require('./models/schemas');

var user = new Schemas.User({
    username: "neilshweky",
    email: "nshweky@seas.upenn.edu",
    password: "cis557sucks",
    friends: ["neilshweky2"]
})

var user2 = new Schemas.User({
    username: "neilshweky2",
    email: "nshweky2@seas.upenn.edu",
    password: "cis557sucks",
})


var post = new Schemas.Post({
    picture: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/New_York_Rangers.svg/2000px-New_York_Rangers.svg.png",
    username: "neilshweky"
})

Schemas.User.deleteMany({}, err => {
    console.log("Users removed")
    user.save().then(() => console.log("User saved"))
        .catch(err => console.log("There was an error", err))    
    user2.save().then(() => console.log("User saved"))
        .catch(err => console.log("There was an error", err))    
    
})
Schemas.Post.deleteMany({}, err => {
    console.log("Posts removed")
    post.save().then(data => console.log("Post saved"))
        .catch(err => console.log("There was an error", err))  
})




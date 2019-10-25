const Schemas = require('../models/schemas.js');
var SHA256 = require("crypto-js/sha256");

// So this is signup... User promises if possible
// you rather
// on success return the user object
const createUser = function (username, email, password, profile_picture) {
    //TODO: Carlos
    // 1. dont forget to hash password... SHA256(password)
}

//and this is login... 
// on successful login, return user object
// on unsuccessful login, return empty object
const login = function(username, password) {
    //TODO: Carlos
}

// 1. create a post
// 2. get all of current users friends
const postPicture = function (picture, username) {
    return Promise
            .all([createPost(picture, username), getFriendsForUsername(username)])
            .then(values => {
                const post = values[0]
                const friends = values[1]
                friends.push(username);
                return addPostIDToUsers(post.uid, friends).then(() => post)
            })              
}

const createPost = function (picture, username) {
    const post = new Schemas.Post({picture, username});
    return post.save()
}

const getFriendsForUsername = function (username) {
    return Schemas.User.findOne({username}, {friends: 1}).then(user => user.friends)
}

const addPostIDToUsers = function(post_id, usernames) {
    return Schemas.User.updateMany(
        {username: {$in: usernames}}, 
        {$push : {
            posts: {
                $each: [post_id], 
                $position: 0
            }
        }})
}

module.exports = {
    createUser,
    login,
    postPicture
}
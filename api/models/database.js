const Schemas = require('../models/schemas.js');
var SHA256 = require("crypto-js/sha256");

// Returns a User from the database as a Promise, by username
const getUser = function (username) {
    return Schemas.User.findOne({ username }).exec();
}

// Adds user to database after signup, and returns it as a Promise
const createUser = async function (username, email, password, profile_picture) {
    const existingUser = await getUser(username);
    if (existingUser != null) {
        return undefined;
    }
    password = SHA256(password);
    const profile = {
        username: username,
        email: email,
        password: password,
        profile_picture: profile_picture
    };
    const user = new Schemas.User(profile);
    return user.save();
}

// Checks correct user login
const checkLogin = async function (username, password) {
    const user = await getUser(username);
    if (user == null || user.password != SHA256(password)) {
        return null;
    }
    return user;
}

// 1. create a post
// 2. get all of current users friends
const postPicture = function (picture, username) {
    return Promise
        .all([createPost(picture, username), getFriendsForUsername(username)])
        .then(values => {
            const post = values[0];
            const friends = values[1];
            friends.push(username);
            return addPostIDToUsers(post.uid, friends).then(() => post);
        });
}

const createPost = function (picture, username) {
    const post = new Schemas.Post({ picture, username });
    return post.save();
}

const getFriendsForUsername = function (username) {
    return Schemas.User.findOne({ username }, { friends: 1 }).then(user => user.friends);
}

const addFriend = function (username, friend) {
    return Schemas.User.updateOne(
        { username: username },
        { $push: { friends: friend } }
    );
}

const addPostIDToUsers = function (post_id, usernames) {
    return Schemas.User.updateMany(
        { username: { $in: usernames } },
        {
            $push: {
                posts: {
                    $each: [post_id],
                    $position: 0
                }
            }
        });
}

module.exports = {
    getUser,
    createUser,
    checkLogin,
    postPicture,
    createPost,
    addFriend,
    getFriendsForUsername
}
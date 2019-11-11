/* eslint-disable */
const SHA256 = require('crypto-js/sha256');
const Schemas = require('./schemas.js');
const async = require('async')
// Returns a User from the database as a Promise, by username
function getUser(username) {
  return Schemas.User.findOne({ username }).exec();
}

function deleteUser(username) {
  return Schemas.User.deleteOne({ username }).exec();
}

// Adds user to database after signup, and returns it as a Promise
async function createUser(username, email, password, profilePicture) {
  const existingUser = await getUser(username);
  if (existingUser != null) {
    return undefined;
  }
  const encryptedPassword = SHA256(password);
  const profile = {
    username,
    email,
    password: encryptedPassword,
    profilePicture,
  };
  const user = new Schemas.User(profile);
  return user.save();
}

// Checks correct user login
async function checkLogin(username, password) {
  const user = await getUser(username);
  if (user == null || user.password !== SHA256(password).toString()) {
    return null;
  }
  return user;
}
function createPost(picture, username) {
  const post = new Schemas.Post({ picture, username });
  return post.save();
}

function getFolloweesForUsername(username) { // 
  return Schemas.User.findOne({ username }, { followees: 1 })
    .then((user) => {
      if (user != null && 'followees' in user)
        return user.followees
      else
        return []
    });
}

function followUser(username, friend) { // follow a user
  const p1 = Schemas.User.updateOne(
    { username },
    { $push: { followees: friend } },
  );
  const p2 = Schemas.User.updateOne(
    { friend },
    { $push: { followers: username } },
  );
  return Promise.all([p1, p2]);

}

function addPostIDToUsers(postID, usernames) {
  return Schemas.User.updateMany(
    { username: { $in: usernames } },
    {
      $push: {
        posts: {
          $each: [postID],
          $position: 0,
        },
      },
    },
  );
}

// 1. create a post
// 2. get all of current users friends
function postPicture(picture, username) {
  return Promise
    .all([createPost(picture, username), getFolloweesForUsername(username)])
    .then((values) => {
      const post = values[0];
      const friends = values[1];
      friends.push(username)
      return addPostIDToUsers(post.uid, friends).then(() => post);
    });
}


function getPost(uid) {
  return Schemas.Post.findOne({ uid })
}

function getPostIdsForUserAndNum(username, num) {
  return Schemas.User.findOne({ username }, { posts: { $slice: [num, 1000] } }).then((data) => data.posts);
}

function getPostsForUserAndNum(username, num) {
  return getPostIdsForUserAndNum(username, parseInt(num)).then(async (posts) => {
    final = [];
    for (let i = 0; i < posts.length; i++) {
      var post = posts[i];
      final.push(await getPost(post));
    }
    return final;
  })
}

async function likePost(username, uid) {
  console.log("liking post: ", username, ", ", uid)
  const existingUser = await getUser(username);
  const post = await getPost(uid);
  if (existingUser == null || post == null ||
    existingUser.followees.indexOf(post.username) == -1) {
    return null;
  } else {
    return Schemas.Post.updateOne(
      { uid },
      { $push: { likes: username } },
    )
  }

}

async function unlikePost(username, uid) {
  console.log("unliking post: ", username, ", ", uid)
  const existingUser = await getUser(username);
  const post = await getPost(uid);
  if (existingUser == null || post == null ||
    existingUser.followees.indexOf(post.username) == -1) {
    return null;
  } else {
    return Schemas.Post.updateOne(
      { uid },
      { $pull: { likes: username } },
    )
  }
}


module.exports = {
  getUser,
  deleteUser,
  createUser,
  checkLogin,
  postPicture,
  createPost,
  followUser,
  getFolloweesForUsername,
  getPost,
  getPostsForUserAndNum,
  likePost,
  unlikePost
};

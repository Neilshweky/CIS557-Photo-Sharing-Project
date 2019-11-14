/* eslint-disable */
const SHA256 = require('crypto-js/sha256');
const uuidv4 = require('uuid/v4');
const Schemas = require('./schemas.js');


// Returns a User from the database as a Promise, by username
function getUser(username) {
  return Schemas.User.findOne({ username }).exec();
}

// Deletes a user from the database
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

// Update user's email
async function updateEmail(username, email) {
  const user = await getUser(username);
  if (user == null) {
    return Promise.reject(new Error('no user found'));
  }
  user.email = email;
  return user.save();
}

// Update user's profile picture
async function updateProfilePic(username, profilePicture) {
  const user = await getUser(username);
  if (user == null) {
    return Promise.reject(new Error('no user found'));
  }
  user.profilePicture = profilePicture;
  return user.save();
}

// Update user's password. Requires old password, returns null if it's incorrect
async function updatePassword(username, oldPassword, newPassword) {
  const user = await getUser(username);
  if (user == null) {
    return Promise.reject(new Error('no user found'));
  } if (user.password !== SHA256(oldPassword).toString()) {
    return Promise.reject(new Error('incorrect password'));
  }
  const encryptedPassword = SHA256(newPassword);
  user.password = encryptedPassword;
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
function createPost(picture, username, caption="") {
  const post = new Schemas.Post({ picture, username, caption });
  return post.save();
}

function getFolloweesForUsername(username) { //
  return Schemas.User.findOne({ username }, { followees: 1 })
    .then((user) => {
      if (user != null) {
        return user.followees;
      }
      return [];
    });
}

function getFollowersForUsername(username) { //
  return Schemas.User.findOne({ username }, { followers: 1 })
    .then((user) => {
      if (user != null) return user.followers;
      return [];
    });
}

function followUser(username, friend) { // follow a user
  const p1 = Schemas.User.updateOne(
    { username },
    { $push: { followees: friend } },
  );
  const p2 = Schemas.User.updateOne(
    { username: friend },
    { $push: { followers: username } },
  );
  return Promise.all([p1, p2]);
}

function unfollowUser(username, friend) { // unfollow a user
  const p1 = Schemas.User.updateOne(
    { username },
    { $pull: { followees: friend } },
  );
  const p2 = Schemas.User.updateOne(
    { username: friend },
    { $pull: { followers: username } },
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
function postPicture(picture, username, caption) {
  return Promise
    .all([createPost(picture, username, caption), getFollowersForUsername(username)])
    .then((values) => {
      const post = values[0];
      const friends = values[1];
      friends.push(username);
      console.log(friends);
      return addPostIDToUsers(post.uid, friends).then(() => post);
    });
}


function getPost(uid) {
  return Schemas.Post.findOne({ uid });
}

function getPostIdsForUserAndNum(username, num) {
  return Schemas.User.findOne({ username },
    { posts: { $slice: [num, 1000] } })
    .then((data) => { if (data == null) { return null; } return data.posts; });
}

function getPostsForUserAndNum(username, num) {
  return getPostIdsForUserAndNum(username, parseInt(num, 10))
    .then(async (posts) => {
      if (posts == null) {
        return null;
      }
      return Promise.all(posts.map((post) => getPost(post))).then((data) => data);
    });
}

async function likePost(username, uid) {
  console.log('liking post: ', username, ', ', uid);
  const existingUser = await getUser(username);
  const post = await getPost(uid);
  if (existingUser == null || post == null
    || (existingUser.username !== post.username
      && existingUser.followees.indexOf(post.username) === -1)) {
    return null;
  }
  return Schemas.Post.updateOne(
    { uid },
    { $push: { likes: username } },
  );
}

async function unlikePost(username, uid) {
  console.log('unliking post: ', username, ', ', uid);
  const existingUser = await getUser(username);
  const post = await getPost(uid);
  if (existingUser == null || post == null
    || (existingUser.username !== post.username
      && existingUser.followees.indexOf(post.username) === -1)) {
    return null;
  }
  return Schemas.Post.updateOne(
    { uid },
    { $pull: { likes: username } },
  );
}

function getUsersForTerm(term) {
  const regex = new RegExp(`^${term}`, 'i');
  return Schemas.User.find(
    { username: { $regex: regex } }, { username: 1, profilePicture: 1 },
  ).limit(10);
}

function getSearchSuggestions(username, term) {
  const p1 = getFolloweesForUsername(username);
  const p2 = getUsersForTerm(term);
  return Promise.all([p1, p2]).then((data) => {
    const f = new Set(data[0]);
    const sugg = data[1];
    const result = [];
    for (let i = 0; i < sugg.length; i += 1) {
      const obj = sugg[i];
      if (obj.username !== username) {
        result.push(
          {
            username: obj.username,
            profilePicture: obj.profilePicture,
            following: f.has(obj.username),
          },
        );
      }
    }
    return result;
  });
}

/**
 * Adds comment to the given post... How cool this is autogenerated!
 * @throws {Promise.reject("no post found")} if post doesnt exist
 * @param {String} postID
 * @param {String} username
 * @param {String} comment
 * @returns {Object} the comment object
 */
function addComment(postID, username, comment) {
  // YO I added a uid field to comments in the schema
  // so we can identify them... you can generate one
  // using uuidv4() function. I already imported it.

}

/** feel free to delete these docs if theyre annoying
 * Edit the given comment on the given post
 * @throws {Promise.reject("no post found")} if post doesnt exist
 * @throws {Promise.reject("no comment found")} if comment doesnt exist
 * @param {String} postID
 * @param {String} commentID
 * @param {String} comment the new comment
 * @returns {Object} the new comment object
 */
function editComment(postID, commentID, comment) {

}

/**
 * delete comment
 * @throws {Promise.reject("no post found")} if post doesnt exist
 * @param {*} postID 
 * @param {*} commentID 
 */
function deleteComment(postID, commentID) {

}

/**
 * Update the post caption NOTE use mongos updateOne function,
 * dont get, edit, then save
 * @param {*} postID 
 * @param {*} caption 
 * @throws {Promise.reject("no post found")}
 * @returns updated post object
 */
function updatePost(postID, caption) {
  
}

/**
 * delete post
 * @param {*} postID 
 * @throws {Promise.reject("no post found")}
 * @returns nothing important
 */
function deletePost(postID) {

}

module.exports = {
  getUser,
  deleteUser,
  createUser,
  checkLogin,
  updateEmail,
  updateProfilePic,
  updatePassword,
  postPicture,
  createPost,
  followUser,
  unfollowUser,
  getFolloweesForUsername,
  getFollowersForUsername,
  getPost,
  getPostIdsForUserAndNum,
  getPostsForUserAndNum,
  likePost,
  unlikePost,
  getUsersForTerm,
  getSearchSuggestions,
  addComment,
  editComment,
  deleteComment,
  updatePost,
  deletePost,
};

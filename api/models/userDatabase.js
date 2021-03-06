/* eslint-disable */
const SHA256 = require('crypto-js/sha256');
const Schemas = require('./schemas.js');

// Returns a User from the database as a Promise, by username
function getUser(username) {
  return Schemas.User.findOne({ username }).exec();
}

function getUsers() {
  return Schemas.User.find({}, { _id: 0, username: 1 });
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

// Deletes a user from the database
function deleteUser(username) {
  return Schemas.User.deleteOne({ username }).exec();
}

async function getUsersForPost(postid) {
  const users = await Schemas.User.find({ posts: postid }, { _id: 0, username: 1 }).exec();
  return users.map((val) => val.username);
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

// Switch the user's privacy setting
async function switchPrivacy(username) {
  const user = await getUser(username);
  if (user == null) {
    return Promise.reject(new Error('no user found'));
  }
  user.private = !user.private;
  return user.save();
}

// Add a follow request to a user
async function addFollowRequest(username, requester) {
  return Schemas.User.updateOne(
    { username },
    { $addToSet: { requests: requester } },
  );
}

// Remove a follow request to a user (once accepted)
async function removeRequest(username, requester) {
  return Schemas.User.updateOne(
    { username },
    { $pull: { requests: requester } },
  );
}

// Checks correct user login
async function checkLogin(username, password) {
  const user = await getUser(username);
  if (user == null) {
    return Promise.reject(Error('No user'));
  }
  if (user.lockUntil && user.lockUntil > Date.now()) {
    await Schemas.User.updateOne({ username }, { $inc: { loginAttempts: 1 } });
    return Promise.reject(Error('account locked'));
  }
  if (user.password !== SHA256(password).toString()) {
    const updated = await Schemas.User.findOneAndUpdate({ username },
      { $inc: { loginAttempts: 1 } });
    if (updated.loginAttempts + 1 === 5) {
      await Schemas.User.updateOne({ username },
        { $set: { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } });
      return Promise.reject(Error('account locked'));
    }
    return Promise.reject(Error('incorrect password'));
  }
  return Schemas.User.findOneAndUpdate({ username },
    { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
}

function followUser(username, friend) { // follow a user
  const p1 = Schemas.User.updateOne(
    { username },
    { $addToSet: { followees: friend } },
  );
  const p2 = Schemas.User.updateOne(
    { username: friend },
    { $addToSet: { followers: username } },
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

function getFollowersForUsername(username) { //
  return Schemas.User.findOne({ username }, { followers: 1 })
    .then((user) => {
      if (user != null) return user.followers;
      return [];
    });
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

async function getFollowerSuggestions(username) {
  const firstDegree = await getFolloweesForUsername(username);
  firstDegree.push(username);
  const followees = new Set(firstDegree);
  const result = [];
  for (let i = 0; i < followees.size; i++) {
    let followee = firstDegree[i];
    let secondDegree = await getFolloweesForUsername(followee);
    for (let j = 0; j < secondDegree.length; j++) {
      const followFollowee = secondDegree[j];
      if (!followees.has(followFollowee)) {
        const pp = await getUserPP(followFollowee);
        result.push({ username: followFollowee, profilePicture: pp });
        if (result.length >= 5) {
          return result;
        }
      }
    }
  }
  return result;
}

async function getUserPP(username) {
  return Schemas.User.findOne({ username }, { _id : 0, profilePicture: 1}).then(data => data.profilePicture)
}


module.exports = {
  getUser,
  getUsers,
  deleteUser,
  createUser,
  getUsersForPost,
  checkLogin,
  updateEmail,
  updateProfilePic,
  updatePassword,
  switchPrivacy,
  addFollowRequest,
  removeRequest,
  followUser,
  unfollowUser,
  getFollowersForUsername,
  getFolloweesForUsername,
  getUsersForTerm,
  getSearchSuggestions,
  getFollowerSuggestions,
};

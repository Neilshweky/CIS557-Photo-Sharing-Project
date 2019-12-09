const SHA256 = require('crypto-js/sha256');
const Schemas = require('./schemas.js');

// Returns a User from the database as a Promise, by username
function getUser(username) {
  return Schemas.User.findOne({ username }).exec();
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
    { $push: { requests: requester } },
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


module.exports = {
  getUser,
  deleteUser,
  createUser,
  checkLogin,
  updateEmail,
  updateProfilePic,
  updatePassword,
  switchPrivacy,
  addFollowRequest,
  followUser,
  unfollowUser,
  getFollowersForUsername,
  getFolloweesForUsername,
  getUsersForTerm,
  getSearchSuggestions,
};

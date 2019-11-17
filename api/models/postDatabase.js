/* eslint-disable */
const SHA256 = require('crypto-js/sha256');
const uuidv4 = require('uuid/v4');
const Schemas = require('./schemas.js');
const user = require('./userDatabase.js');

function createPost(picture, username, caption="") {
  const post = new Schemas.Post({ picture, username, caption });
  return post.save();
}

function getPost(uid) {
  return Schemas.Post.findOne({ uid });
}

// 1. create a post
// 2. get all of current users friends
function postPicture(picture, username, caption) {
  return Promise
    .all([createPost(picture, username, caption), user.getFollowersForUsername(username)])
    .then((values) => {
      const post = values[0];
      const friends = values[1];
      friends.push(username);
      console.log(friends);
      return addPostIDToUsers(post.uid, friends).then(() => post);
    });
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
  const existingUser = await user.getUser(username);
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
  const existingUser = await user.getUser(username);
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
  // Use moment().unix() for the timestamp

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
  createPost,
  getPost,
  postPicture,
  getPostIdsForUserAndNum,
  getPostsForUserAndNum,
  likePost,
  unlikePost,
  addComment,
  editComment,
  deleteComment,
  updatePost,
  deletePost,
};

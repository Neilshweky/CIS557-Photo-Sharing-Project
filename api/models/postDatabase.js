/* eslint-disable */
const SHA256 = require('crypto-js/sha256');
const uuidv4 = require('uuid/v4');
const moment = require('moment');

const Schemas = require('./schemas.js');
const user = require('./userDatabase.js');

const QUERY_SIZE = 10;

function createPost(picture, username, caption = "") {
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
      return addPostIDToUsers(post.uid, friends).then(() => post).catch(console.log);
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
    { posts: { $slice: [num, QUERY_SIZE] } })
    .then((data) => { if (data == null) { return null; } return data.posts; });
}

async function getPostsForUserAndNum(username, num) {
  results = [];
  while (results.length <= QUERY_SIZE) {
    const posts = await getPostIdsForUserAndNum(username, parseInt(num, 10))
    if (posts == null) {
      return Promise.resolve(results.slice(0, QUERY_SIZE));
    }
    const data = await Promise.all(posts.map((post) => getPost(post)));
    results = results.concat(data.filter((elem) => elem !== null));
    if (posts < QUERY_SIZE) {
      return Promise.resolve(results.slice(0, QUERY_SIZE))
    }
    num += QUERY_SIZE;

  }
  return Promise.resolve(results.slice(0, QUERY_SIZE))
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

// Adds a comment to the given post
async function addComment(postID, username, comment) {
  const newComment = {
    uid: uuidv4(),
    timestamp: moment().unix(),
    username: username,
    comment: comment
  };
  return Schemas.Post.updateOne({ uid: postID }, { $push: { comments: newComment } }).then(data => {
    if (data.nModified == 0) {
      return Promise.reject('No post found to add comment');
    } else {
      return newComment;
    }
  })
}

// Edits the comment with the given ID on the given post
async function editComment(postID, commentID, comment) {
  const post = await getPost(postID);
  if (!post) {
    throw new Error('No post found to edit comment');
  }
  const edit = await Schemas.Post.updateOne(
    { uid: postID, 'comments.uid': commentID },
    { $set: { 'comments.$.comment': comment } }
  );
  if (edit.nModified == 0) {
    throw new Error('No comment found to edit');
  }
  return edit;
}

// Deletes the comment with the given ID from the given post
async function deleteComment(postID, commentID) {
  const post = await getPost(postID);
  if (!post) {
    throw new Error('No post found for deletion');
  }
  return Schemas.Post.updateOne(
    { uid: postID },
    { $pull: { comments: { uid: commentID } } }
  );
}

// Update the post caption
async function updatePost(postID, caption) {
  return Schemas.Post.updateOne({ uid: postID }, { $set: { caption } }).then(data => {
    if (data.nModified == 0) {
      return Promise.reject('No post found to update');
    } else {
      return caption;
    }
  })
}

// Deletes the post with the given post ID
function deletePost(postID) {
  return Schemas.Post.deleteOne({ uid: postID }).exec();
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
  QUERY_SIZE
};

const userDB = require('../models/userDatabase.js');
const postDB = require('../models/postDatabase.js')

// Route for '/signup', creates a new user
const signup = (req, res) => {
  if (!req.body.username || !req.body.password || !req.body.email) {
    res.status(400).send('Username, password and email are required to sign up.');
  } else {
    const { username } = req.body;
    const { password } = req.body;
    const { email } = req.body;
    const pic = req.body.profile_picture;
    userDB.getUser(username)
      .then((existingUser) => {
        if (existingUser != null) {
          res.status(400).send(`The username ${username} is already in use.`);
        } else {
          userDB.createUser(username, email, password, pic)
            .then((data) => res.status(201).send(data))
            .catch((err) => res.status(500).send(err));
        }
      })
      .catch((err) => res.status(500).send(err));
  }
};

// Route for '/login', checks correct authentication
const login = (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send('Please enter username and password to log in.');
  } else {
    const { username } = req.body;
    const { password } = req.body;
    userDB.checkLogin(username, password)
      .then((user) => {
        if (user == null) {
          res.status(401).send('Invalid username and password combination.');
        } else {
          res.status(200).send(`${username} is now logged in.`);
        }
      })
      .catch((err) => {
        console.log('HERE');
        res.status(500).send(err);
      });
  }
};

// Route for '/updateProfile', updates the user's profile
const updateProfile = (req, res) => {
  const { username } = req.body;
  if (req.body.email) {
    userDB.updateEmail(username, req.body.email)
      .then((data) => res.status(201).send(data))
      .catch((err) => {
        if (err.message === 'no user found') res.status(400).send(err.message);
        else res.status(500).send(err);
      });
  } else if (req.body.profilePicture) {
    userDB.updateProfilePic(username, req.body.profilePicture)
      .then((data) => res.status(201).send(data))
      .catch((err) => {
        if (err.message === 'no user found') res.status(400).send(err.message);
        else res.status(500).send(err.message);
      });
  } else if (req.body.oldPassword && req.body.newPassword) {
    userDB.updatePassword(username, req.body.oldPassword, req.body.newPassword)
      .then((data) => res.status(201).send(data))
      .catch((err) => {
        if (err.message === 'no user found' || err.message === 'incorrect password') res.status(400).send(err.message);
        else res.status(500).send(err.message);
      });
  } else {
    res.status(400).send('Invalid profile update');
  }
};

const postPicture = (req, res) => {
  if (!req.body.pic) {
    res.status(400).send('Picture is required to create post.');
  } else {
    const { pic, username, caption } = req.body;
    postDB.postPicture(pic, username, caption)
      .then((data) => res.status(201).send(data))
      .catch((err) => res.status(500).send(err));
  }
};

const getUser = (req, res) => {
  const { username } = req.params;
  userDB.getUser(username).then((data) => {
    if (data === undefined || data === null) res.status(404).send({});
    else res.status(200).send(data);
  }).catch((err) => res.status(500).send(err));
};

const deleteUser = (req, res) => {
  const { username } = req.params;
  userDB.deleteUser(username).then((data) => {
    if (data === undefined || data === null) res.status(404).send({});
    else res.status(200).send(data);
  }).catch((err) => res.status(500).send(err));
};

const getPosts = (req, res) => {
  const { username, num } = req.params;
  postDB.getPostsForUserAndNum(username, num).then((posts) => {
    res.status(200).send(posts);
  }).catch((err) => {
    res.status(500).send(err);
  });
};

const likePost = (req, res) => {
  const { username, postid } = req.params;
  userDB.getUser(username).then((user) => {
    if (user == null) {
      res.status(400).send(`There is no such user ${username}.`);
    } else if (user.username !== username && user.followees.indexOf(username) === -1) {
      res.status(400).send(`${username} does not follow original poster.`);
    } else {
      postDB.likePost(username, postid).then(() => { res.status(200).send('Post liked'); }).catch((err) => res.status(500).send(err));
    }
  });
};

const unlikePost = (req, res) => {
  const { username, postid } = req.params;
  postDB.unlikePost(username, postid).then(() => { res.status(200).send('Post unliked'); }).catch((err) => res.status(500).send(err));
};

const follow = (req, res) => {
  const { username, friend } = req.params;
  userDB.followUser(username, friend).then(() => { res.status(200).send(`${username} followed ${friend}`); }).catch((err) => res.status(500).send(err));
};

const unfollow = (req, res) => {
  const { username, friend } = req.params;
  userDB.unfollowUser(username, friend).then(() => { res.status(200).send(`${username} unfollowed ${friend}`); }).catch((err) => res.status(500).send(err));
};

const searchUsers = (req, res) => {
  const { username, term } = req.params;
  userDB.getSearchSuggestions(username, term).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(500).send(err);
  });
};

// POST EDIT ROUTES

const updatePost = (req, res) => {
  const { postID } = req.params;
  const { caption } = req.body;
  if (!caption) {
    res.status(400).send('New caption is required to update post');
  }
  postDB.updatePost(postID, caption)
    .then((data) => res.status(200).send(data))
    .catch((err) => {
      if (err.message === 'No post found to edit') {
        res.status(400).send(err);
      } else {
        res.status(500).send(err);
      }
    });
};

const deletePost = (req, res) => {
  const { postID } = req.params;
  postDB.deletePost(postID)
    .then((data) => {
      if (data === undefined || data === null) {
        res.status(404).send({});
      }
      else {
        res.status(200).send(data);
      }
    })
    .catch((err) => res.status(500).send(err));
};

// COMMENT EDIT ROUTES

const addComment = (req, res) => {
  const { postID, username } = req.params;
  const { comment } = req.body;
  if (!comment) {
    res.status(400).send('New comment required');
  }
  postDB.addComment(postID, username, comment)
    .then((data) => res.status(200).send(data))
    .catch((err) => {
      if (err.message === 'No post found to add comment') {
        res.status(400).send(err);
      }
      else {
        res.status(500).send(err);
      }
    });
};

const editComment = (req, res) => {
  const { postID, commentID } = req.params;
  const { comment } = req.body;
  if (!comment) {
    res.status(400).send('Edit comment required');
  }
  postDB.editComment(postID, commentID, comment)
    .then((data) => res.status(200).send(data))
    .catch((err) => {
      if (err.message === 'No post found to edit comment' ||
          err.message === 'No comment found to edit') {
        res.status(400).send(err);
      }
      else {
        res.status(500).send(err);
      }
    });
};

const deleteComment = (req, res) => {
  const { postID, commentID } = req.params;
  postDB.deleteComment(postID, comment)
    .then((data) => {
      if (data === undefined || data === null) {
        res.status(404).send({});
      }
      else {
        res.status(200).send(data);
      }
    })
    .catch((err) => res.status(500).send(err));
};

module.exports = {
  signup,
  login,
  updateProfile,
  postPicture,
  getUser,
  deleteUser,
  getPosts,
  likePost,
  unlikePost,
  follow,
  unfollow,
  searchUsers,
  updatePost,
  deletePost,
  addComment,
  editComment,
  deleteComment,
};

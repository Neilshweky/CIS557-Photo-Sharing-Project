const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const userDB = require('../models/userDatabase.js');
const postDB = require('../models/postDatabase.js');

// Route for '/signup', creates a new user
const signup = (req, res) => {
  if (!req.body.username || !req.body.password || !req.body.email) {
    res.status(400).send('Username, password and email are required to sign up.');
  } else {
    const {
      username, password, email,
    } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorString = errors.errors.map((error) => error.msg).join('<br>');
      res.status(422).send(errorString);
    } else {
      userDB.getUser(username)
        .then((existingUser) => {
          if (existingUser != null) {
            res.status(400).send(`The username ${username} is already in use.`);
          } else {
            console.log(req.body.username);
            userDB.createUser(username, email, password)
              .then((data) => {
                jwt.sign(
                  { username },
                  'secretkey', { expiresIn: '1h' },
                  (err, token) => {
                    res.status(201).send({ message: `${username} is now logged in.`, token, data });
                  },
                );
              })
              .catch((err) => res.status(500).send(err));
          }
        })
        .catch((err) => res.status(500).send(err));
    }

  }
};

// Route for '/login', checks correct authentication
const login = (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send('Please enter username and password to log in.');
  } else {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorString = errors.errors.map((error) => error.msg).join('<br>');
      res.status(422).send(errorString);
    } else {
      const { username, password } = req.body;
      userDB.checkLogin(username, password)
        .then(() => {
          jwt.sign(
            { username },
            'secretkey', { expiresIn: '1h' },
            (err, token) => {
              res.status(200).send({ message: `${username} is now logged in.`, token });
            },
          );
        })
        .catch((err) => {
          switch (err.message) {
            case 'No user':
            case 'incorrect password':
              res.status(401).send('Invalid username and password combination.');
              break;
            case 'account locked':
              res.status(403).send('Account Locked.');
              break;
            default:
              res.status(500).send(err);
              break;
          }
        });
    }
  }
};

// Route for '/updateProfile', updates the user's profile
const updateProfile = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorString = errors.errors.map((error) => error.msg).join('<br>');
    res.status(422).send(errorString);
  } else {
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
  }
};

const postPicture = (req, res) => {
  if (!req.body.pic) {
    res.status(400).send('Picture is required to create post.');
  } else {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorString = errors.errors.map((error) => error.msg).join('<br>');
      res.status(422).send(errorString);
    } else {
      const { pic, username, caption } = req.body;
      postDB.postPicture(pic, username, caption)
        .then((data) => res.status(201).send(data))
        .catch((err) => res.status(500).send(err));
    }
  }
};

const getUser = (req, res) => {
  let { username } = req.params;
  if (!username) {
    username = req.decoded.username;
  }
  userDB.getUser(username).then((data) => {
    if (data === undefined || data === null) res.status(404).send('User not found');
    else res.status(200).send(data);
  }).catch((err) => res.status(500).send(err));
};

const deleteUser = (req, res) => {
  const { username } = req.params;
  userDB.deleteUser(username).then((data) => {
    if (data === undefined || data === null) res.status(404).send('User not found');
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
      res.status(404).send(`There is no such user ${username}.`);
    } else if (user.username !== username && user.followees.indexOf(username) === -1) {
      res.status(409).send(`${username} does not follow original poster.`);
    } else {
      postDB.likePost(username, postid)
        .then(() => { res.status(200).send('Post liked'); })
        .catch((err) => res.status(500).send(err));
    }
  });
};

const unlikePost = (req, res) => {
  const { username, postid } = req.params;
  userDB.getUser(username).then((user) => {
    if (user == null) {
      res.status(404).send(`There is no such user ${username}.`);
    } else if (user.username !== username && user.followees.indexOf(username) === -1) {
      res.status(409).send(`${username} does not follow original poster.`);
    } else {
      postDB.unlikePost(username, postid)
        .then(() => { res.status(200).send('Post unliked'); })
        .catch((err) => res.status(500).send(err));
    }
  });
};

const follow = (req, res) => {
  const { username, friend } = req.params;
  userDB.getUser(username).then((user) => {
    if (user == null) {
      res.status(404).send(`There is no such user ${username}.`);
    } else if (user.followees.indexOf(friend) !== -1) {
      res.status(409).send(`${username} already follows ${friend}.`);
    } else {
      userDB.followUser(username, friend)
        .then(() => { res.status(200).send(`${username} followed ${friend}`); })
        .catch((err) => res.status(500).send(err));
    }
  });
};

const unfollow = (req, res) => {
  const { username, friend } = req.params;
  userDB.getUser(username).then((user) => {
    if (user == null) {
      res.status(404).send(`There is no such user ${username}.`);
    } else if (user.followees.indexOf(friend) === -1) {
      res.status(409).send(`${username} does not follow ${friend}.`);
    } else {
      userDB.unfollowUser(username, friend)
        .then(() => { res.status(200).send(`${username} unfollowed ${friend}`); })
        .catch((err) => res.status(500).send(err));
    }
  });
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
  } else {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorString = errors.errors.map((error) => error.msg).join('<br>');
      res.status(422).send(errorString);
    } else {
      postDB.updatePost(postID, caption)
        .then((data) => res.status(200).send(data))
        .catch((err) => {
          if (err.message === 'No post found to edit') {
            res.status(404).send(err);
          } else {
            res.status(500).send(err);
          }
        });
    }
  }
};

const deletePost = (req, res) => {
  const { postID } = req.params;
  if (!postID) {
    res.status(400).send('PostID is required to delete post');
  } else {
    postDB.deletePost(postID)
      .then((data) => {
        if (data === undefined || data === null) {
          res.status(404).send({});
        } else {
          res.status(200).send(data);
        }
      })
      .catch((err) => res.status(500).send(err));
  }
};

// COMMENT EDIT ROUTES

const addComment = (req, res) => {
  const { postID, username } = req.params;
  const { comment } = req.body;
  if (!comment || !postID || !username) {
    res.status(400).send('A comment, postID, and username are required');
  } else {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorString = errors.errors.map((error) => error.msg).join('<br>');
      res.status(422).send(errorString);
    } else {
      postDB.addComment(postID, username, comment)
        .then((data) => res.status(200).send(data))
        .catch((err) => {
          if (err === 'No post found to add comment') {
            res.status(404).send(err);
          } else {
            res.status(500).send(err);
          }
        });
    }

  }
};

const editComment = (req, res) => {
  const { postID, commentID } = req.params;
  const { comment } = req.body;
  if (!comment || !postID || !commentID) {
    res.status(400).send('A comment, postID, and commentID are required');
  } else {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorString = errors.errors.map((error) => error.msg).join('<br>');
      res.status(422).send(errorString);
    } else {
      postDB.editComment(postID, commentID, comment)
        .then((data) => res.status(200).send(data))
        .catch((err) => {
          if (err.message === 'No post found to edit comment'
            || err.message === 'No comment found to edit') {
            res.status(404).send(err);
          } else {
            res.status(500).send(err);
          }
        });
    }
  }
};

const deleteComment = (req, res) => {
  const { postID, commentID } = req.params;
  if (!postID || !commentID) {
    res.status(400).send('A postID and commentID are required');
  } else {
    postDB.deleteComment(postID, commentID)
      .then((data) => {
        if (data === undefined || data === null) {
          res.status(404).send('post not found');
        } else {
          res.status(200).send(data);
        }
      })
      .catch((err) => res.status(500).send(err));
  }
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

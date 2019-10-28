var db = require('../models/database.js');

// Route for '/signup', creates a new user
const signup = (req, res) => {
    if (!req.body.username || !req.body.password || !req.body.email) {
      res.status(400).send('Username, password and email are required to sign up.');
    } else {
      const username = req.body.username;
      const password = req.body.password;
      const email = req.body.email;
      const pic = req.body.profile_picture;
      db.getUser(username)
        .then(existingUser => {
          if (existingUser != null) {
            res.status(400).send('The username ' + username + ' is already in use.');
          } else {
            db.createUser(username, email, password, pic)
              .then(data => res.status(201).send(data))
              .catch(err => res.status(500).send(err));
          }
        })
        .catch(err => res.status(500).send(err));
    }
}

// Route for '/login', checks correct authentication
const login = (req, res) => {
    //TODO: call the db function here
}

const post_picture = (req, res) => {
    console.log("posting picture", req.body)
    if (!req.body.pic) {
        console.log("gere")
        res.status(400).send('Picture is required to create post.')
    } else {
        console.log("here")

        db.postPicture(req.body.pic, req.body.username)
            .then(data => res.status(201).send(data))
            .catch(err => res.status(400).send(err))
    }
}

module.exports = {
    signup,
    login,
    post_picture
}

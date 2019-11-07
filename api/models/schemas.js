const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
const moment = require('moment');

mongoose.connect('mongodb://localhost/cis557_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { Schema } = mongoose;
const trim = (str) => str.trim();

const User = new Schema({
  username: {
    type: String, required: true, unique: true, set: trim,
  },
  email: {
    type: String, required: true, unique: true, set: trim,
  },
  password: { type: String, required: true },
  profilePicture: String,
  friends: Array,
  posts: Array,
});

const Post = new Schema({
  uid: String,
  username: { type: String, required: true },
  picture: { type: String, required: true },
  likes: Array,
  comments: [{ username: String, comment: String }],
  timestamp: Number,
});

Post.pre('validate', function setUID(next) {
  this.uid = uuidv4();
  this.timestamp = moment().unix();
  next();
});


module.exports = { User: mongoose.model('User', User), Post: mongoose.model('Post', Post) };

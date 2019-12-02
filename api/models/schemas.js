const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
const moment = require('moment');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/cis557', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to mongo', process.env.MONGO_URI || 'mongodb://localhost/cis557')).catch(console.log);
mongoose.set('useFindAndModify', false);

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
  followers: Array, // IN adjacanecy list
  followees: Array, // OUT adjacency list
  posts: Array,
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Number },
});

const Post = new Schema({
  uid: String,
  username: { type: String, required: true },
  picture: { type: String, required: true },
  caption: String,
  likes: Array,
  comments: [{
    uid: String, username: String, comment: String, timestamp: Number,
  }],
  timestamp: Number,
});

Post.pre('validate', function setUID(next) {
  this.uid = uuidv4();
  this.timestamp = moment().unix();
  next();
});


module.exports = { User: mongoose.model('User', User), Post: mongoose.model('Post', Post) };

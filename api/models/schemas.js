const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

mongoose.connect('mongodb://localhost/cis557_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Schema = mongoose.Schema;
const trim = str => str.trim();

const User = new Schema({
    username: {type: String, required: true, unique: true, set: trim},
    email: {type: String, required: true, unique: true, set: trim},
    password: {type: String, required: true},
    profile_picture: String,
    friends: Array,
    posts: Array
})

const Post = new Schema({
    uid: String,
    username: {type: String, required:true},
    picture: {type: String, required:true},
    likes: Array,
    comments: [{username: String, comment: String}]
})

Post.pre('save', function(next) {
    this.uid = uuidv4();
    next();
})


module.exports = {User: mongoose.model('User', User), Post: mongoose.model('Post', Post)}

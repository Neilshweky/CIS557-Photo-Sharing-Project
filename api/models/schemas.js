const mongoose = require('mongoose');
 
mongoose.connect('mongodb://localhost/cis557_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Schema = mongoose.Schema;

const User = new Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profile_picture: String,
    friends: Array,
    posts: Array
})

// const Post = new Schema({
//     uid: String,
//     pic: {type: String, required:true},
//     Likes
// })

module.exports = {User: mongoose.model('User', User)}
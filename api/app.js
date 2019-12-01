const express = require('express');
const { check } = require('express-validator');
const jwt = require('jsonwebtoken');

const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

require('./models/userDatabase.js');
require('./models/postDatabase.js');

app.use(bodyParser.urlencoded({ extended: true, limit: '8mb' }));
app.use(bodyParser.json({ limit: '8mb' }));

// app.use(express.logger("default"));
app.use(cookieParser());
app.use(session({
  secret: 'some_secret',
  resave: false,
  saveUninitialized: true,
  // For now, we must set this to false because cookie will only work over https
  cookie: { secure: false },
}));
const cors = require('cors');
const routes = require('./routes/routes.js');

app.use(cors());

function validateToken(req, res, next) {
  const excluded = ['/login', '/signup'];
  if (excluded.indexOf(req.url) > -1) {
    return next();
  }
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    return jwt.verify(bearerToken, 'secretkey', (err, result) => {
      if (err) {
        res.sendStatus(403);
      }
      req.decoded = result;
      next();
    });
  }
  return res.sendStatus(403);
}

// validation on all routes except /login and /signup

app.use(validateToken);

// Used to link js and css files
// app.use(express.static('views/css'));
// app.use(express.static('views/js'));

app.get('/', (req, res) => { res.send('Hello, World\n'); });

app.post('/signup', routes.signup);
app.post('/login', [
  // password must be at least 5 chars long
  check('password').isLength({ min: 5 })], routes.login);
app.post('/postpicture', routes.postPicture);
app.put('/updatePost/:postID', routes.updatePost);//
app.post('/like/:postid/:username', routes.likePost);
app.post('/unlike/:postid/:username', routes.unlikePost);
app.post('/follow/:username/:friend', routes.follow);
app.post('/unfollow/:username/:friend', routes.unfollow);
app.post('/addComment/:postID/:username', routes.addComment);
app.put('/editComment/:postID/:commentID', routes.editComment);

app.get('/user/:username?', routes.getUser);
app.get('/posts/:username/:num', routes.getPosts);
app.get('/searchusers/:username/:term', routes.searchUsers);

app.put('/user', routes.updateProfile);//
app.delete('/user/:username', routes.deleteUser);
app.delete('/post/:postID', routes.deletePost);//
app.delete('/comment/:postID/:commentID', routes.deleteComment);//

console.log('Authors: Neil Shweky (nshweky), Sarah Baumgarten (sbaumg), & Carlos Bros (cbros)');
const port = process.env.PORT || '8080';
app.listen(port);
console.log(`Server running on port ${port}. Now open http://localhost:${port}/ in your browser!`);

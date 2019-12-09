const express = require('express');
const { check } = require('express-validator');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');
require('./models/userDatabase.js');
require('./models/postDatabase.js');

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);
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
app.use(mongoSanitize({
  replaceWith: '_',
}));

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 10, // limit each IP to 10 requests per windowMs
});

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
        if (err instanceof jwt.TokenExpiredError) {
          res.status(403).send('Token expired');
        } else {
          res.sendStatus(403);
        }
      } else {
        req.decoded = result;
        next();
      }
    });
  }
  return res.sendStatus(403);
}

// validation on all routes except /login and /signup

app.use(validateToken);
// app.use(limiter);

// Used to link js and css files
// app.use(express.static('views/css'));
// app.use(express.static('views/js'));

app.get('/', (req, res) => { res.send('Hello, World\n'); });

app.post('/signup', [
  check('username').isAlphanumeric().withMessage('Username must be alphanumeric').isLength({ min: 1, max: 12 })
    .withMessage('Username cannot be empty and must be less than 12 characters'),
  check('email').isEmail().withMessage('Email address must be valid').trim()
    .normalizeEmail(),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches('[0-9]')
    .withMessage('Must contain number')
    .matches('[a-z]')
    .withMessage('must contain lowercase letter')
    .matches('[A-Z]')
    .withMessage('Must contain uppercase')
    .matches('[@$!%*?&]')
    .withMessage('Must contain special character')], routes.signup);
app.post('/login', [check('username').isLength({ max: 50 }), check('password').isLength({ max: 50 })], routes.login);
app.post('/postpicture', [limiter, check('caption').isLength({ max: 200 })], routes.postPicture);
app.put('/updatePost/:postID', [check('caption').isLength({ max: 200 })], routes.updatePost);
app.post('/like/:postid/:username', routes.likePost);
app.post('/unlike/:postid/:username', routes.unlikePost);
app.post('/addtag/:postid/:username', routes.addTag);
app.post('/removetag/:postid/:username', routes.removeTag);
app.post('/follow/:username/:friend', routes.follow);
app.post('/accept/:username/:follower', routes.acceptRequest);
app.post('/unfollow/:username/:friend', routes.unfollow);
app.post('/addComment/:postID/:username', [check('comment').isLength({ max: 200 })], routes.addComment);
app.put('/editComment/:postID/:commentID', [check('comment').isLength({ max: 200 })], routes.editComment);


app.get('/user/:username?', routes.getUser);
app.get('/users', routes.getUsers);
app.get('/posts/:username/:num', routes.getPosts);
app.get('/searchusers/:username/:term', routes.searchUsers);
app.get('/followersuggestions/:username', routes.followerSuggestions);


app.put('/user', [check('email').isEmail().withMessage('Email address must be valid').trim()
  .normalizeEmail(),
check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches('[0-9]')
  .withMessage('Must contain number')
  .matches('[a-z]')
  .withMessage('must contain lowercase letter')
  .matches('[A-Z]')
  .withMessage('Must contain uppercase')
  .matches('[@$!%*?&]')
  .withMessage('Must contain special character')], routes.updateProfile);
app.put('/privacy/:username', routes.switchPrivacy);

app.delete('/user/:username', routes.deleteUser);
app.delete('/post/:postID', routes.deletePost);
app.delete('/comment/:postID/:commentID', routes.deleteComment);

console.log('Authors: Neil Shweky (nshweky), Sarah Baumgarten (sbaumg), & Carlos Bros (cbros)');
const port = process.env.PORT || '8080';
app.listen(port);
console.log(`Server running on port ${port}. Now open http://localhost:${port}/ in your browser!`);

const express = require('express');

const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
require('./models/database.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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

// Used to link js and css files
// app.use(express.static('views/css'));
// app.use(express.static('views/js'));

app.get('/', (req, res) => { res.send('Hello, World\n'); });
app.post('/signup', routes.signup);
app.post('/login', routes.login);
app.post('/postpicture', routes.postPicture);
app.get('/user/:username', routes.getUser);
app.delete('/user/:username', routes.deleteUser);
app.get('/posts/:username/:num', routes.getPosts);
app.post('/like/:postid/:username', routes.likePost);

console.log('Authors: Neil Shweky (nshweky), Sarah Baumgarten (sbaumg), & Carlos Bros (cbros)');
const port = process.env.PORT || '8080';
app.listen(port);
console.log(`Server running on port ${port}. Now open http://localhost:${port}/ in your browser!`);

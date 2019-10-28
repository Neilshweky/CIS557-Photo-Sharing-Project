var express = require('express');
var routes = require('./routes/routes.js');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var session = require('express-session');
var db = require('./models/database.js');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// app.use(express.logger("default"));
app.use(cookieParser());
app.use(session({
    secret: "some_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } //For now, we must set this to false because cookie will only work over https
}))
var cors = require("cors");
app.use(cors());

//Used to link js and css files
// app.use(express.static('views/css'));
// app.use(express.static('views/js'));

app.get('/', (req, res) => { res.send("Hello, World\n") });
app.post('/signup', routes.signup);
app.post('/login', routes.login);
app.post('/postpicture', routes.post_picture);
app.get('/user/:username', routes.get_user)


console.log('Authors: Neil Shweky (nshweky), Sarah Baumgarten (sbaumg), & Carlos Bros (cbros)');
var port = process.env.PORT || '8080'
var server = app.listen(port);
console.log('Server running on port ' + port + '. Now open http://localhost:' + port + '/ in your browser!');

var db = require('../models/database.js');

const sign_up = (req, res) => {
    //TODO: call the db function here
}

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
    sign_up,
    login,
    post_picture
}
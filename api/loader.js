const mongoose = require('mongoose');
const SHA256 = require('crypto-js/sha256');
const Schemas = require('./models/schemas');
const db = require('./models/postDatabase.js');

const user = new Schemas.User({
  username: 'neilshweky',
  email: 'nshweky@seas.upenn.edu',
  password: SHA256('cis557sucks'),
  followees: ['sarah', 'neilshweky2'],
  profilePicture: './pictures/cut-3.jpg',
});

const user2 = new Schemas.User({
  username: 'neilshweky2',
  email: 'nshweky2@seas.upenn.edu',
  password: SHA256('cis557sucks'),
  followers: ['neilshweky'],
  profilePicture: './pictures/cut-4.jpg',
});

const user3 = new Schemas.User({
  username: 'sarah',
  email: 'sbaumg@sas.upenn.edu',
  password: SHA256('123'),
  profilePicture: './pictures/cut-1.jpg',
  followers: ['neilshweky'],
});


async function loadData() {
  await Schemas.User.deleteMany();
  // { }, async () => {
  console.log('Users removed');
  await user.save().then(() => console.log('User neilshweky saved'))
    .catch((err) => console.log('There was an error', err));
  await user2.save().then(() => console.log('User neilshweky2 saved'))
    .catch((err) => console.log('There was an error', err));
  await user3.save().then(() => console.log('User Sarah saved'))
    .catch((err) => console.log('There was an error', err));
  await Schemas.Post.deleteMany();
  // { }, async () => {
  console.log('Posts deleted');
  await db.postPicture('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', 'neilshweky', 'hankkkk')
    .then(() => console.log('posted picture'));
  await mongoose.disconnect();
  // await
}

loadData();

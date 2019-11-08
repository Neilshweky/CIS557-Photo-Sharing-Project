const mongoose = require('mongoose');
const SHA256 = require('crypto-js/sha256');
const Schemas = require('./models/schemas');

const user = new Schemas.User({
  username: 'neilshweky',
  email: 'nshweky@seas.upenn.edu',
  password: SHA256('cis557sucks'),
});

const user2 = new Schemas.User({
  username: 'neilshweky2',
  email: 'nshweky2@seas.upenn.edu',
  password: SHA256('cis557sucks'),
  friends: ['neilshweky'],
});

const user3 = new Schemas.User({
  username: 'sarah',
  email: 'sbaumg@sas.upenn.edu',
  password: SHA256('123'),
  profilePicture: './pictures/cut-1.jpg',
  friends: ['neilshweky'],
});


const post = new Schemas.Post({
  picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/New_York_Rangers.svg/2000px-New_York_Rangers.svg.png',
  username: 'neilshweky',
});

async function loadData() {
  const p1 = Schemas.User.deleteMany({}, () => {
    console.log('Users removed');
    user.save().then(() => console.log('User saved'))
      .catch((err) => console.log('There was an error', err));
    user2.save().then(() => console.log('User saved'))
      .catch((err) => console.log('There was an error', err));
    user3.save().then(() => console.log('User Sarah saved'))
      .catch((err) => console.log('There was an error', err));
  });
  const p2 = Schemas.Post.deleteMany({}, () => {
    console.log('Posts removed');
    post.save().then(() => console.log('Post saved'))
      .catch((err) => console.log('There was an error', err));
  });

  await p1;
  await p2;
  await mongoose.disconnect();
}

loadData();

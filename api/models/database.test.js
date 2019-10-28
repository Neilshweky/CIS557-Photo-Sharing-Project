const db = require('./database.js');
const mongoose = require('mongoose');
const Schemas = require('./schemas');

beforeAll(async done => {
    await mongoose.disconnect();
    await mongoose.connect('mongodb://localhost/cis557_db_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    done();
});

describe('authentication tests', () => {

    beforeEach(async () => {
        await Schemas.User.deleteMany({});
    });

    test ('createUser test', async () => {
        var user = await db.createUser("neilshweky", "nshweky@seas.upenn.edu", "cis557", "some_pic");
        expect(user.username).toEqual("neilshweky");
        expect(user.email).toEqual("nshweky@seas.upenn.edu");
        expect("password" in user).toEqual(true);
        expect(user.profile_picture).toEqual("some_pic");
        expect(Array.from(user.friends)).toEqual([]);
        expect(Array.from(user.posts)).toEqual([]);
    });

    test ('createUser duplicate', async () => {
        await db.createUser("neilshweky", "nshweky@seas.upenn.edu", "cis557", "some_pic");
        var user2 = await db.createUser("neilshweky", "nshweky2@seas.upenn.edu", "cis557", "some_pic");
        expect(user2).toEqual(undefined);
    });

    test ('checkLogin successful', async () => {
        var user = await db.createUser("neilshweky", "nshweky@seas.upenn.edu", "cis557", "some_pic");
        var result = await db.checkLogin("neilshweky", "cis557");
        expect(result.username).toEqual(user.username);
        expect(result.password).toEqual(user.password);
        expect(result.email).toEqual(user.email);
        expect(result.profile_picture).toEqual(user.profile_picture);
    });

    test ('checkLogin not successful', async () => {
        var user = await db.createUser("neilshweky", "nshweky@seas.upenn.edu", "cis557", "some_pic");
        var result = await db.checkLogin("neilshweky", "cis557-2");
        expect(result).toEqual(null);
    });
});

describe('friend tests', () => {

  beforeEach (async () => {
    await Schemas.User.deleteMany({});
    await db.createUser("user1", "user1@seas.upenn.edu", "pw-1", "pic1");
    await db.createUser("user2", "user2@seas.upenn.edu", "pw-2", "pic2");
    await db.createUser("user3", "user3@seas.upenn.edu", "pw-3", "pic3");
  });

  test ('addFriend and getFriend test', async () => {
    await db.addFriend("user1", "user2");
    await db.addFriend("user1", "user3");
    await db.addFriend("user2", "user3");
    var user1Friends = await db.getFriendsForUsername("user1");
    expect(user1Friends[0]).toEqual("user2");
    expect(user1Friends[1]).toEqual("user3");
    var user2Friends = await db.getFriendsForUsername("user2");
    expect(user2Friends[0]).toEqual("user3");
  });
});

describe('post tests', () => {

  beforeEach(async () => {
    await Schemas.Post.deleteMany({});
    await db.createUser("cbros", "cbros@seas.upenn.edu", "pw-1", "pic1");
    await db.createUser("neilshweky", "nshweky@seas.upenn.edu", "pw-2", "pic2");
    await db.addFriend("cbros", "neilshweky");
  });

  test ('createPost test', async () => {
    var post = await db.createPost("some_pic", "cbros");
    expect(post.username).toEqual("cbros");
    expect(post.picture).toEqual("some_pic");
    expect(Array.from(post.likes)).toEqual([]);
    expect(Array.from(post.comments)).toEqual([]);
  });

  test ('postPicture test', async () => {
    var post = await db.postPicture("picture", "cbros");
    expect(post.username).toEqual("cbros");
    expect(post.picture).toEqual("picture");
    // Check that post appears in friend's feed
    var friend = await db.getUser("neilshweky");
    expect(friend.posts[0]).toEqual(post.uid);
  });

});

afterAll(async done => {
    mongoose.disconnect();
    done();
});

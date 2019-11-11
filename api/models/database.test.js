const mongoose = require('mongoose');
const db = require('./database.js');
const Schemas = require('./schemas');

beforeAll(async (done) => {
  await mongoose.disconnect();
  await mongoose.connect('mongodb://localhost/cis557_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  done();
});

describe('authentication tests', () => {
  beforeEach(async () => {
    await Schemas.User.deleteMany({});
  });

  test('createUser test', async () => {
    const user = await db.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'cis557', 'some_pic');
    expect(user.username).toEqual('neilshweky');
    expect(user.email).toEqual('nshweky@seas.upenn.edu');
    expect('password' in user).toEqual(true);
    expect(user.profilePicture).toEqual('some_pic');
    expect(Array.from(user.followers)).toEqual([]);
    expect(Array.from(user.followees)).toEqual([]);
    expect(Array.from(user.posts)).toEqual([]);
  });

  test('createUser duplicate', async () => {
    await db.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'cis557', 'some_pic');
    const user2 = await db.createUser('neilshweky', 'nshweky2@seas.upenn.edu', 'cis557', 'some_pic');
    expect(user2).toEqual(undefined);
  });

  test('checkLogin successful', async () => {
    const user = await db.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'cis557', 'some_pic');
    const result = await db.checkLogin('neilshweky', 'cis557');
    expect(result.username).toEqual(user.username);
    expect(result.password).toEqual(user.password);
    expect(result.email).toEqual(user.email);
    expect(result.profilePicture).toEqual(user.profilePicture);
  });

  test('checkLogin not successful', async () => {
    await db.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'cis557', 'some_pic');
    const result = await db.checkLogin('neilshweky', 'cis557-2');
    expect(result).toEqual(null);
  });
});

describe('User tests', () => {
  beforeEach(async () => {
    await Schemas.User.deleteMany({});
  });

  test('getUser existing user test', async () => {
    const user = await db.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'cis557', 'some_pic');
    const fetchedUser = await db.getUser(user.username);
    expect(fetchedUser.username).toEqual('neilshweky');
    expect(fetchedUser.email).toEqual('nshweky@seas.upenn.edu');
  });

  test('getUser no such user', async () => {
    const nonExisting = await db.getUser('efouh');
    expect(nonExisting).toEqual(null);
  });

  test('deleteUser existing user test', async () => {
    const user = await db.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'cis557', 'some_pic');
    const deletedUser = await db.deleteUser(user.username);
    expect(deletedUser.deletedCount).toBe(1);
    const nonExisting = await db.getUser('neilshweky');
    expect(nonExisting).toEqual(null);
  });

  test('deleteUser no such user', async () => {
    const nonExisting = await db.deleteUser('efouh');
    expect(nonExisting.deletedCount).toEqual(0);
  });
});

describe('friend tests', () => {
  beforeEach(async () => {
    await Schemas.User.deleteMany({});
    await db.createUser('user1', 'user1@seas.upenn.edu', 'pw-1', 'pic1');
    await db.createUser('user2', 'user2@seas.upenn.edu', 'pw-2', 'pic2');
    await db.createUser('user3', 'user3@seas.upenn.edu', 'pw-3', 'pic3');
  });

  test('followUser and getFriend test', async () => {
    await db.followUser('user1', 'user2');
    await db.followUser('user1', 'user3');
    await db.followUser('user2', 'user3');
    const user1Friends = await db.getFolloweesForUsername('user1');
    expect(user1Friends[0]).toEqual('user2');
    expect(user1Friends[1]).toEqual('user3');
    const user2Friends = await db.getFolloweesForUsername('user2');
    expect(user2Friends[0]).toEqual('user3');
  });
});

describe('post tests', () => {
  beforeEach(async () => {
    await Schemas.Post.deleteMany({});
    await db.createUser('cbros', 'cbros@seas.upenn.edu', 'pw-1', 'pic1');
    await db.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'pw-2', 'pic2');
    await db.followUser('cbros', 'neilshweky');
  });

  test('createPost test', async () => {
    const post = await db.createPost('some_pic', 'cbros');
    expect(post.username).toEqual('cbros');
    expect(post.picture).toEqual('some_pic');
    expect(Array.from(post.likes)).toEqual([]);
    expect(Array.from(post.comments)).toEqual([]);
  });

  test('postPicture test', async () => {
    const post = await db.postPicture('picture', 'cbros');
    expect(post.username).toEqual('cbros');
    expect(post.picture).toEqual('picture');
    // Check that post appears in friend's feed
    const friend = await db.getUser('neilshweky');
    expect(friend.posts[0]).toEqual(post.uid);
    const self = await db.getUser('cbros');
    expect(self.posts[0]).toEqual(post.uid);
  });
});

describe('like/unlike tests', () => {
  beforeEach(async () => {
    await Schemas.Post.deleteMany({});
    await db.createUser('cbros', 'cbros@seas.upenn.edu', 'pw-1', 'pic1');
    await db.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'pw-2', 'pic2');
    await db.followUser('cbros', 'neilshweky');
  });

  test('like-then-unlike test', async () => {
    const post = await db.createPost('some_pic', 'neilshweky');
    await db.likePost('cbros', post.uid);
    const likedPost = await db.getPost(post.uid);
    expect(Array.from(likedPost.likes)).toEqual(['cbros']);
    await db.unlikePost('cbros', post.uid);
    const unlikedPost = await db.getPost(post.uid);
    expect(Array.from(unlikedPost.likes)).toEqual([]);
  });

  test('like non-existing post test', async () => {
    const nopost = await db.likePost('cbros', 'random_id');
    expect(nopost.n).toBe(0);
    expect(nopost.nModified).toBe(0);
  });

  test('unlike non-existing post test', async () => {
    const nopost = await db.unlikePost('cbros', 'random_id');
    expect(nopost.n).toBe(0);
    expect(nopost.nModified).toBe(0);
  });
});

afterAll(async (done) => {
  mongoose.disconnect();
  done();
});

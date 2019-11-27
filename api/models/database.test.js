const mongoose = require('mongoose');
const SHA256 = require('crypto-js/sha256');
const userDB = require('./userDatabase.js');
const postDB = require('./postDatabase.js');
const Schemas = require('./schemas');

beforeAll(async (done) => {
  await mongoose.disconnect();
  await mongoose.connect('mongodb://localhost/cis557_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  done();
});

beforeEach(async () => {
  await Schemas.User.deleteMany({});
  await Schemas.Post.deleteMany({});
});


describe('authentication tests', () => {
  beforeEach(async () => {
    await Schemas.User.deleteMany({});
  });

  test('createUser test', async () => {
    const user = await userDB.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'cis557', 'some_pic');
    expect(user.username).toEqual('neilshweky');
    expect(user.email).toEqual('nshweky@seas.upenn.edu');
    expect('password' in user).toEqual(true);
    expect(user.profilePicture).toEqual('some_pic');
    expect(Array.from(user.followers)).toEqual([]);
    expect(Array.from(user.followees)).toEqual([]);
    expect(Array.from(user.posts)).toEqual([]);
  });

  test('createUser duplicate', async () => {
    await userDB.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'cis557', 'some_pic');
    const user2 = await userDB.createUser('neilshweky', 'nshweky2@seas.upenn.edu', 'cis557', 'some_pic');
    expect(user2).toEqual(undefined);
  });

  test('checkLogin successful', async () => {
    const user = await userDB.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'cis557', 'some_pic');
    const result = await userDB.checkLogin('neilshweky', 'cis557');
    expect(result.username).toEqual(user.username);
    expect(result.password).toEqual(user.password);
    expect(result.email).toEqual(user.email);
    expect(result.profilePicture).toEqual(user.profilePicture);
  });

  test('checkLogin not successful', async () => {
    await userDB.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'cis557', 'some_pic');
    const result = await userDB.checkLogin('neilshweky', 'cis557-2');
    expect(result).toEqual(null);
  });
});

describe('User tests', () => {
  beforeEach(async () => {
    await Schemas.User.deleteMany({});
  });

  test('getUser existing user test', async () => {
    const user = await userDB.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'cis557', 'some_pic');
    const fetchedUser = await userDB.getUser(user.username);
    expect(fetchedUser.username).toEqual('neilshweky');
    expect(fetchedUser.email).toEqual('nshweky@seas.upenn.edu');
  });

  test('getUser no such user', async () => {
    const nonExisting = await userDB.getUser('efouh');
    expect(nonExisting).toEqual(null);
  });

  test('deleteUser existing user test', async () => {
    const user = await userDB.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'cis557', 'some_pic');
    const deletedUser = await userDB.deleteUser(user.username);
    expect(deletedUser.deletedCount).toBe(1);
    const nonExisting = await userDB.getUser('neilshweky');
    expect(nonExisting).toEqual(null);
  });

  test('deleteUser no such user', async () => {
    const nonExisting = await userDB.deleteUser('efouh');
    expect(nonExisting.deletedCount).toEqual(0);
  });
});

describe('friend tests', () => {
  beforeEach(async () => {
    await Schemas.User.deleteMany({});
    await userDB.createUser('user1', 'user1@seas.upenn.edu', 'pw-1', 'pic1');
    await userDB.createUser('user2', 'user2@seas.upenn.edu', 'pw-2', 'pic2');
    await userDB.createUser('user3', 'user3@seas.upenn.edu', 'pw-3', 'pic3');
  });

  test('getFollowers no such user', async () => {
    const resp = await userDB.getFollowersForUsername('sarah');
    expect(Array.from(resp)).toEqual([]);
  });

  test('followUser and getFriend test', async () => {
    let user1Friends = await userDB.getFolloweesForUsername('user1');
    expect(Array.from(user1Friends)).toEqual([]);
    await userDB.followUser('user1', 'user2');
    await userDB.followUser('user1', 'user3');
    await userDB.followUser('user2', 'user3');
    user1Friends = await userDB.getFolloweesForUsername('user1');
    expect(user1Friends[0]).toEqual('user2');
    expect(user1Friends[1]).toEqual('user3');
    const user2Friends = await userDB.getFolloweesForUsername('user2');
    expect(user2Friends[0]).toEqual('user3');
    expect(Array.from(await userDB.getFollowersForUsername('user3'))).toEqual(['user1', 'user2']);
  });

  test('getFriend non-existent user', async () => {
    const user1Friends = await userDB.getFolloweesForUsername('sarah');
    expect(Array.from(user1Friends)).toEqual([]);
  });

  test('unfollow user', async () => {
    await userDB.followUser('user1', 'user2');
    await userDB.followUser('user1', 'user3');
    await userDB.followUser('user2', 'user3');
    await userDB.unfollowUser('user1', 'user2');
    const user1Followees = await userDB.getFolloweesForUsername('user1');
    const user2 = await userDB.getUser('user2');
    const user2followers = user2.followers;
    expect(Array.from(user1Followees)).toEqual(['user3']);
    expect(Array.from(user2followers)).toEqual([]);
  });
});

describe('post tests', () => {
  beforeEach(async () => {
    await Schemas.Post.deleteMany();
    await Schemas.User.deleteMany();
    await userDB.createUser('cbros', 'cbros@seas.upenn.edu', 'pw-1', 'pic1');
    await userDB.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'pw-2', 'pic2');
    await userDB.followUser('cbros', 'neilshweky');
  });

  test('createPost test', async () => {
    const post = await postDB.createPost('some_pic', 'cbros');
    expect(post.username).toEqual('cbros');
    expect(post.picture).toEqual('some_pic');
    expect(Array.from(post.likes)).toEqual([]);
    expect(Array.from(post.comments)).toEqual([]);
  });

  test('postPicture test', async () => {
    const post = await postDB.postPicture('picture', 'neilshweky');
    expect(post.username).toEqual('neilshweky');
    expect(post.picture).toEqual('picture');
    // Check that post appears in friend's feed
    const friend = await userDB.getUser('cbros');
    expect(friend.posts[0]).toEqual(post.uid);
    const self = await userDB.getUser('neilshweky');
    expect(self.posts[0]).toEqual(post.uid);
  });

  test('getPost test', async () => {
    const post = await postDB.postPicture('picture', 'cbros');
    const retrieved = await postDB.getPost(post.uid);
    expect(retrieved).not.toBeNull();
  });

  test('getPost non-existing post', async () => {
    const retrieved = await postDB.getPost('1');
    expect(retrieved).toBeNull();
  });

  test('getPostIdsForUserAndNum non-existing user', async () => {
    const retrieved = await postDB.getPostIdsForUserAndNum('sarah', 1);
    expect(retrieved).toBeNull();
  });

  test('getPostIdsForUserAndNum valid user', async () => {
    const post = await postDB.postPicture('picture', 'cbros');
    const post2 = await postDB.postPicture('picture2', 'neilshweky');
    const retrievedC = await postDB.getPostIdsForUserAndNum('cbros', 0);
    const retrievedN = await postDB.getPostIdsForUserAndNum('neilshweky', 0);
    expect(retrievedC[0]).toEqual(post2.uid);
    expect(retrievedC[1]).toEqual(post.uid);
    expect(retrievedC.length).toBe(2);
    expect(retrievedN[0]).toEqual(post2.uid);
    expect(retrievedN.length).toBe(1);
  });

  test('getPostsForUserAndNum non-existing user', async () => {
    const retrieved = await postDB.getPostsForUserAndNum('sarah', 1);
    expect(retrieved).toEqual([]);
  });

  test('getPostsForUserAndNum valid user', async () => {
    await postDB.postPicture('picture', 'cbros');
    await postDB.postPicture('picture2', 'neilshweky');
    const retrievedC = await postDB.getPostsForUserAndNum('cbros', 0);
    const retrievedN = await postDB.getPostsForUserAndNum('neilshweky', 0);
    expect(retrievedC.length).toBe(2);
    expect(retrievedC[0].username).toBe('neilshweky');
    expect(retrievedC[1].username).toBe('cbros');
    expect(retrievedN.length).toBe(1);
    expect(retrievedN[0].username).toBe('neilshweky');
  });

  test('get posts after deletion', async () => {
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < postDB.QUERY_SIZE; i += 1) {
      await postDB.postPicture('pic', 'neilshweky');
    }
    const post = await postDB.postPicture('picture2', 'neilshweky');
    await Schemas.Post.deleteOne({ uid: post.uid });
    const retrieved = await postDB.getPostsForUserAndNum('neilshweky', 0);
    expect(retrieved.length).toBe(postDB.QUERY_SIZE);
    for (let i = 0; i < retrieved.length; i += 1) {
      expect(retrieved[i].uid).not.toEqual(post.uid);
    }
  });

  test('get fewer than query size', async () => {
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < postDB.QUERY_SIZE - 2; i += 1) {
      await postDB.postPicture('pic', 'neilshweky');
    }
    const post = await postDB.postPicture('picture2', 'neilshweky');
    await Schemas.Post.deleteOne({ uid: post.uid });
    const retrieved = await postDB.getPostsForUserAndNum('neilshweky', 0);
    expect(retrieved.length).toBe(postDB.QUERY_SIZE - 2);
    for (let i = 0; i < retrieved.length; i += 1) {
      expect(retrieved[i].uid).not.toEqual(post.uid);
    }
  });

  test('get more than query size', async () => {
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < postDB.QUERY_SIZE + 10; i += 1) {
      await postDB.postPicture('pic', 'neilshweky');
    }
    const post = await postDB.postPicture('picture2', 'neilshweky');
    await Schemas.Post.deleteOne({ uid: post.uid });
    const retrieved = await postDB.getPostsForUserAndNum('neilshweky', 0);
    expect(retrieved.length).toBe(postDB.QUERY_SIZE);
    for (let i = 0; i < retrieved.length; i += 1) {
      expect(retrieved[i].uid).not.toEqual(post.uid);
    }
  });
});

describe('like/unlike tests', () => {
  beforeEach(async () => {
    await Schemas.Post.deleteMany({});
    await userDB.createUser('cbros', 'cbros@seas.upenn.edu', 'pw-1', 'pic1');
    await userDB.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'pw-2', 'pic2');
    await userDB.followUser('cbros', 'neilshweky');
  });

  test('like-then-unlike test', async () => {
    const post = await postDB.createPost('some_pic', 'neilshweky');
    await postDB.likePost('cbros', post.uid);
    const likedPost = await postDB.getPost(post.uid);
    expect(Array.from(likedPost.likes)).toEqual(['cbros']);
    await postDB.unlikePost('cbros', post.uid);
    const unlikedPost = await postDB.getPost(post.uid);
    expect(Array.from(unlikedPost.likes)).toEqual([]);
  });

  test('like/unlike your own post post test', async () => {
    const post = await postDB.createPost('some_pic', 'neilshweky');
    await postDB.likePost('neilshweky', post.uid);
    const likedPost = await postDB.getPost(post.uid);
    expect(Array.from(likedPost.likes)).toEqual(['neilshweky']);
    await postDB.unlikePost('neilshweky', post.uid);
    const unlikedPost = await postDB.getPost(post.uid);
    expect(Array.from(unlikedPost.likes)).toEqual([]);
  });

  test('like non-existing post test', async () => {
    const nopost = await postDB.likePost('cbros', 'random_id');
    expect(nopost).toBeNull();
  });

  test('unlike non-existing post test', async () => {
    const nopost = await postDB.unlikePost('cbros', 'random_id');
    expect(nopost).toBeNull();
  });

  test('like post from non-existing user test', async () => {
    const post = await postDB.createPost('some_pic', 'neilshweky');
    const nopost = await postDB.likePost('no_user', post.uid);
    expect(nopost).toBeNull();
  });

  test('unlike post from non-existing user test', async () => {
    const post = await postDB.createPost('some_pic', 'neilshweky');
    const nopost = await postDB.unlikePost('no_user', post.uid);
    expect(nopost).toBeNull();
  });
});

describe('update user tests', () => {
  beforeEach(async () => {
    await Schemas.User.deleteMany({});
    await userDB.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'pw-2', 'pic2');
  });

  test('update email', async () => {
    let user2 = await userDB.getUser('neilshweky');
    expect(user2.email).toBe('nshweky@seas.upenn.edu');
    await userDB.updateEmail('neilshweky', 'something else');
    user2 = await userDB.getUser('neilshweky');
    expect(user2.email).toBe('something else');
  });

  test('update email no user', async () => {
    await userDB.updateEmail('neilshweky3', 'something else').catch((err) => {
      expect(err.message).toEqual('no user found');
    });
  });

  test('update profile picture', async () => {
    let user2 = await userDB.getUser('neilshweky');
    expect(user2.profilePicture).toBe('pic2');
    await userDB.updateProfilePic('neilshweky', 'something else');
    user2 = await userDB.getUser('neilshweky');
    expect(user2.profilePicture).toBe('something else');
  });

  test('update profile picture no user', async () => {
    await userDB.updateProfilePic('neilshweky3', 'something else').catch((err) => {
      expect(err.message).toEqual('no user found');
    });
  });

  test('update password', async () => {
    let user2 = await userDB.getUser('neilshweky');
    expect(user2.password).toEqual(SHA256('pw-2').toString());
    await userDB.updatePassword('neilshweky', 'pw-2', '123');
    user2 = await userDB.getUser('neilshweky');
    expect(user2.password).toEqual(SHA256('123').toString());
  });

  test('update password no user', async () => {
    await userDB.updatePassword('neilshweky3', 'pw-2', 'something').catch((err) => {
      expect(err.message).toEqual('no user found');
    });
  });

  test('update password wrong password', async () => {
    await userDB.updatePassword('neilshweky', 'pw-3', 'something').catch((err) => {
      expect(err.message).toEqual('incorrect password');
    });
  });
});


describe('comments tests', () => {
  beforeEach(async () => {
    await userDB.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'pw-2', 'pic2');
    await userDB.createUser('neilshweky2', 'nshweky2@seas.upenn.edu', 'pw-2', 'pic2');
    await postDB.createPost('picture', 'neilshweky');
  });

  test('add a comment', async () => {
    const post = await Schemas.Post.findOne();
    const comment = await postDB.addComment(post.uid, 'neilshweky', 'cool beans man');
    expect(comment.username).toBe('neilshweky');
    expect(comment.comment).toBe('cool beans man');
    const length = await Schemas.Post.findOne({ uid: post.uid }, { comments: 1 })
      .then((data) => data.comments.length);
    expect(length).toBe(1);
  });

  test('add two comments in order', async () => {
    const post = await Schemas.Post.findOne();
    const comment1 = await postDB.addComment(post.uid, 'neilshweky', 'cool beans man');
    const comment2 = await postDB.addComment(post.uid, 'neilshweky2', 'totally');
    expect(comment1.username).toBe('neilshweky');
    expect(comment1.comment).toBe('cool beans man');
    expect(comment2.username).toBe('neilshweky2');
    expect(comment2.comment).toBe('totally');
    await Schemas.Post.findOne({ uid: post.uid }, { comments: 1 }).then((data) => {
      expect(data.comments.length).toBe(2);
      expect(data.comments[0].uid).toBe(comment1.uid);
      expect(data.comments[1].uid).toBe(comment2.uid);
    });
  });

  test('add a comment to fake post', async () => {
    await expect(postDB.addComment('FAKE ID', 'neilshweky', 'cool beans man')).rejects.toThrowError('No post found to add comment');
  });

  test('edit a comment', async () => {
    const post = await Schemas.Post.findOne();
    const comment = await postDB.addComment(post.uid, 'neilshweky', 'cool beans man');
    expect(comment.username).toBe('neilshweky');
    expect(comment.comment).toBe('cool beans man');
    const length = await Schemas.Post.findOne({ uid: post.uid }, { comments: 1 })
      .then((data) => data.comments.length);
    expect(length).toBe(1);

    await postDB.editComment(post.uid, comment.uid, 'hey there!');
    const comments = await Schemas.Post.findOne({ uid: post.uid }, { comments: 1 })
      .then((data) => data.comments);
    expect(comments.length).toBe(1);
    expect(comments[0].comment).toBe('hey there!');
  });

  test('edit no comment', async () => {
    expect.assertions(1);
    const post = await Schemas.Post.findOne();
    await postDB.editComment(post.uid, 'FAKEID', 'hey there!')
      .catch((err) => {
        expect(err.message).toEqual('No comment found to edit');
      });
  });

  test('edit a comment no post', async () => {
    expect.assertions(1);
    const post = await Schemas.Post.findOne();
    const comment = await postDB.addComment(post.uid, 'neilshweky', 'cool beans man');
    await postDB.editComment('FAKEID', comment.uid, 'hey there!')
      .catch((err) => {
        expect(err.message).toEqual('No post found to edit comment');
      });
  });

  test('delete a comment', async () => {
    const post = await Schemas.Post.findOne();
    const comment = await postDB.addComment(post.uid, 'neilshweky', 'cool beans man');
    await postDB.deleteComment(post.uid, comment.uid);
    const comments = await Schemas.Post.findOne({ uid: post.uid }, { comments: 1 })
      .then((data) => data.comments);
    expect(comments.length).toBe(0);
  });

  test('delete a comment no post', async () => {
    expect.assertions(1);
    const post = await Schemas.Post.findOne();
    const comment = await postDB.addComment(post.uid, 'neilshweky', 'cool beans man');
    await postDB.deleteComment('FAKEID', comment.uid)
      .catch((err) => {
        expect(err.message).toEqual('No post found for deletion');
      });
  });
});

describe('user search tests', () => {
  beforeEach(async () => {
    await Schemas.User.deleteMany();
    await userDB.createUser('cbros', 'cbros@seas.upenn.edu', 'pw-1', 'pic1');
    await userDB.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'pw-2', 'pic2');
    await userDB.createUser('neilshweky2', 'nshweky2@seas.upenn.edu', 'pw-3', 'pic3');
    await userDB.followUser('cbros', 'neilshweky');
  });

  test('search returns all related users', async () => {
    const results = await userDB.getUsersForTerm('neil');
    expect(results.length).toBe(2);
    const results2 = await userDB.getUsersForTerm('sarah');
    expect(results2.length).toBe(0);
  });

  test('search returns all related users but not user', async () => {
    const results = await userDB.getSearchSuggestions('neilshweky', 'neil');
    expect(results.length).toBe(1);
  });
});

describe('edit and delete posts tests', () => {
  beforeEach(async () => {
    await userDB.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'pw-2', 'pic2');
    await userDB.createUser('neilshweky2', 'nshweky2@seas.upenn.edu', 'pw-2', 'pic2');
    await postDB.createPost('picture', 'neilshweky', 'some caption');
  });

  test('edit post', async () => {
    const post = await Schemas.Post.findOne();
    expect(post.caption).toBe('some caption');
    const newPost = await postDB.updatePost(post.uid, 'new caption');
    expect(newPost).toBe('new caption');
  });

  test('edit post with invalid post ID', async () => {
    await expect(postDB.updatePost('FAKEID', 'new caption')).rejects.toThrowError('No post found to update');
  });

  test('delete post', async () => {
    const post = await Schemas.Post.findOne();
    await postDB.deletePost(post.uid);
    expect(await Schemas.Post.count()).toBe(0);
  });
});

afterAll(async (done) => {
  mongoose.disconnect();
  done();
});

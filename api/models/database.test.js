const mongoose = require('mongoose');
const SHA256 = require('crypto-js/sha256');
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

beforeEach(async () => {
  await Schemas.User.deleteMany({});
  await Schemas.Post.deleteMany({});
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

  test('getFollowers no such user', async () => {
    const resp = await db.getFollowersForUsername('sarah');
    expect(Array.from(resp)).toEqual([]);
  });

  test('followUser and getFriend test', async () => {
    let user1Friends = await db.getFolloweesForUsername('user1');
    expect(Array.from(user1Friends)).toEqual([]);
    await db.followUser('user1', 'user2');
    await db.followUser('user1', 'user3');
    await db.followUser('user2', 'user3');
    user1Friends = await db.getFolloweesForUsername('user1');
    expect(user1Friends[0]).toEqual('user2');
    expect(user1Friends[1]).toEqual('user3');
    const user2Friends = await db.getFolloweesForUsername('user2');
    expect(user2Friends[0]).toEqual('user3');
    expect(Array.from(await db.getFollowersForUsername('user3'))).toEqual(['user1', 'user2']);
  });

  test('getFriend non-existent user', async () => {
    const user1Friends = await db.getFolloweesForUsername('sarah');
    expect(Array.from(user1Friends)).toEqual([]);
  });

  test('unfollow user', async () => {
    await db.followUser('user1', 'user2');
    await db.followUser('user1', 'user3');
    await db.followUser('user2', 'user3');
    await db.unfollowUser('user1', 'user2');
    const user1Followees = await db.getFolloweesForUsername('user1');
    const user2 = await db.getUser('user2');
    const user2followers = user2.followers;
    expect(Array.from(user1Followees)).toEqual(['user3']);
    expect(Array.from(user2followers)).toEqual([]);
  });
});

describe('post tests', () => {
  beforeEach(async () => {
    await Schemas.Post.deleteMany();
    await Schemas.User.deleteMany();
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
    const post = await db.postPicture('picture', 'neilshweky');
    expect(post.username).toEqual('neilshweky');
    expect(post.picture).toEqual('picture');
    // Check that post appears in friend's feed
    const friend = await db.getUser('cbros');
    expect(friend.posts[0]).toEqual(post.uid);
    const self = await db.getUser('neilshweky');
    expect(self.posts[0]).toEqual(post.uid);
  });

  test('getPost test', async () => {
    const post = await db.postPicture('picture', 'cbros');
    const retrieved = await db.getPost(post.uid);
    expect(retrieved).not.toBeNull();
  });

  test('getPost non-existing post', async () => {
    const retrieved = await db.getPost('1');
    expect(retrieved).toBeNull();
  });

  test('getPostIdsForUserAndNum non-existing user', async () => {
    const retrieved = await db.getPostIdsForUserAndNum('sarah', 1);
    expect(retrieved).toBeNull();
  });

  test('getPostIdsForUserAndNum valid user', async () => {
    const post = await db.postPicture('picture', 'cbros');
    const post2 = await db.postPicture('picture2', 'neilshweky');
    const retrievedC = await db.getPostIdsForUserAndNum('cbros', 0);
    const retrievedN = await db.getPostIdsForUserAndNum('neilshweky', 0);
    expect(retrievedC[0]).toEqual(post2.uid);
    expect(retrievedC[1]).toEqual(post.uid);
    expect(retrievedC.length).toBe(2);
    expect(retrievedN[0]).toEqual(post2.uid);
    expect(retrievedN.length).toBe(1);
  });

  test('getPostsForUserAndNum non-existing user', async () => {
    const retrieved = await db.getPostsForUserAndNum('sarah', 1);
    expect(retrieved).toBeNull();
  });

  test('getPostsForUserAndNum valid user', async () => {
    await db.postPicture('picture', 'cbros');
    await db.postPicture('picture2', 'neilshweky');
    const retrievedC = await db.getPostsForUserAndNum('cbros', 0);
    const retrievedN = await db.getPostsForUserAndNum('neilshweky', 0);
    expect(retrievedC.length).toBe(2);
    expect(retrievedC[0].username).toBe('neilshweky');
    expect(retrievedC[1].username).toBe('cbros');
    expect(retrievedN.length).toBe(1);
    expect(retrievedN[0].username).toBe('neilshweky');
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

  test('like/unlike your own post post test', async () => {
    const post = await db.createPost('some_pic', 'neilshweky');
    await db.likePost('neilshweky', post.uid);
    const likedPost = await db.getPost(post.uid);
    expect(Array.from(likedPost.likes)).toEqual(['neilshweky']);
    await db.unlikePost('neilshweky', post.uid);
    const unlikedPost = await db.getPost(post.uid);
    expect(Array.from(unlikedPost.likes)).toEqual([]);
  });

  test('like non-existing post test', async () => {
    const nopost = await db.likePost('cbros', 'random_id');
    expect(nopost).toBeNull();
  });

  test('unlike non-existing post test', async () => {
    const nopost = await db.unlikePost('cbros', 'random_id');
    expect(nopost).toBeNull();
  });

  test('like post from non-existing user test', async () => {
    const post = await db.createPost('some_pic', 'neilshweky');
    const nopost = await db.likePost('no_user', post.uid);
    expect(nopost).toBeNull();
  });

  test('unlike post from non-existing user test', async () => {
    const post = await db.createPost('some_pic', 'neilshweky');
    const nopost = await db.unlikePost('no_user', post.uid);
    expect(nopost).toBeNull();
  });
});

describe('update user tests', () => {
  beforeEach(async () => {
    await Schemas.User.deleteMany({});
    await db.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'pw-2', 'pic2');
  });

  test('update email', async () => {
    let user2 = await db.getUser('neilshweky');
    expect(user2.email).toBe('nshweky@seas.upenn.edu');
    await db.updateEmail('neilshweky', 'something else');
    user2 = await db.getUser('neilshweky');
    expect(user2.email).toBe('something else');
  });

  test('update email no user', async () => {
    await db.updateEmail('neilshweky3', 'something else').catch((err) => {
      expect(err.message).toEqual('no user found');
    });
  });

  test('update profile picture', async () => {
    let user2 = await db.getUser('neilshweky');
    expect(user2.profilePicture).toBe('pic2');
    await db.updateProfilePic('neilshweky', 'something else');
    user2 = await db.getUser('neilshweky');
    expect(user2.profilePicture).toBe('something else');
  });

  test('update profile picture no user', async () => {
    await db.updateProfilePic('neilshweky3', 'something else').catch((err) => {
      expect(err.message).toEqual('no user found');
    });
  });

  test('update password', async () => {
    let user2 = await db.getUser('neilshweky');
    expect(user2.password).toEqual(SHA256('pw-2').toString());
    await db.updatePassword('neilshweky', 'pw-2', '123');
    user2 = await db.getUser('neilshweky');
    expect(user2.password).toEqual(SHA256('123').toString());
  });

  test('update password no user', async () => {
    await db.updatePassword('neilshweky3', 'pw-2', 'something').catch((err) => {
      expect(err.message).toEqual('no user found');
    });
  });

  test('update password wrong password', async () => {
    await db.updatePassword('neilshweky', 'pw-3', 'something').catch((err) => {
      expect(err.message).toEqual('incorrect password');
    });
  });
});


describe('comments tests', () => {
  beforeEach(async () => {
    await db.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'pw-2', 'pic2');
    await db.createUser('neilshweky2', 'nshweky2@seas.upenn.edu', 'pw-2', 'pic2');

    await db.createPost('picture', 'neilshweky');
  });

  test('add a comment', async () => {
    const post = await Schemas.Post.findOne();
    const comment = await db.addComment(post.uid, "neilshweky", "cool beans man")
    expect(comment.username).toBe('neilshweky');
    expect(comment.comment).toBe("cool beans man");
    const length = await Schemas.Post.findOne({uid:post.uid}, {comments: 1}).then((data) => data.comments.length);
    expect(length).toBe(1);
  });

  test('add two comments in order', async () => {
    const post = await Schemas.Post.findOne();
    const comment1 = await db.addComment(post.uid, "neilshweky", "cool beans man")
    const comment2 = await db.addComment(post.uid, "neilshweky2", "totally")
    expect(comment1.username).toBe('neilshweky');
    expect(comment1.comment).toBe("cool beans man");
    expect(comment2.username).toBe('neilshweky2');
    expect(comment2.comment).toBe("totally");
    await Schemas.Post.findOne({uid:post.uid}, {comments: 1}).then((data) => {
      expect(data.comments.length).toBe(2);
      expect(data.comments[0].uid).toBe(comment1.uid);
      expect(data.comments[1].uid).toBe(comment2.uid);
    });
  });

  test('add a comment to fake post', async () => {
    await db.addComment("FAKE ID", "neilshweky", "cool beans man").catch((err) => {
        expect(err.message).toEqual('no post found');
    })
  });

  test('edit a comment', async () => {
    const post = await Schemas.Post.findOne();
    const comment = await db.addComment(post.uid, "neilshweky", "cool beans man")
    expect(comment.username).toBe('neilshweky');
    expect(comment.comment).toBe("cool beans man");
    const length = await Schemas.Post.findOne({uid:post.uid}, {comments: 1}).then((data) => data.comments.length);
    expect(length).toBe(1);

    await db.editComment(post.uid, comment.uid, comment.username, "hey there!")
    const comments = await Schemas.Post.findOne({uid:post.uid}, {comments: 1}).then((data) => data.comments);
    expect(comments.length).toBe(1);
    expect(comments[0].comment).toBe("hey there!");

  });

  test('edit no comment', async () => {
    const post = await Schemas.Post.findOne();
    await db.editComment(post.uid, "FAKEID", "neilshweky", "hey there!").catch((err) => {
      expect(err.message).toEqual('no comment found');
    })
  });

  test('edit a comment wrong owner', async () => {
    const post = await Schemas.Post.findOne();
    const comment = await db.addComment(post.uid, "neilshweky", "cool beans man")
    await db.editComment(post.uid, comment.uid, "neilshweky2", "hey there!").catch((err) => {
      expect(err.message).toEqual('not the owner of comment');
    })
  });
})

describe('user search tests', () => {
  beforeEach(async () => {
    await Schemas.User.deleteMany();
    await db.createUser('cbros', 'cbros@seas.upenn.edu', 'pw-1', 'pic1');
    await db.createUser('neilshweky', 'nshweky@seas.upenn.edu', 'pw-2', 'pic2');
    await db.createUser('neilshweky2', 'nshweky2@seas.upenn.edu', 'pw-3', 'pic3');
    await db.followUser('cbros', 'neilshweky');
  });

  test('search returns all related users', async () => {
    const results = await db.getUsersForTerm('neil');
    expect(results.length).toBe(2);
    const results2 = await db.getUsersForTerm('sarah');
    expect(results2.length).toBe(0);
  });

  test('search returns all related users but not user', async () => {
    const results = await db.getSearchSuggestions('neilshweky', 'neil');
    expect(results.length).toBe(1);
  });
});

afterAll(async (done) => {
  mongoose.disconnect();
  done();
});



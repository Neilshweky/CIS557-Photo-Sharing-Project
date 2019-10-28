const db = require('./database.js');
const mongoose = require('mongoose');
const Schemas = require('./schemas');

beforeAll(async done => {
    await mongoose.disconnect()
    await mongoose.connect('mongodb://localhost/cis557_db_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    done()
})
describe('authentication tests', () => {

    beforeEach(async () => {
        await Schemas.User.deleteMany({});
    })

    test ('create user test', async () => {
        var user = await db.createUser("neilshweky", "nshweky@seas.upenn.edu", "cis557", "some_pic");
        expect(user.username).toEqual("neilshweky");
        expect(user.email).toEqual("nshweky@seas.upenn.edu");
        expect("password" in user).toEqual(true);
        expect(user.profile_picture).toEqual("some_pic");
        expect(Array.from(user.friends)).toEqual([]);
        expect(Array.from(user.posts)).toEqual([]);
    })

    test ('create user duplicate', async () => {
        await db.createUser("neilshweky", "nshweky@seas.upenn.edu", "cis557", "some_pic");
        var user2 = await db.createUser("neilshweky", "nshweky2@seas.upenn.edu", "cis557", "some_pic");
        expect(user2).toEqual(undefined);
    })

    test ('login successful', async () => {
        var user = await db.createUser("neilshweky", "nshweky@seas.upenn.edu", "cis557", "some_pic");
        var result = await db.checkLogin("neilshweky", "cis557");
        expect(result.username).toEqual(user.username);
        expect(result.password).toEqual(user.password);
        expect(result.email).toEqual(user.email);
        expect(result.profile_picture).toEqual(user.profile_picture);
    })

    test ('login not successful', async () => {
        var user = await db.createUser("neilshweky", "nshweky@seas.upenn.edu", "cis557", "some_pic");
        var result = await db.checkLogin("neilshweky", "cis557-2");
        expect(result).toEqual(null);
    })

    test ('login throws error', async () => {
        var user = await db.createUser("neilshweky", "nshweky@seas.upenn.edu", "cis557", "some_pic");
        // var result = await db.login("neilshweky", "cis557sucks2")
        // expect(result).toEqual([])
        // HOW TO WRITE THIS???
    })

})



afterAll(async done => {
    mongoose.disconnect()
    done()
})

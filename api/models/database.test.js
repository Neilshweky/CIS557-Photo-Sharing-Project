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
describe('signup tests', () => {
    
    beforeEach(async () => {
        await Schemas.User.deleteMany({})
    })

    test ('create user test', async () => {
        var user = await db.createUser("neilshweky", "nshweky@seas.upenn.edu", "cis557sucks", "some_pic")
        expect(user.username).toBe("neilshweky")
        expect(user.email).toBe("nshweky@seas.upenn.edu")
        expect("password" in user).toBe(false)
        expect(user.profile_picture).toBe("some_pic")
        expect(user.friends).toBe([])
        expect(user.posts).toBe([])

    })

    test ('create user duplicate', async () => {
        var user = await db.createUser("neilshweky", "nshweky@seas.upenn.edu", "cis557sucks", "some_pic")
        expect(user.username).toBe("neilshweky")
        expect(user.email).toBe("nshweky@seas.upenn.edu")
        expect("password" in user).toBe(false)
        expect(user.profile_picture).toBe("some_pic")
        expect(user.friends).toBe([])
        expect(user.posts).toBe([])

    })
})



afterAll(async done => {
    mongoose.disconnect()
    done()
})
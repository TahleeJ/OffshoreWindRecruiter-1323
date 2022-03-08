import * as admin from 'firebase-admin';
import * as testLib from 'firebase-functions-test';

require('dotenv').config();

const testInstance = require('firebase-functions-test')({
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
});

const chai = require('chai');
const assert = chai.assert;

const myFunctions = require('../index.js');

const testEmails = {
    none: "none@oswjn.com",
    admin: "admin@oswjn.com",
    owner: "owner@oswjn.com"
};

const testUsers = {
    none: testInstance.auth.makeUserRecord({email: testEmails.none}),
    admin: testInstance.auth.makeUserRecord({email: testEmails.admin}),
    owner: testInstance.auth.makeUserRecord({email: testEmails.owner})
};

const auth = admin.auth();

const testUserss = {
    none: auth.getUserByEmail(testEmails.none),
    admin: auth.getUserByEmail(testEmails.admin),
    owner: auth.getUserByEmail(testEmails.owner)
}

var testUserAuthInfo = {
    token: {
        none: null,
        admin: null,
        owner: null
    },
    uid: {
        none: null,
        admin: null,
        owner: null
    }
};

var testUserAuth = {
    none: {
        uid: testUserAuthInfo.uid.none,
        token: testUserAuthInfo.token.none
    },
    admin: {
        uid: testUserAuthInfo.uid.admin,
        token: testUserAuthInfo.token.admin
    },
    owner: {
        uid: testUserAuthInfo.uid.owner,
        token: testUserAuthInfo.token.owner
    },
}

async function authSetup() {
    testUserAuthInfo.uid.none = testUsers.none.uid;
    testUserAuthInfo.uid.admin = testUsers.admin.uid;
    testUserAuthInfo.uid.owner = testUsers.owner.uid;

    testUserAuthInfo.token.none = await testUsers.none.getIdToken();
    testUserAuthInfo.token.admin = await testUsers.admin.getIdToken();
    testUserAuthInfo.token.owner = await testUsers.owner.getIdToken();
}

describe("Update Permissions Function Unit Tests", () => {
    const updatePermissions = testInstance.wrap(myFunctions.updatePermissions);
    
    describe("None level call", () => {
        it("should fail to promote a none-level user to any level", async () => {

        });

        it("should fail to promote an admin-level user to any level", async () => {

        });

        it("should fail to demote an admin-level user to any level", async () => {

        });

        it("should fail to promote an owner-level user to any level", async () => {

        });

        it("should fail to demote an owner-level user to any level", async () => {

        });
    });

    describe("Admin-level call", () => {
        it("should promote/demote a none-level user to none-level", async () => {

        });
        
        it("should promote a none-level user to admin-level", async () => {

        });

        it("should fail to promote a none-level user to owner-level for enabled owner promotion flag", async () => {

        });

        it("should fail to promote a none-level user to owner-level for disabled owner promotion flag", async () => {

        });

        it("should fail to demote an admin-level user to admin-level", async () => {

        });

        it("should promote an admin-level user to admin-level", async () => {

        });

        it("should fail to promote an admin-level user to owner-level for enabled owner promotion", async () => {

        });

        it("should fail to promote an admin-level user to owner-level for disabled owner promotion", async () => {

        });

        it("should fail to demote an owner-level user to none-level", async () => {

        });

        it("should fail to demote an owner-level user to admin-level", async () => {

        });

        it("should fail to demote an owner-level user to none-level for enabled owner demotion", async () => {

        });

        it("should fail to demote an owner-level user to none-level for disabled owner demotion", async () => {

        });

        it("should fail to demote an owner-level user to admin-level for enabled owner demotion", async () => {

        });

        it("should fail to demote an owner-level user to admin-level for disabled owner demotion", async () => {

        });

        it("should fail to promote an owner-level user to owner-level for enabled owner promotion", async () => {

        });

        it("should fail to promote an owner-level user to owner-level for disabled owner promotion", async () => {

        });
    });

    describe("Owner-level call", () => {
        it("should promote/demote a none-level user to none-level", async () => {

        });

        it("should promote a none-level user to admin-level", async () => {

        });

        it("should promote a none-level user to owner-level for enabled owner promotion", async () => {

        });

        it("should fail to promote a none-level user to owner-level for disabled owner-promotion", async () => {

        });

        it("should demote an admin-level user to none-level", async() => {

        });

        it("should promote/demote an admin-level user to admin-level", async () => {

        });

        it("should promote an admin-level user to owner-level for enabled owner promotion", async () => {

        });

        it("should fail to promote an admin-level user to owner-level for disabled owner promotion", async() => {

        });

        it("should demote an owner-level user to none-level for enabled owner demotion", async () => {

        });

        it("should fail to demote an owner-level user to none-level for disabled owner demotion", async () => {

        });

        it("should keep a user's owner-level for admin-level demotion for enabled owner demotion", async () => {

        });

        it("should fail to demote an owner-level user to admin-level for disabled owner demotion", async () => {

        });

        it("should promote/demote an owner-level user to owner-level for enabled owner demotion", async () => {

        });

        it("should fail promote/demote an owner-level user to owner-level for disabled owner demotion", async () => {

        });
    });
})

/**
 * Update permissions functions tests
 * 
 * As none ->
 *      On none:
 *          Promote/demote -> (any)
 *              Error
 *      On admin:
 *          Promote/demote -> (any)
 *              Error
 *      On owner:
 *          Promote/demote -> (any)
 *              Error
 * 
 * As admin ->
 *      On none:
 *          Promote -> (admin)
 *              Pass -> Admin
 *          Promote -> (owner, promotion flag set/not set)
 *              Error
 *          Demote -> (any)
 *              Pass -> None
 *      On admin:
 *          Promote -> (admin)
 *              Pass -> Admin
 *          Promote -> (owner, promotion flag set/not set)
 *              Error
 *          Demote -> (any)
 *              Error
 *      On owner:
 *          Promote -> (owner, promotion flag set/not set)
 *              Error
 *          Demote -> (promotion flag set/not set)
 *              Error
 * 
 * As owner ->
 *      On none:
 *          Promote -> (admin)
 *              Pass -> Admin
 *          Promote -> (owner, promotion flag set)
 *              Pass -> Owner
 *          Promote -> (owner, promotion flag not set)
 *              Error
 *          Demote ->
 *              Pass -> None
 *      On admin:
 *          Promote -> (admin)
 *              Pass -> Admin
 *          Promote -> (owner, promotion flag set)
 *              Pass -> Owner
 *          Promote -> (owner, promotion flag not set)
 *              Error
 *          Demote -> (any)
 *              Pass -> (any)
 *      On owner:
 *          Promote -> (owner, promotion flag set)
 *              Pass -> Owner
 *          Promote -> (owner, promotion flag not set)
 *              Error
 *          Demote -> (none, demotion flag set)
 *              Pass -> (any)
 *          Demote -> (admin/owner, demotion flag set)
 *              Pass -> Owner
 *          Demote -> (any, demotion flag not set)
 *              Error
 */
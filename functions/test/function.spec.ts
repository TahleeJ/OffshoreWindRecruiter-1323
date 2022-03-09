import * as functions from 'firebase-functions';
import { WrappedFunction } from 'firebase-functions-test/lib/main';
// import { PermissionLevel } from '../../src/firebase/Types';
// import  { authInstance, devDefaultReset, docRefs, updateTransactions, setUpTestUsers, testUserContext } from './setup';
import * as chai from 'chai';
import { beforeAll } from 'mocha';

// import * as checkError from 'check-error';
import { devDefaultReset, updateTransactions, testUserContext } from './setup';

// const functions = require('firebase-functions');
// const setup = require('./setup.ts');
// const checkError = require('check-error');

// require('dotenv').config({ path: `/OffshoreWindJobNavigator/.env.prod` });
require('custom-env').env('prod');

const testEnv = require('firebase-functions-test')({
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
}, '../../serviceAccountKey.json');

let myFunctions: { updatePermissions: any; };
let updatePermissionsWrapped: WrappedFunction;

// const assert = chai.assert;
const expect = chai.expect;

describe("Update Permissions Function Unit Tests", () => {
    beforeAll(() => {
        myFunctions = require('../src/index');
        updatePermissionsWrapped = testEnv.wrap(myFunctions.updatePermissions);
    });

    beforeEach(async () => {
        devDefaultReset();
    });

    afterAll(() => {
        testEnv.cleanup();
    });

    describe("None-level caller", () => {
        it("should fail to promote a none-level user to none-level", async () => {     
            expect(async function(){
                updatePermissionsWrapped(updateTransactions.onNone.toNone, await testUserContext.none);
            }).to.throw(functions.https.HttpsError);

        });

        it("should fail to promote a none-level user to admin-level", async () => {     
            expect(async function(){
                updatePermissionsWrapped(updateTransactions.onNone.toNone, await testUserContext.none);
            }).to.throw(functions.https.HttpsError);

        });

        it("should fail to promote a none-level user to owner-level for owner promotion enabled", async () => {   
            expect(async function(){
                updatePermissionsWrapped(updateTransactions.onNone.toNone, await testUserContext.none);
            }).to.throw(functions.https.HttpsError);

        });

        // it("should fail to promote an admin-level user to any level", async () => {

        // });

        // it("should fail to demote an admin-level user to any level", async () => {

        // });

        // it("should fail to promote an owner-level user to any level", async () => {

        // });

        // it("should fail to demote an owner-level user to any level", async () => {

        // });
    });

    // describe("Admin-level caller", () => {
    //     it("should promote/demote a none-level user to none-level", async () => {

    //     });
        
    //     it("should promote a none-level user to admin-level", async () => {

    //     });

    //     it("should fail to promote a none-level user to owner-level for enabled owner promotion flag", async () => {

    //     });

    //     it("should fail to promote a none-level user to owner-level for disabled owner promotion flag", async () => {

    //     });

    //     it("should fail to demote an admin-level user to admin-level", async () => {

    //     });

    //     it("should promote an admin-level user to admin-level", async () => {

    //     });

    //     it("should fail to promote an admin-level user to owner-level for enabled owner promotion", async () => {

    //     });

    //     it("should fail to promote an admin-level user to owner-level for disabled owner promotion", async () => {

    //     });

    //     it("should fail to demote an owner-level user to none-level", async () => {

    //     });

    //     it("should fail to demote an owner-level user to admin-level", async () => {

    //     });

    //     it("should fail to demote an owner-level user to none-level for enabled owner demotion", async () => {

    //     });

    //     it("should fail to demote an owner-level user to none-level for disabled owner demotion", async () => {

    //     });

    //     it("should fail to demote an owner-level user to admin-level for enabled owner demotion", async () => {

    //     });

    //     it("should fail to demote an owner-level user to admin-level for disabled owner demotion", async () => {

    //     });

    //     it("should fail to promote an owner-level user to owner-level for enabled owner promotion", async () => {

    //     });

    //     it("should fail to promote an owner-level user to owner-level for disabled owner promotion", async () => {

    //     });
    // });

    // describe("Owner-level caller", () => {
    //     it("should promote/demote a none-level user to none-level", async () => {

    //     });

    //     it("should promote a none-level user to admin-level", async () => {

    //     });

    //     it("should promote a none-level user to owner-level for enabled owner promotion", async () => {

    //     });

    //     it("should fail to promote a none-level user to owner-level for disabled owner-promotion", async () => {

    //     });

    //     it("should demote an admin-level user to none-level", async() => {

    //     });

    //     it("should promote/demote an admin-level user to admin-level", async () => {

    //     });

    //     it("should promote an admin-level user to owner-level for enabled owner promotion", async () => {

    //     });

    //     it("should fail to promote an admin-level user to owner-level for disabled owner promotion", async() => {

    //     });

    //     it("should demote an owner-level user to none-level for enabled owner demotion", async () => {

    //     });

    //     it("should fail to demote an owner-level user to none-level for disabled owner demotion", async () => {

    //     });

    //     it("should keep a user's owner-level for admin-level demotion for enabled owner demotion", async () => {

    //     });

    //     it("should fail to demote an owner-level user to admin-level for disabled owner demotion", async () => {

    //     });

    //     it("should promote/demote an owner-level user to owner-level for enabled owner demotion", async () => {

    //     });

    //     it("should fail promote/demote an owner-level user to owner-level for disabled owner demotion", async () => {

    //     });
    // });
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
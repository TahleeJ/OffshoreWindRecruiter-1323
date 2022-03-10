const functions = require('firebase-functions');
const path = require('path');
const functionsTest = require('firebase-functions-test');

const projectConfig = {
    projectId: process.env.REACT_APP_FIREBASE_KEY,
    databaseUrl: process.env.REACT_APP_FIREBASE_DATABASE
};
const testEnv = functionsTest(projectConfig, path.resolve('serviceAccountKey.json'));;
// import { testEnv } from './init';

// import * as functions from 'firebase-functions';
import { CallableContextOptions, WrappedFunction } from 'firebase-functions-test/lib/main';
// import { PermissionLevel } from '../../src/firebase/Types';
// import  { authInstance, devDefaultReset, docRefs, updateTransactions, setUpTestUsers, testUserContext } from './setup';
import * as chai from 'chai';

// import * as checkError from 'check-error';
import { devDefaultReset, testUserContext, updateTransactions } from './setup';

// import * as functions from 'firebase-functions';

// import 'firebase-functions';

// require('firebase-admin');

// const functions = require('firebase-functions');
// const setup = require('./setup.ts');
// const checkError = require('check-error');

// require('dotenv').config({ path: `/OffshoreWindJobNavigator/.env.prod` });
require('custom-env').env('prod');

let myFunctions: { updatePermissions: any; };
let updatePermissionsWrapped: WrappedFunction;

var contexts = {
    none: <CallableContextOptions> <unknown>null,
    admin: <CallableContextOptions> <unknown>null,
    owner:<CallableContextOptions> <unknown>null  
};

// const assert = chai.assert;
const expect = chai.expect;

describe("Update Permissions Function Unit Tests", () => {
    before(async () => {
        myFunctions = require('../src/index.js');
        updatePermissionsWrapped = testEnv.wrap(myFunctions.updatePermissions);

        contexts.none = await testUserContext.none;
        contexts.admin = await testUserContext.admin;
        contexts.owner = await testUserContext.owner;
    });

    beforeEach(async () => {
        await devDefaultReset();
    });

    afterEach(async () => {
        await devDefaultReset();
    })

    after(() => {
        testEnv.cleanup();
    });

    describe("None-level caller", () => {
        it("should fail to promote a none-level user to none-level", async () => {     
            expect(function(){
                console.log(contexts.none);
                updatePermissionsWrapped(updateTransactions.onNone.toNone, contexts.none);
            }).to.throw(functions.https.HttpsError);

        });

        // it("should fail to promote a none-level user to admin-level", async () => {     
        //     expect(function(){
        //         updatePermissionsWrapped(updateTransactions.onNone.toAdmin, contexts.none);
        //     }).to.throw(functions.https.HttpsError);

        // });

        // it("should fail to promote a none-level user to owner-level for owner promotion enabled", async () => {   
        //     expect(function(){
        //         updatePermissionsWrapped(updateTransactions.onNone.toOwner, contexts.none);
        //     }).to.throw(functions.https.HttpsError);

        // });

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
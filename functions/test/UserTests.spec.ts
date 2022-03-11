import * as functions from 'firebase-functions';
import { CallableContextOptions, WrappedFunction } from 'firebase-functions-test/lib/main';
import { createUsers, testUserContext, devDefaultReset, updateTransactions } from './Utility';
import { testEnv } from './Init';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

var contexts = {
    none: <CallableContextOptions> <unknown>null,
    admin: <CallableContextOptions> <unknown>null,
    owner:<CallableContextOptions> <unknown>null  
};

let myFunctions: { updatePermissions: any; };
let updatePermissionsWrapped: WrappedFunction;

describe("Update Permissions Function Unit Tests", () => {
    before(async () => {
        await createUsers();

        myFunctions = require('../src/index.js');
        updatePermissionsWrapped = testEnv.wrap(myFunctions.updatePermissions);

        contexts.none = await testUserContext.none;
        contexts.admin = await testUserContext.admin;
        contexts.owner = await testUserContext.owner;
    });

    beforeEach(async () => {
        await devDefaultReset();
    });

    after(() => {
        testEnv.cleanup();
    });

    describe("None-level caller", () => {
        it("should fail to promote a none-level user to none-level", async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toNone, contexts.none).should.eventually.be.rejectedWith(functions.https.HttpsError);    
        });

        it("should fail to promote a none-level user to admin-level", async () => {     
            await updatePermissionsWrapped(updateTransactions.onAdmin.toNone, contexts.none).should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

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
});
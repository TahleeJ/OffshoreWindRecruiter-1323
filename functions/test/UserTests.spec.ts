import * as functions from 'firebase-functions';
import { WrappedFunction } from 'firebase-functions-test/lib/main';
import { initTestDocs, resetTestDocs, testUserContext, updateTransactions } from './Utility';
import { testEnv } from './Init';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { afterEach } from 'mocha';

chai.use(chaiAsPromised);
chai.should();

let myFunctions: { updatePermissions: any; };
let updatePermissionsWrapped: WrappedFunction;

describe("Update Permissions Function Unit Tests", () => {
    before(async () => {
        await initTestDocs();

        myFunctions = require('../src/index.js');
        updatePermissionsWrapped = testEnv.wrap(myFunctions.updatePermissions);
    });

    afterEach(async () => {
        await resetTestDocs();
    })

    after(() => {
        testEnv.cleanup();
    });

    describe("None-level caller", () => {
        it("should fail to promote a none-level user to none-level", async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toNone, testUserContext.none).should.eventually.be.rejectedWith(functions.https.HttpsError);    
        });

        it("should fail to promote a none-level user to admin-level", async () => {     
            await updatePermissionsWrapped(updateTransactions.onAdmin.toNone, testUserContext.none).should.eventually.be.rejectedWith(functions.https.HttpsError);
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
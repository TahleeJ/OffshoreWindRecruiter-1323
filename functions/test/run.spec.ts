// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
const functionsTest = require('firebase-functions-test');
// const admin = require('firebase-admin');
import * as adminApp from "firebase-admin/app";
import { PermissionLevel} from '../../src/firebase/Types';
import { CallableContextOptions, WrappedFunction } from 'firebase-functions-test/lib/main';
const path = require('path');
// if (!admin.apps.length) {
// var serviceAccount = require(path.resolve("serviceAccountKey.json"));
var serviceAccount = path.resolve("serviceAccountKey.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

//     console.log("hit");
// } else {
//     admin.app();
// }


require('custom-env').env('dev');
const adminAuth = require('firebase-admin/auth');
const adminFirestore = require('firebase-admin/firestore');

// require('custom-env').env('prod');


const myApp = adminApp.initializeApp({
    credential: adminApp.cert(serviceAccount),
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
}, "admin app");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
// }, "admin app");

const adminAuthInstance = adminAuth.getAuth(myApp);
const adminFirestoreInstance = adminFirestore.getFirestore(myApp);


// var adminAuthInstance = ;
// var adminFirestoreInstance = ;

// const adminAuthInstance = admin.auth();
// const adminFirestoreInstance = admin.firestore();


const testCreds = {
    uids: {
        none: process.env.TEST_UID_NONE,
        admin: process.env.TEST_UID_ADMIN,
        owner: process.env.TEST_UID_OWNER
    },
    emails: {
        none: process.env.TEST_EMAIL_NONE,
        admin: process.env.TEST_EMAIL_ADMIN,
        owner: process.env.TEST_EMAIL_OWNER
    },
    passwords: {
        none: process.env.TEST_PASS_NONE,
        admin: process.env.TEST_PASS_ADMIN,
        owner: process.env.TEST_PASS_OWNER
    }
};

// const firestore = admin.firestore();

export var testUserContext = {
    none: getTestUserToken(testCreds.emails.none!, testCreds.passwords.none!, testCreds.uids.none!),
    admin: getTestUserToken(testCreds.emails.admin!, testCreds.passwords.admin!, testCreds.uids.admin!),
    owner: getTestUserToken(testCreds.emails.owner!, testCreds.passwords.owner!, testCreds.uids.owner!)
}

async function getTestUserToken(email: string, password: string, uid: string): Promise<CallableContextOptions> {
    // const user = await firebaseAuth.signInWithEmailAndPassword(authInstance, email, password).then((userCredential) => {
    //     console.log(`${authInstance!}, ${email}, ${password}`);
    //     return userCredential.user;
    // });

    const userToken = await adminAuthInstance.createCustomToken(uid);

    // const userToken = await user.getIdToken();
    const userContext = contextCreator(uid, userToken);

    // authInstance.signOut();

    return userContext;
}

// function getTestUserContext(email: string, password: string, uid: string): CallableContextOptions {
//     const token = getTestUserToken(email, password)
// }

function contextCreator(uid: string, token: string): CallableContextOptions {
    return {
        auth: {
            uid: uid,
            token: token
        }
    }
}

// const testUserDocRefs = {
//     none: firestore.doc(firestoreInstance, `User/${process.env.TEST_UID_NONE!}`),
//     admin: firestore.doc(firestoreInstance, `User/${process.env.TEST_UID_ADMIN!}`),
//     owner: firestore.doc(firestoreInstance, `User/${process.env.TEST_UID_OWNER!}`)
// }

async function createUsers() {
    await adminFirestoreInstance.collection("User").doc(testCreds.uids.none!).create({email: testCreds.emails.none!, permissionLevel: PermissionLevel.None});
    await adminFirestoreInstance.collection("User").doc(testCreds.uids.admin!).create({email: testCreds.emails.admin!, permissionLevel: PermissionLevel.Admin});
    await adminFirestoreInstance.collection("User").doc(testCreds.uids.owner!).create({email: testCreds.emails.owner!, permissionLevel: PermissionLevel.Owner});

    await adminFirestoreInstance.collection("Flag").doc("test").create({promoteToOwnerDev: true, demoteOwnerDev: false});
}

export async function devDefaultReset() {
    // await firestore.updateDoc(testUserDocRefs.none, {permissionLevel: PermissionLevel.None});
    // await firestore.updateDoc(testUserDocRefs.admin, {permissionLevel: PermissionLevel.Admin});
    // await firestore.updateDoc(testUserDocRefs.owner, {permissionLevel: PermissionLevel.Owner});

    // const flagQuerySnapshot = await firestore.getDocs(firestore.collection(firestoreInstance, "Flag"));
    // const flagDocId = flagQuerySnapshot.forEach((doc) => {
    //     return doc.id;
    // });

    // const flagDocRef = firestore.doc(firestoreInstance, `Flag/${flagDocId}`);

    // await firestore.updateDoc(flagDocRef, {promoteToOwnerDev: process.env.FLAG_OWNER_PROMOTION, demoteOwnerDev: process.env.FLAG_OWNER_DEMOTION});

    await adminFirestoreInstance.collection("User").doc(testCreds.uids.none!).update({permissionLevel: PermissionLevel.None});
    await adminFirestoreInstance.collection("User").doc(testCreds.uids.admin!).update({permissionLevel: PermissionLevel.Admin});
    await adminFirestoreInstance.collection("User").doc(testCreds.uids.owner!).update({permissionLevel: PermissionLevel.Owner});

    await adminFirestoreInstance.collection("Flag").doc("test").update({promoteToOwnerDev: true, demoteOwnerDev: false});
}

export const updateTransactions = {
    onNone: {
        toNone: {
            userEmail: testCreds.emails.none,
            newPermissionLevel: PermissionLevel.None
        },
        toAdmin: {
            userEmail: testCreds.emails.none,
            newPermissionLevel: PermissionLevel.Admin
        },
        toOwner: {
            userEmail: testCreds.emails.none,
            newPermissionLevel: PermissionLevel.Owner
        }
    },
    onAdmin: {
        toNone: {
            userEmail: testCreds.emails.admin,
            newPermissionLevel: PermissionLevel.None
        },
        toAdmin: {
            userEmail: testCreds.emails.admin,
            newPermissionLevel: PermissionLevel.Admin
        },
        toOwner: {
            userEmail: testCreds.emails.admin,
            newPermissionLevel: PermissionLevel.Owner
        }
    },
    onOwner: {
        toNone: {
            userEmail: testCreds.emails.owner,
            newPermissionLevel: PermissionLevel.None
        },
        toAdmin: {
            userEmail: testCreds.emails.owner,
            newPermissionLevel: PermissionLevel.Admin
        },
        toOwner: {
            userEmail: testCreds.emails.owner,
            newPermissionLevel: PermissionLevel.Owner
        }
    }
};

const testEnv = functionsTest({}, serviceAccount);

let myFunctions: { updatePermissions: any; };
let updatePermissionsWrapped: WrappedFunction;

var contexts = {
    none: <CallableContextOptions> <unknown>null,
    admin: <CallableContextOptions> <unknown>null,
    owner:<CallableContextOptions> <unknown>null  
};

const chai = require('chai');
const chaiAsPromised  = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
// const assert = chai.assert;
// const expect = chai.expect;
// const done = chai.done;
const functions = require('firebase-functions');

describe("Update Permissions Function Unit Tests", () => {
    before(async () => {
        await createUsers();
        console.log(process.env.REACT_APP_FIREBASE_PROJECT_ID);
        myFunctions = require('../src/index.js');
        updatePermissionsWrapped = testEnv.wrap(myFunctions.updatePermissions);

        contexts.none = await testUserContext.none;
        contexts.admin = await testUserContext.admin;
        contexts.owner = await testUserContext.owner;
    });

    beforeEach(async () => {
        await devDefaultReset();
    });

    // afterEach(async () => {
    //     await devDefaultReset();
    // })

    after(() => {
        testEnv.cleanup();
    });

    describe("None-level caller", () => {
        it("should fail to promote a none-level user to none-level", async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toNone, contexts.none).should.eventually.be.rejectedWith(functions.https.HttpsError);
            // await expect(updatePermissionsWrapped(updateTransactions.onNone.toNone, contexts.none)).to.be.rejected();
            // expect(async function(){
            //     console.log("hello");
                // const data = await adminFirestoreInstance.collection("User").doc(testCreds.uids.none!).data().permissionLevel;
            //     console.log(`hello 1: ${data}`);
            //     await updatePermissionsWrapped(updateTransactions.onNone.toNone, contexts.none);
            // }).to.throw();
            // console.log(`hello 1: ${data}`);
        
        });

        it("should fail to promote a none-level user to admin-level", async () => {     
            await updatePermissionsWrapped(exports.updateTransactions.onAdmin.toNone, contexts.none).should.eventually.be.rejectedWith(functions.https.HttpsError);
           
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
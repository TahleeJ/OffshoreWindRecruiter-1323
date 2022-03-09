import { initializeApp } from "firebase/app";
import * as admin from 'firebase-admin';
import { PermissionLevel, User } from '../../src/firebase/Types';
import { CallableContextOptions } from 'firebase-functions-test/lib/main'
// import { firebaseApp, authInstance } from '../../src/firebase/Firebase';
import * as firebaseAuth from '@firebase/auth';
import { UserInfo } from "firebase-admin/lib/auth/user-record";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
export const authInstance = firebaseAuth.getAuth(firebaseApp);

export const testEmails = {
    none: process.env.TEST_EMAIL_NONE,
    admin: process.env.TEST_EMAIL_ADMIN,
    owner: process.env.TEST_EMAIL_OWNER
};

// const auth = admin.auth();
// const testUsers = {
//     none: testInstance.auth.makeUserRecord({email: testEmails.none}),
//     admin: testInstance.auth.makeUserRecord({email: testEmails.admin}),
//     owner: testInstance.auth.makeUserRecord({email: testEmails.owner})
// };

// const auth = admin.auth();
const firestore = admin.firestore();

// export const testUserss = {
//     none: new UserInfo(testEmails.none),
//     admin: await auth.getUserByEmail(testEmails.admin),
//     owner: await auth.getUserByEmail(testEmails.owner)
// }

export var testUserContext = {
    none: <CallableContextOptions> null,
    admin: <CallableContextOptions> null,
    owner: <CallableContextOptions> null
}

export async function setUpTestUsers() {
    testUserContext.none = await getTestUserToken(process.env.TEST_EMAIL_NONE, process.env.TEST_PASS_NONE);
    testUserContext.admin = await getTestUserToken(process.env.TEST_EMAIL_ADMIN, process.env.TEST_PASS_ADMIN);
    testUserContext.owner = await getTestUserToken(process.env.TEST_EMAIL_OWNER, process.env.TEST_PASS_OWNER);
}

async function getTestUserToken(email: string, password: string): Promise<CallableContextOptions> {
    const user = await firebaseAuth.signInWithEmailAndPassword(authInstance, email, password).then((userCredential) => {
        return userCredential.user;
    });

    const userToken = await user.getIdToken();
    const userContext = contextCreator(user.uid, userToken);

    authInstance.signOut();

    return userContext;
}

function contextCreator(uid: string, token: string): CallableContextOptions{
    return {
        auth: {
            uid: uid,
            token: token
        }
    }
}

// export var testUserAuthInfo = {
//     token: {
//         none: null,
//         admin: null,
//         owner: null
//     },
//     uid: {
//         none: null,
//         admin: null,
//         owner: null
//     }
// };

// export var testUserAuth = {
//     none: {
//         uid: testUserAuthInfo.uid.none,
//         token: testUserAuthInfo.token.none
//     },
//     admin: {
//         uid: testUserAuthInfo.uid.admin,
//         token: testUserAuthInfo.token.admin
//     },
//     owner: {
//         uid: testUserAuthInfo.uid.owner,
//         token: testUserAuthInfo.token.owner
//     },
// }

export const docRefs = {
    testUser: {
        none: firestore.collection("User").doc(process.env.TEST_UID_NONE),
        admin: firestore.collection("User").doc(process.env.TEST_UID_ADMIN),
        owner: firestore.collection("User").doc(process.env.TEST_UID_OWNER)
    },
    flag: {
        ownerPromote: firestore.collection("Flag").doc(process.env.FLAG_OWNER_PROMOTION),
        ownerDemote: firestore.collection("Flag").doc(process.env.FLAG_OWNER_DEMOTION)
    }
}

export async function devDefaultReset() {
    await docRefs.testUser.none.update({permissionLevel: PermissionLevel.None});
    await docRefs.testUser.admin.update({permissionLevel: PermissionLevel.Admin});
    await docRefs.testUser.owner.update({permissionLevel: PermissionLevel.Owner});

    await docRefs.flag.ownerPromote.update({promoteToOwnerDev: true});
    await docRefs.flag.ownerDemote.update({demoteOwnerDev: false});
}



export const updateTransactions = {
    // none: {
    //     onNone: {
    //         toNone: {

    //         }
    //     },
    //     onAdmin: {

    //     },
    //     onOwner: {

    //     }
    // },
    // admin: {
    //     onNone: {

    //     },
    //     onAdmin: {

    //     },
    //     onOwner: {
            
    //     }
    // },
    // owner: {
    //     onNone: {

    //     },
    //     onAdmin: {

    //     },
    //     onOwner: {
            
    //     }
    // }
    onNone: {
        toNone: {
            userEmail: testEmails.none,
            newPermissionLevel: PermissionLevel.None
        },
        toAdmin: {
            userEmail: testEmails.none,
            newPermissionLevel: PermissionLevel.Admin
        },
        toOwner: {
            userEmail: testEmails.none,
            newPermissionLevel: PermissionLevel.Owner
        }
    },
    onAdmin: {
        toNone: {
            userEmail: testEmails.admin,
            newPermissionLevel: PermissionLevel.None
        },
        toAdmin: {
            userEmail: testEmails.admin,
            newPermissionLevel: PermissionLevel.Admin
        },
        toOwner: {
            userEmail: testEmails.admin,
            newPermissionLevel: PermissionLevel.Owner
        }
    },
    onOwner: {
        toNone: {
            userEmail: testEmails.owner,
            newPermissionLevel: PermissionLevel.None
        },
        toAdmin: {
            userEmail: testEmails.owner,
            newPermissionLevel: PermissionLevel.Admin
        },
        toOwner: {
            userEmail: testEmails.owner,
            newPermissionLevel: PermissionLevel.Owner
        }
    }
};

// export async function authSetup() {
//     testUserAuthInfo.uid.none = testUsers.none.uid;
//     testUserAuthInfo.uid.admin = testUsers.admin.uid;
//     testUserAuthInfo.uid.owner = testUsers.owner.uid;

//     testUserAuthInfo.token.none = await testUsers.none.getIdToken();
//     testUserAuthInfo.token.admin = await testUsers.admin.getIdToken();
//     testUserAuthInfo.token.owner = await testUsers.owner.getIdToken();
// }

var token = authInstance.getIdToken(testUserss.none)
var ofd = testUserss.none.getIdToken();
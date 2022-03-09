// import { initializeApp } from 'firebase/app';
import { firebaseAuth, authInstance, admin } from './init';
import { PermissionLevel} from '../../src/firebase/Types';
import { CallableContextOptions } from 'firebase-functions-test/lib/main'
// import * as firebaseAuth from '@firebase/auth';
// import { FirebaseApp } from 'firebase/app';
// import { firebaseApp } from '../../src/firebase/Firebase';

require('custom-env').env('dev');

const testEmails = {
    none: process.env.TEST_EMAIL_NONE,
    admin: process.env.TEST_EMAIL_ADMIN,
    owner: process.env.TEST_EMAIL_OWNER
};

const firestore = admin.firestore();

export var testUserContext = {
    none: getTestUserToken(process.env.TEST_EMAIL_NONE!, process.env.TEST_PASS_NONE!),
    admin: getTestUserToken(process.env.TEST_EMAIL_ADMIN!, process.env.TEST_PASS_ADMIN!),
    owner: getTestUserToken(process.env.TEST_EMAIL_OWNER!, process.env.TEST_PASS_OWNER!)
}

async function getTestUserToken(email: string, password: string): Promise<CallableContextOptions> {
    const user = await firebaseAuth.signInWithEmailAndPassword(authInstance, email, password).then((userCredential) => {
        return userCredential.user;
    });

    const userContext = await user.getIdToken().then((token) => {
        return contextCreator(user.uid, token);
    })

    // const userToken = await user.getIdToken();
    // const userContext = contextCreator(user.uid, userToken);

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

export const docRefs = {
    testUser: {
        none: firestore.collection("User").doc(process.env.TEST_UID_NONE!),
        admin: firestore.collection("User").doc(process.env.TEST_UID_ADMIN!),
        owner: firestore.collection("User").doc(process.env.TEST_UID_OWNER!)
    },
    flag: {
        ownerPromote: firestore.collection("Flag").doc(process.env.FLAG_OWNER_PROMOTION!),
        ownerDemote: firestore.collection("Flag").doc(process.env.FLAG_OWNER_DEMOTION!)
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

// export const testUserss = {
//     none: new UserInfo(testEmails.none),
//     admin: await auth.getUserByEmail(testEmails.admin),
//     owner: await auth.getUserByEmail(testEmails.owner)
// }

// const auth = admin.auth();
// const testUsers = {
//     none: testInstance.auth.makeUserRecord({email: testEmails.none}),
//     admin: testInstance.auth.makeUserRecord({email: testEmails.admin}),
//     owner: testInstance.auth.makeUserRecord({email: testEmails.owner})
// };

// const auth = admin.auth();

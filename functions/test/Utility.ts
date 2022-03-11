import { auth, firestore } from './Init';
import { PermissionLevel} from '../../src/firebase/Types';
import { CallableContextOptions } from 'firebase-functions-test/lib/main';

require('custom-env').env('dev');

export const testCreds = {
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
    },
};

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

export async function createUsers() {
    await firestore.collection("User").doc(testCreds.uids.none!).create({email: testCreds.emails.none!, permissionLevel: PermissionLevel.None});
    await firestore.collection("User").doc(testCreds.uids.admin!).create({email: testCreds.emails.admin!, permissionLevel: PermissionLevel.Admin});
    await firestore.collection("User").doc(testCreds.uids.owner!).create({email: testCreds.emails.owner!, permissionLevel: PermissionLevel.Owner});

    await firestore.collection("Flag").doc("test").create({promoteToOwnerDev: true, demoteOwnerDev: false});
}

export var testUserContext = {
    none: getTestUserContext(testCreds.emails.none!, testCreds.passwords.none!, testCreds.uids.none!),
    admin: getTestUserContext(testCreds.emails.admin!, testCreds.passwords.admin!, testCreds.uids.admin!),
    owner: getTestUserContext(testCreds.emails.owner!, testCreds.passwords.owner!, testCreds.uids.owner!)
}

async function getTestUserContext(email: string, password: string, uid: string): Promise<CallableContextOptions> {
    const userToken = await auth.createCustomToken(uid);
    const userContext = contextCreator(uid, userToken);

    return userContext;
}

function contextCreator(uid: string, token: string): CallableContextOptions {
    return {
        auth: {
            uid: uid,
            token: token
        }
    }
}

export async function initReset() {
    await firestore.collection("User").doc(testCreds.uids.none!).create({email: testCreds.emails.none!, permissionLevel: PermissionLevel.None});
    await firestore.collection("User").doc(testCreds.uids.admin!).create({email: testCreds.emails.admin!, permissionLevel: PermissionLevel.Admin});
    await firestore.collection("User").doc(testCreds.uids.owner!).create({email: testCreds.emails.owner!, permissionLevel: PermissionLevel.Owner});

    await firestore.collection("Flag").doc("test").create({promoteToOwnerDev: true, demoteOwnerDev: false});
}

export async function devDefaultReset() {
    await firestore.collection("User").doc(testCreds.uids.none!).update({permissionLevel: PermissionLevel.None});
    await firestore.collection("User").doc(testCreds.uids.admin!).update({permissionLevel: PermissionLevel.Admin});
    await firestore.collection("User").doc(testCreds.uids.owner!).update({permissionLevel: PermissionLevel.Owner});

    await firestore.collection("Flag").doc("test").update({promoteToOwnerDev: true, demoteOwnerDev: false});
}
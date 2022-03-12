import { auth, firestore } from './Init';
import { PermissionLevel} from '../../src/firebase/Types';
import { CallableContextOptions } from 'firebase-functions-test/lib/main';
import { CreateRequest, UserRecord } from 'firebase-admin/auth';

// require('custom-env').env('dev');

const testUserEmails = {
    none: "none@oswjn.com",
    admin: "admin@oswjn.com",
    owner: "owner@oswjn.com"
}

var testUsers = {
    none: <UserRecord> <unknown> null,
    admin: <UserRecord> <unknown> null,
    owner: <UserRecord> <unknown> null
}

export var testUserContext = {
    none: <CallableContextOptions> <unknown> null,
    admin: <CallableContextOptions> <unknown> null,
    owner: <CallableContextOptions> <unknown> null
}

export async function initTestDocs() {
    var docRef = await createTestUserDoc(testUserEmails.none, PermissionLevel.None);
    testUsers.none = await auth.createUser(<CreateRequest> {email: testUserEmails.none, uid: docRef});
    testUserContext.none = await createTestUserContext(docRef);

    docRef = await createTestUserDoc(testUserEmails.admin, PermissionLevel.Admin);
    testUsers.admin = await auth.createUser(<CreateRequest> {email: testUserEmails.admin, uid: docRef});
    testUserContext.admin = await createTestUserContext(docRef);

    docRef = await createTestUserDoc(testUserEmails.owner, PermissionLevel.Owner);
    testUsers.owner = await auth.createUser(<CreateRequest> {email: testUserEmails.owner, uid: docRef});
    testUserContext.owner = await createTestUserContext(docRef);

    await firestore.collection("Flag").add({promoteToOwner: true, demoteOwner: false});
}

async function createTestUserDoc(email: string, permissionLevel: PermissionLevel): Promise<string> {
    return (await firestore.collection("User").add({email: email, permissionLevel: permissionLevel}).then((documentReference) => {return documentReference.id}));
}


async function createTestUserContext(uid: string): Promise<CallableContextOptions> {
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
   
export async function resetTestDocs() {
    await firestore.collection("User").doc(testUsers.none.uid!).update({permissionLevel: PermissionLevel.None});
    await firestore.collection("User").doc(testUsers.admin.uid!).update({permissionLevel: PermissionLevel.Admin});
    await firestore.collection("User").doc(testUsers.owner.uid!).update({permissionLevel: PermissionLevel.Owner});

    const flagDocId = await firestore.collection("Flag").get().then((querySnapshot) => {return querySnapshot.docs[0].id});

    await firestore.collection("Flag").doc(flagDocId).update({promoteToOwnerDev: true, demoteOwnerDev: false});
}

export const updateTransactions = {
    onNone: {
        toNone: {
            userEmail: testUserEmails.none,
            newPermissionLevel: PermissionLevel.None
        },
        toAdmin: {
            userEmail: testUserEmails.none,
            newPermissionLevel: PermissionLevel.Admin
        },
        toOwner: {
            userEmail: testUserEmails.none,
            newPermissionLevel: PermissionLevel.Owner
        }
    },
    onAdmin: {
        toNone: {
            userEmail: testUserEmails.admin,
            newPermissionLevel: PermissionLevel.None
        },
        toAdmin: {
            userEmail: testUserEmails.admin,
            newPermissionLevel: PermissionLevel.Admin
        },
        toOwner: {
            userEmail: testUserEmails.admin,
            newPermissionLevel: PermissionLevel.Owner
        }
    },
    onOwner: {
        toNone: {
            userEmail: testUserEmails.owner,
            newPermissionLevel: PermissionLevel.None
        },
        toAdmin: {
            userEmail: testUserEmails.owner,
            newPermissionLevel: PermissionLevel.Admin
        },
        toOwner: {
            userEmail: testUserEmails.owner,
            newPermissionLevel: PermissionLevel.Owner
        }
    }
};
import { CreateRequest, UserRecord } from 'firebase-admin/auth';
import { DocumentReference } from 'firebase-admin/firestore';
import { CallableContextOptions } from 'firebase-functions-test/lib/main';

import { PermissionLevel } from '../../src/firebase/Types';
import { auth, firestore } from '../src/Utility';


export enum ApplicationFlagType {
    promoteToOwner,
    demoteOwner
}

const testUserEmails = {
    none: "none@oswjn.com",
    admin: "admin@oswjn.com",
    owner: "owner@oswjn.com"
}

var testUsers = {
    none: null as unknown as UserRecord,
    admin: null as unknown as UserRecord,
    owner: null as unknown as UserRecord
}

export var testUserContext = {
    none: null as unknown as CallableContextOptions,
    admin: null as unknown as CallableContextOptions,
    owner: null as unknown as CallableContextOptions
}

export var testUserDocRef = {
    none: null as unknown as DocumentReference,
    admin: null as unknown as DocumentReference,
    owner: null as unknown as DocumentReference
}

export async function initTestDocs() {
    var docRef: string;

    docRef = await createTestUserDoc(testUserEmails.none, PermissionLevel.None);
    testUsers.none = await auth.createUser({ email: testUserEmails.none, uid: docRef } as CreateRequest);
    testUserContext.none = await createTestUserContext(docRef);
    testUserDocRef.none = firestore.collection("User").doc(docRef);

    docRef = await createTestUserDoc(testUserEmails.admin, PermissionLevel.Admin);
    testUsers.admin = await auth.createUser({ email: testUserEmails.admin, uid: docRef } as CreateRequest);
    testUserContext.admin = await createTestUserContext(docRef);
    testUserDocRef.admin = firestore.collection("User").doc(docRef);

    docRef = await createTestUserDoc(testUserEmails.owner, PermissionLevel.Owner);
    testUsers.owner = await auth.createUser({ email: testUserEmails.owner, uid: docRef } as CreateRequest);
    testUserContext.owner = await createTestUserContext(docRef);
    testUserDocRef.owner = firestore.collection("User").doc(docRef);

    await firestore.collection("Flag").add({ promoteToOwner: true, demoteOwner: false });
}

async function createTestUserDoc(email: string, permissionLevel: PermissionLevel): Promise<string> {
    return (await firestore.collection("User").add({ email: email, permissionLevel: permissionLevel })).id;
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
    await firestore.collection("User").doc(testUsers.none.uid!).update({ permissionLevel: PermissionLevel.None });
    await firestore.collection("User").doc(testUsers.admin.uid!).update({ permissionLevel: PermissionLevel.Admin });
    await firestore.collection("User").doc(testUsers.owner.uid!).update({ permissionLevel: PermissionLevel.Owner });

    const flagDocId = (await firestore.collection("Flag").get()).docs[0].id;

    await firestore.collection("Flag").doc(flagDocId).update({ promoteToOwnerDev: true, demoteOwnerDev: false });
}

export async function setApplicationFlag(flag: ApplicationFlagType, value: boolean) {
    const flagDocId = (await firestore.collection("Flag").get()).docs[0].id;

    switch (flag) {
        case ApplicationFlagType.promoteToOwner:
            await firestore.collection("Flag").doc(flagDocId).update({ promoteToOwner: value });

            break;
        case ApplicationFlagType.demoteOwner:
            await firestore.collection("Flag").doc(flagDocId).update({ demoteOwner: value });
    }
}

export async function getTestUserPermissionLevel(ref: DocumentReference): Promise<PermissionLevel> {
    return (await ref.get()).data()?.permissionLevel;
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
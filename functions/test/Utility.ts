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

/**
 * Initializes the test users (of permission levels None, Admin, and Owner respectively) 
 * and application flags to be used in the testing environment in the emulated 
 * Authentication and Firestore services
 */
export async function initTestDocs() {
    var docRef: string;

    // None-level test user initialization
    docRef = await createTestUserDoc(testUserEmails.none, PermissionLevel.None);
    testUsers.none = await auth.createUser({ email: testUserEmails.none, uid: docRef } as CreateRequest);
    testUserContext.none = await createTestUserContext(docRef);
    testUserDocRef.none = firestore.collection("User").doc(docRef);

    // Admin-level test user initialization
    docRef = await createTestUserDoc(testUserEmails.admin, PermissionLevel.Admin);
    testUsers.admin = await auth.createUser({ email: testUserEmails.admin, uid: docRef } as CreateRequest);
    testUserContext.admin = await createTestUserContext(docRef);
    testUserDocRef.admin = firestore.collection("User").doc(docRef);

    // Owner-level test user initialization
    docRef = await createTestUserDoc(testUserEmails.owner, PermissionLevel.Owner);
    testUsers.owner = await auth.createUser({ email: testUserEmails.owner, uid: docRef } as CreateRequest);
    testUserContext.owner = await createTestUserContext(docRef);
    testUserDocRef.owner = firestore.collection("User").doc(docRef);

    // Application flag initialization
    await firestore.collection("Flag").add({ promoteToOwner: true, demoteOwner: false });
}

/**
 * Creates a test user document in the emulated Firestore
 * 
 * @param email the test user's email
 * @param permissionLevel the test user's permission level within the application
 * @returns the newly created document for the test user
 */
async function createTestUserDoc(email: string, permissionLevel: PermissionLevel): Promise<string> {
    return (await firestore.collection("User").add({ email: email, permissionLevel: permissionLevel })).id;
}

/**
 * Generates and authentication token for a test user and creates the 
 * authentication context for a test user based on the generated token
 * 
 * @param uid the uid for the test user matching the user's emulated Firestore document id
 * @returns the authentication context for the test user
 */
async function createTestUserContext(uid: string): Promise<CallableContextOptions> {
    const userToken = await auth.createCustomToken(uid);

    return {
        auth: {
            uid: uid,
            token: userToken
        } as CallableContextOptions
    };
}

/**
 * Resets the test user documents in the emulated Firestore to their initial values
 */
export async function resetTestDocs() {
    await firestore.collection("User").doc(testUsers.none.uid!).update({ permissionLevel: PermissionLevel.None });
    await firestore.collection("User").doc(testUsers.admin.uid!).update({ permissionLevel: PermissionLevel.Admin });
    await firestore.collection("User").doc(testUsers.owner.uid!).update({ permissionLevel: PermissionLevel.Owner });

    const flagDocId = (await firestore.collection("Flag").get()).docs[0].id;

    await firestore.collection("Flag").doc(flagDocId).update({ promoteToOwnerDev: true, demoteOwnerDev: false });
}

/**
 * Sets the desired application flag in the emulated Firestore to a specified value
 * 
 * @param flag the desired application flag to change
 * @param value the value to change the application flag to
 */
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

/**
 * Gets the permission level for a specified test user
 * 
 * @param ref the document reference for the desired test user
 * @returns the permission level of the test user within the application
 */
export async function getTestUserPermissionLevel(ref: DocumentReference): Promise<PermissionLevel> {
    return (await ref.get()).data()?.permissionLevel;
}

// Test parameters to pass into updatePermissions function tests
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
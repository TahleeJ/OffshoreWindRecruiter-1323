// // import { initializeApp } from 'firebase/app';
// // import { firebaseAuth, authInstance } from './init';

// import { PermissionLevel} from '../../src/firebase/Types';
// import { CallableContextOptions } from 'firebase-functions-test/lib/main';
// import { adminAuthInstance, adminFirestoreInstance } from './init';
// // import { firestore } from 'firebase-admin';
// // import * as firestore from "@firebase/firestore";

// // import * as firebaseAuth from '@firebase/auth';
// // import { FirebaseApp } from 'firebase/app';
// // import { firebaseApp } from '../../src/firebase/Firebase';

// require('custom-env').env('dev');

// const testCreds = {
//     uids: {
//         none: process.env.TEST_UID_NONE,
//         admin: process.env.TEST_UID_ADMIN,
//         owner: process.env.TEST_UID_OWNER
//     },
//     emails: {
//         none: process.env.TEST_EMAIL_NONE,
//         admin: process.env.TEST_EMAIL_ADMIN,
//         owner: process.env.TEST_EMAIL_OWNER
//     },
//     passwords: {
//         none: process.env.TEST_PASS_NONE,
//         admin: process.env.TEST_PASS_ADMIN,
//         owner: process.env.TEST_PASS_OWNER
//     }
// };

// // const firestore = admin.firestore();

// export var testUserContext = {
//     none: getTestUserToken(testCreds.emails.none!, testCreds.passwords.none!, testCreds.uids.none!),
//     admin: getTestUserToken(testCreds.emails.admin!, testCreds.passwords.admin!, testCreds.uids.admin!),
//     owner: getTestUserToken(testCreds.emails.owner!, testCreds.passwords.owner!, testCreds.uids.owner!)
// }

// async function getTestUserToken(email: string, password: string, uid: string): Promise<CallableContextOptions> {
//     // const user = await firebaseAuth.signInWithEmailAndPassword(authInstance, email, password).then((userCredential) => {
//     //     console.log(`${authInstance!}, ${email}, ${password}`);
//     //     return userCredential.user;
//     // });

//     const userToken = await adminAuthInstance.createCustomToken(uid);

//     // const userToken = await user.getIdToken();
//     const userContext = contextCreator(uid, userToken);

//     // authInstance.signOut();

//     return userContext;
// }

// // function getTestUserContext(email: string, password: string, uid: string): CallableContextOptions {
// //     const token = getTestUserToken(email, password)
// // }

// function contextCreator(uid: string, token: string): CallableContextOptions {
//     return {
//         auth: {
//             uid: uid,
//             token: token
//         }
//     }
// }

// // const testUserDocRefs = {
// //     none: firestore.doc(firestoreInstance, `User/${process.env.TEST_UID_NONE!}`),
// //     admin: firestore.doc(firestoreInstance, `User/${process.env.TEST_UID_ADMIN!}`),
// //     owner: firestore.doc(firestoreInstance, `User/${process.env.TEST_UID_OWNER!}`)
// // }

// export async function devDefaultReset() {
//     // await firestore.updateDoc(testUserDocRefs.none, {permissionLevel: PermissionLevel.None});
//     // await firestore.updateDoc(testUserDocRefs.admin, {permissionLevel: PermissionLevel.Admin});
//     // await firestore.updateDoc(testUserDocRefs.owner, {permissionLevel: PermissionLevel.Owner});

//     // const flagQuerySnapshot = await firestore.getDocs(firestore.collection(firestoreInstance, "Flag"));
//     // const flagDocId = flagQuerySnapshot.forEach((doc) => {
//     //     return doc.id;
//     // });

//     // const flagDocRef = firestore.doc(firestoreInstance, `Flag/${flagDocId}`);

//     // await firestore.updateDoc(flagDocRef, {promoteToOwnerDev: process.env.FLAG_OWNER_PROMOTION, demoteOwnerDev: process.env.FLAG_OWNER_DEMOTION});

//     await adminFirestoreInstance.collection("User").doc(testCreds.uids.none!).update({permissionLevel: PermissionLevel.None});
//     await adminFirestoreInstance.collection("User").doc(testCreds.uids.admin!).update({permissionLevel: PermissionLevel.Admin});
//     await adminFirestoreInstance.collection("User").doc(testCreds.uids.owner!).update({permissionLevel: PermissionLevel.Owner});

//     await adminFirestoreInstance.collection("Flag").doc(process.env.FLAG_REF_ID!).update({promoteToOwnerDev: true, demoteOwnerDev: false})
// }

// export const updateTransactions = {
//     onNone: {
//         toNone: {
//             userEmail: testCreds.emails.none,
//             newPermissionLevel: PermissionLevel.None
//         },
//         toAdmin: {
//             userEmail: testCreds.emails.none,
//             newPermissionLevel: PermissionLevel.Admin
//         },
//         toOwner: {
//             userEmail: testCreds.emails.none,
//             newPermissionLevel: PermissionLevel.Owner
//         }
//     },
//     onAdmin: {
//         toNone: {
//             userEmail: testCreds.emails.admin,
//             newPermissionLevel: PermissionLevel.None
//         },
//         toAdmin: {
//             userEmail: testCreds.emails.admin,
//             newPermissionLevel: PermissionLevel.Admin
//         },
//         toOwner: {
//             userEmail: testCreds.emails.admin,
//             newPermissionLevel: PermissionLevel.Owner
//         }
//     },
//     onOwner: {
//         toNone: {
//             userEmail: testCreds.emails.owner,
//             newPermissionLevel: PermissionLevel.None
//         },
//         toAdmin: {
//             userEmail: testCreds.emails.owner,
//             newPermissionLevel: PermissionLevel.Admin
//         },
//         toOwner: {
//             userEmail: testCreds.emails.owner,
//             newPermissionLevel: PermissionLevel.Owner
//         }
//     }
// };

// // export async function authSetup() {
// //     testUserAuthInfo.uid.none = testUsers.none.uid;
// //     testUserAuthInfo.uid.admin = testUsers.admin.uid;
// //     testUserAuthInfo.uid.owner = testUsers.owner.uid;

// //     testUserAuthInfo.token.none = await testUsers.none.getIdToken();
// //     testUserAuthInfo.token.admin = await testUsers.admin.getIdToken();
// //     testUserAuthInfo.token.owner = await testUsers.owner.getIdToken();
// // }

// // export var testUserAuthInfo = {
// //     token: {
// //         none: null,
// //         admin: null,
// //         owner: null
// //     },
// //     uid: {
// //         none: null,
// //         admin: null,
// //         owner: null
// //     }
// // };

// // export var testUserAuth = {
// //     none: {
// //         uid: testUserAuthInfo.uid.none,
// //         token: testUserAuthInfo.token.none
// //     },
// //     admin: {
// //         uid: testUserAuthInfo.uid.admin,
// //         token: testUserAuthInfo.token.admin
// //     },
// //     owner: {
// //         uid: testUserAuthInfo.uid.owner,
// //         token: testUserAuthInfo.token.owner
// //     },
// // }

// // export const testUserss = {
// //     none: new UserInfo(testEmails.none),
// //     admin: await auth.getUserByEmail(testEmails.admin),
// //     owner: await auth.getUserByEmail(testEmails.owner)
// // }

// // const auth = admin.auth();
// // const testUsers = {
// //     none: testInstance.auth.makeUserRecord({email: testEmails.none}),
// //     admin: testInstance.auth.makeUserRecord({email: testEmails.admin}),
// //     owner: testInstance.auth.makeUserRecord({email: testEmails.owner})
// // };

// // const auth = admin.auth();

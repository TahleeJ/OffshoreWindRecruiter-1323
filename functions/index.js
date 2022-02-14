const admin = require('firebase-admin');
const functions = require('firebase-functions');
admin.initializeApp();

const firestore = admin.firestore();
const auth = admin.auth();

const permissionLevels = {
    None: 0,
    Admin: 1,
    Owner: 2
};


/**
 * Checks whether the signed in user has administrator priviliges
 * 
 * @param request Parameters sent through function call (unused in this function)
 * @param context Function caller user's authentication information
 * @return whether the signed in user has at least administrator permissions
 */
exports.checkAdmin = functions.https.onCall(async (request, context) => {
    const uid = context.auth.uid;

    return await firestore.collection("User").doc(uid).get().then(snapshot => {
        const data = snapshot.data();

        return { 
            isAdmin: data.permissionLevel != permissionLevels.None
        };
    });
});

/**
 * Given function caller's required privileges, a selected user can
 * remove or give another user administrator privileges
 * 
 * @param request Parameters sent through function call:
 *  {
 *      userEmail: <string>,
 *      newPermissionLevel: <integer>
 *  }
 * 
 * @param context Function caller user's authentication information
 */
exports.updateAdmin = functions.https.onCall(async (request, context) => {
    const uid = context.auth.uid;

    const isAdmin = await firestore.collection("User").doc(uid).get().then(snapshot => {
        const data = snapshot.data();

        return data.permissionLevel;
    });

    if (isAdmin != permissionLevels.Owner) {
        throw new functions.https.HttpsError("permission-denied", "You do not have the privileges necessary to make this call.");
    }

    var userRecord = null;

    try {
        userRecord = await auth.getUserByEmail(request.userEmail);
    } catch (error) {
        throw new functions.https.HttpsError("failed-precondition", "The selected user is not a member of this application.");
    }

    const userDoc = firestore.collection("User").doc(userRecord.uid);

    if (request.newPermissionLevel == undefined || request.newPermissionLevel == null) {
        throw new functions.https.HttpsError("invalid-argument", "You must choose a user to change permission for and whether to promote or demote them using an integer value 0-2.");
    }

    await userDoc.update({permissionLevel: request.newPermissionLevel});

    return;
});

const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { request } = require("http");
admin.initializeApp();

const firestore = admin.firestore();
const auth = admin.auth();

/**
 * Checks whether the signed in user has administrator priviliges
 * 
 * @param request Parameters sent through function call (unused in this function)
 * @param context Function caller user's authentication information
 */
exports.checkAdmin = functions.https.onCall(async (request, context) => {
    const uid = context.auth.uid;

    return await firestore.collection("User").doc(uid).get().then(snapshot => {
        const data = snapshot.data();

        return { 
            isAdmin: data.isAdmin
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
 *      promote: <boolean>
 *  }
 * 
 * @param context Function caller user's authentication information
 */
exports.updateAdmin = functions.https.onCall(async (request, context) => {
    const uid = context.auth.uid;

    const isAdmin = await firestore.collection("User").doc(uid).get().then(snapshot => {
        const data = snapshot.data();

        return data.isAdmin;
    });

    if (!isAdmin) {
        throw new functions.https.HttpsError("permission-denied", "You do not have the privileges necessary to make this call.");
    }

    var userRecord = null;

    try {
        userRecord = await auth.getUserByEmail(request.userEmail);
    } catch (error) {
        throw new functions.https.HttpsError("failed-precondition", "The selected user is not a member of this application.");
    }

    const userDoc = firestore.collection("User").doc(userRecord.uid);

    if (request.promote != true && request.promote != false) {
        throw new functions.https.HttpsError("invalid-argument", "You must choose whether to promote or demote the selected user using true/false.");
    }

    userDoc.update({isAdmin: request.promote});

    return;
})

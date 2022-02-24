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

const errors = {
    invalidUser: new functions.https.HttpsError("failed-precondition", "Invalid argument!", "The selected user is not a member of this application."),
     illegalArgument: {
        userEmail: new functions.https.HttpsError("invalid-argument", "Invalid argument!", "You must choose a user to change permissions for."), 
        permissionLevel: new functions.https.HttpsError("invalid-argument", "Invalid argument!", "You must choose a valid permission level using an integer value 0-2.")
    }, 
    unauthorized: new functions.https.HttpsError("permission-denied", "Unauthorized!", "You do not have the privileges necessary to make this call."), 
    applicationDisabled: new functions.https.HttpsError("failed-precondition", "Unauthorized!", "The application has disabled this action.")
};

/**
 * Adds a new user to Firestore with None as default permissions
 */
exports.addNewUser = functions.https.onCall(async (request, context) => {
    const uid = context.auth.uid;
    const email = context.auth.token.email;
    
    await firestore.collection("User").doc(uid).set({email: email, permissionLevel: permissionLevels.None}, {merge: false});
});

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
 * @throw HttpsError if the user has invalid permissions, 
 *        the application has disabled the desired permissions action, or 
 *        if the provided arguments are invalid
 */
exports.updatePermissions = functions.https.onCall(async (request, context) => {
    if (request.userEmail == undefined || request.userEmail == null) {
        throw errors.illegalArgument.userEmail;
    }

    if (request.newPermissionLevel == undefined || request.newPermissionLevel == null || request.newPermissionLevel < 0 || request.newPermissionLevel > 2) {
        throw errors.illegalArgument.permissionLevel;
    }
    
    const uid = context.auth.uid;
   
    // Obtain the function caller's permission level
    const callerPermissionLevel = await firestore.collection("User").doc(uid).get().then(snapshot => {
        const data = snapshot.data();

        return data.permissionLevel;
    });
    
    // Flags to check in Firestore for legal owner permission change actions
    const flags = await firestore.collection("Flag").get().then(res => {
            return data = res.docs[0].data();
    }); 

    var userRecord = null;

    // Obtain the selected user's information reference in Firestore
    try {
        userRecord = await auth.getUserByEmail(request.userEmail);
    } catch (error) {
        throw errors.invalidUser;
    }

    const userDoc = firestore.collection("User").doc(userRecord.uid);
    const userPermissionLevel = await userDoc.get().then(snapshot => {
        const data = snapshot.data();

        return data.permissionLevel;
    });

    var newLevel = userPermissionLevel;

    // Determine new permissions level
    switch (request.newPermissionLevel) {
        case permissionLevels.Owner:
            if (flags.ownerPromoteFlag) {
                if (callerPermissionLevel != permissionLevels.Owner) {
                    throw errors.unauthorized;
                }

                newLevel = permissionLevels.Owner;
            } else {
                throw errors.applicationDisabled;
            }
  
            break;
        case permissionLevels.Admin:
            if (callerPermissionLevel < permissionLevels.Admin) {
                throw errors.unauthorized;
            }

            newLevel = (userPermissionLevel > permissionLevels.Admin) ? userPermissionLevel : permissionLevels.Admin;

            break;
        case permissionLevels.None:
            if (userPermissionLevel == permissionLevels.Owner) {
                if (!flags.demoteOwner) {
                    throw errors.applicationDisabled;
                }
            }

            if (callerPermissionLevel != permissionLevels.Owner) {
                throw errors.unauthorized;
            }

            newLevel = permissionLevels.None;

            break;
    }

    // Update permissions level
    await userDoc.update({permissionLevel: newLevel});
});

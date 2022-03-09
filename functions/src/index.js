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
 * Called when a user creates an account, makes a new User with None as default permissions
 * https://firebase.google.com/docs/functions/auth-events
 */
exports.createNewUser = functions.auth.user().onCreate((user) => {
    return firestore.collection("User").doc(user.uid).set({email: user.email, permissionLevel: permissionLevels.None})
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
 exports.updatePermissions = functions.runWith({secrets: ["FLAG_OWNER_PROMOTION", "FLAG_OWNER_DEMOTION"]}).https.onCall(async (request, context) => {
    assertValidRequest(context);

    if (request.userEmail == null)
        throw errors.illegalArgument.userEmail;

        if (request.newPermissionLevel == undefined || request.newPermissionLevel == null || request.newPermissionLevel < 0 || request.newPermissionLevel > 2) {
            throw errors.illegalArgument.permissionLevel;
        }
    
    
    // Obtain the function caller's permission level
    const callerPermissionLevel = await getPermissionLevelByUid(context.auth.uid);
    
    // Flags to check in Firestore for legal owner permission change actions
    const flags = {
        ownerPromote: process.env.FLAG_OWNER_PROMOTION,
        ownerDemote: process.env.FLAG_OWNER_DEMOTION
    };

    const flagsRef = await firestore.collection("Flag").get().then(res => res.docs[0].data());

    // Obtain the selected user's information reference in Firestore
    let userRecord = null;
    try {
        userRecord = await auth.getUserByEmail(request.userEmail);
    } catch (error) {
        throw errors.invalidUser;
    }

    const userPermissionLevel = await getPermissionLevelByUid(userRecord.uid);
    
    // Determine new permissions level
    let newLevel = userPermissionLevel;
    switch (request.newPermissionLevel) {
        case permissionLevels.Owner:
            if (flagsRef.get(flags.ownerPromote)) {
                if (callerPermissionLevel !== permissionLevels.Owner) {
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

            if (userPermissionLevel > permissionLevels.Admin) {
                if (flagsRef.get(flags.ownerDemote)) {
                    newLevel = userPermissionLevel;
                } else {
                    throw errors.applicationDisabled;
                }
            } else {
                newLevel = permissionLevels.Admin;
            }

            break;
        case permissionLevels.None:
            if (userPermissionLevel === permissionLevels.Owner) {
                if (!flagsRef.get(flags.ownerDemote)) {
                    throw errors.applicationDisabled;
                }
            }

            if (callerPermissionLevel !== permissionLevels.Owner) {
                throw errors.unauthorized;
            }

            newLevel = permissionLevels.None;

            break;
    }

    // Update permissions level
    await firestore.collection("User").doc(userRecord.uid).update({permissionLevel: newLevel});
});
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { AuthData } from 'firebase-functions/lib/common/providers/https';


admin.initializeApp();

const firestore = admin.firestore();
const auth = admin.auth();

enum PermissionLevel {
    None  = 0,
    Admin = 1,
    Owner = 2
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


function assertValidRequest(context: functions.https.CallableContext): asserts context is (functions.https.CallableContext & { auth: AuthData }) {
    if (context.auth === undefined) {
        functions.logger.log("Unauthorized function request with context: ", context);
        throw errors.unauthorized;
    }
}


async function getPermissionLevelByUid(uid: string): Promise<PermissionLevel>  {
    return (await firestore.collection("User").doc(uid).get()).data()?.permissionLevel;
}


/**
 * Called when a user creates an account, makes a new User with None as default permissions
 * https://firebase.google.com/docs/functions/auth-events
 */
exports.createNewUser = functions.auth.user().onCreate(async (user) => {
    return await firestore.collection("User").doc(user.uid)
        .set({ email: user.email, permissionLevel: PermissionLevel.None })
});


/**
 * Stores submitted survey in Firestore then the recomended jobs.
 */
exports.submitSurvey = functions.https.onCall(async (request, context) => {
    assertValidRequest(context);
});


/**
 * Checks whether the signed in user has administrator priviliges
 * 
 * @param request Parameters sent through function call (unused in this function)
 * @param context Function caller user's authentication information
 * @return whether the signed in user has at least administrator permissions
 */
exports.checkAdmin = functions.https.onCall(async (request, context) => {
    assertValidRequest(context);
    
    const permissionLevel = await getPermissionLevelByUid(context.auth.uid);

    return { isAdmin: permissionLevel != PermissionLevel.None };
});



/**
 * Given function caller's required privileges, a selected user can
 * remove or give another user administrator privileges
 * 
 * @param request Parameters sent through function call:
 * {
 *      userEmail: string,
 *      newPermissionLevel: integer
 * }
 * 
 * @param context Function caller user's authentication information
 * @throw HttpsError if the user has invalid permissions, 
 *        the application has disabled the desired permissions action, or 
 *        if the provided arguments are invalid
 */
exports.updatePermissions = functions.https.onCall(async (request: { userEmail: string, newPermissionLevel: number }, context) => {
    assertValidRequest(context);


    if (request.userEmail == null)
        throw errors.illegalArgument.userEmail;

    if (request.newPermissionLevel == null || !(request.newPermissionLevel in PermissionLevel))
        throw errors.illegalArgument.permissionLevel;
    
    
    // Obtain the function caller's permission level
    const callerPermissionLevel = await getPermissionLevelByUid(context.auth.uid);
    
    // Flags to check in Firestore for legal owner permission change actions
    const flags = await firestore.collection("Flag").get().then(res => res.docs[0].data());

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
        case PermissionLevel.Owner:
            if (flags.ownerPromoteFlag) {
                if (callerPermissionLevel != PermissionLevel.Owner) {
                    throw errors.unauthorized;
                }

                newLevel = PermissionLevel.Owner;
            } else {
                throw errors.applicationDisabled;
            }
  
            break;
        case PermissionLevel.Admin:
            if (callerPermissionLevel < PermissionLevel.Admin) {
                throw errors.unauthorized;
            }

            newLevel = (userPermissionLevel > PermissionLevel.Admin) ? userPermissionLevel : PermissionLevel.Admin;

            break;
        case PermissionLevel.None:
            if (userPermissionLevel == PermissionLevel.Owner) {
                if (!flags.demoteOwner) {
                    throw errors.applicationDisabled;
                }
            }

            if (callerPermissionLevel != PermissionLevel.Owner) {
                throw errors.unauthorized;
            }

            newLevel = PermissionLevel.None;

            break;
    }

    // Update permissions level
    await firestore.collection("User").doc(userRecord.uid).update({permissionLevel: newLevel});
});

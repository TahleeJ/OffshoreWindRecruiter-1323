import * as functions from 'firebase-functions';

import { assertValidRequest, auth, firestore } from './Utility';
import { errors } from './Errors';
import { ApplicationFlags, PermissionLevel } from '../../src/firebase/Types';
import { UserRecord } from 'firebase-admin/auth';


/**
 * Utility function for getting a user's permission level
 *
 * @param uid Uid of the user
 * @returns The user's permission level
 */
async function getPermissionLevelByUid(uid: string): Promise<PermissionLevel> {
    return (await firestore.collection('User').doc(uid).get()).data()?.permissionLevel;
}


/**
 * Called when a user creates an account, makes a new User with None as default permissions
 * https://firebase.google.com/docs/functions/auth-events
 */
export const createNewUser = functions.auth.user().onCreate(async (user) => {
    return await firestore.collection('User').doc(user.uid)
        .set({ email: user.email, permissionLevel: PermissionLevel.None });
});


/**
 * Checks whether the signed in user has administrator privileges
 *
 * @param request Parameters sent through function call (unused in this function)
 * @param context Function caller user's authentication information
 * @return whether the signed in user has at least administrator permissions
 */
export const checkAdmin = functions.https.onCall(async (request, context) => {
    assertValidRequest(context);

    const permissionLevel = await getPermissionLevelByUid(context.auth.uid);

    return { isAdmin: permissionLevel !== PermissionLevel.None };
});


/**
 * Given function caller's required privileges, a selected user can
 * remove or give another user administrator privileges
 *
 * @param request Arguments sent through function call:
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
export const updatePermissions = functions.https.onCall(async (request: { userEmail: string, newPermissionLevel: number }, context) => {
    assertValidRequest(context);

    if (request.userEmail == null)
        throw errors.illegalArgument.userEmail;

    if (request.newPermissionLevel == null || !(request.newPermissionLevel in PermissionLevel))
        throw errors.illegalArgument.permissionLevel;


    // Obtain the function caller's permission level
    const callerPermissionLevel = await getPermissionLevelByUid(context.auth.uid);

    // Flags to check in Firestore for legal owner permission change actions
    const flags = (await firestore.collection('Flag').get()).docs[0]?.data() as ApplicationFlags;

    // Obtain the selected user's information reference in Firestore
    let userRecord = <UserRecord> <unknown> null;
    try {
        userRecord = await auth.getUserByEmail(request.userEmail);
    } catch (error) {
        throw errors.invalidUser;
    }

    const userPermissionLevel = await getPermissionLevelByUid(userRecord.uid);

    if (callerPermissionLevel === PermissionLevel.None || callerPermissionLevel === PermissionLevel.Navigator) {
        throw errors.unauthorized;
    }

    // Determine new permissions level
    let newLevel = userPermissionLevel;
    switch (request.newPermissionLevel) {
    case PermissionLevel.Owner:
        if (flags.promoteToOwner) {
            if (callerPermissionLevel !== PermissionLevel.Owner) {
                throw errors.unauthorized;
            }

            newLevel = PermissionLevel.Owner;
        } else {
            throw errors.applicationDisabled;
        }

        break;
    case PermissionLevel.Admin:
        if (userPermissionLevel > callerPermissionLevel) {
            throw errors.unauthorized;
        }

        if (userPermissionLevel === PermissionLevel.Owner) {
            if (flags.demoteOwner) {
                newLevel = PermissionLevel.Admin;
            } else {
                throw errors.applicationDisabled;
            }
        } else {
            newLevel = PermissionLevel.Admin;
        }

        break;
    case PermissionLevel.Navigator:
        if (userPermissionLevel === PermissionLevel.Owner) {
            if (!flags.demoteOwner) {
                throw errors.applicationDisabled;
            }
        }

        if (userPermissionLevel >= PermissionLevel.Admin && callerPermissionLevel !== PermissionLevel.Owner) {
            throw errors.unauthorized;
        }

        newLevel = PermissionLevel.Navigator;

        break;
    case PermissionLevel.None:
        if (userPermissionLevel === PermissionLevel.Owner) {
            if (!flags.demoteOwner) {
                throw errors.applicationDisabled;
            }
        }

        if (callerPermissionLevel !== PermissionLevel.Owner) {
            throw errors.unauthorized;
        }

        newLevel = PermissionLevel.None;

        break;
    }

    // Update permissions level
    await firestore.collection('User').doc(userRecord.uid).update({ permissionLevel: newLevel });
});

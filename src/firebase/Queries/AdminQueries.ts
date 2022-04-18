import * as firestore from '@firebase/firestore';

import db from '../Firestore';
import { authInstance, updatePermissions } from '../Firebase';
import { id, PermissionLevel } from '../Types';


let currentPermissionLevel: PermissionLevel = PermissionLevel.None;


/**
 * Updates the permission level of a specified user to a desired level
 *
 * @param email the email of the desired user to change permissions for
 * @param newLevel the new level to set the desired user's permissions to
 * @returns a message of success or failure based on the parameters given and
 *          the access control enforcement
 */
export async function setUserPermissionLevel(email: string, newLevel: PermissionLevel): Promise<string> {
    try {
        await updatePermissions({ userEmail: email, newPermissionLevel: newLevel });

        return 'Update success!';
    } catch (error) {
        const details = JSON.parse(JSON.stringify(error)).details;

        return details;
    }
}

/**
 * Retrieves a User object given an UID and returns its data
 *
 * @param id the UID of the desired user
 * @returns a User object, which provides access to the user's email and permissionLevel
 */
export async function getUser(id: id) {
    const response = await firestore.getDoc(firestore.doc(db.Users, id));
    const user = response.data();

    if (user != null && authInstance.currentUser?.uid === id)
        currentPermissionLevel = user.permissionLevel;

    return user;
}

/**
 * Retrieves a the last fetched permission level for the current user
 *
 * @returns the last fetched permission level for the current user
 */
export function getCurrentPermissionLevel() {
    return currentPermissionLevel;
}

import * as firestore from "@firebase/firestore";

import db from "../Firestore";
import { updatePermissions } from "../Firebase";
import { id, PermissionLevel } from "../Types";

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

        return "Update success!"
    } catch (error) {
        const { details } = JSON.parse(JSON.stringify(error));

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

    return response.data();
}

/**
 * Asserts whether a specified user has at least admin-level permissions
 * 
 * @param id the UID of the desired user
 * @returns whether the specified user is an admin or not
 */
export async function assertIsAdmin(id: id): Promise<boolean> {
    return ((await firestore.getDoc(firestore.doc(db.Users, id))).data()?.permissionLevel! > PermissionLevel.None);
}

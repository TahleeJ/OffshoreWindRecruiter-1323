// import * as firestore from "@firebase/firestore";
import { PermissionLevel } from "./Types";
// import db from "./Firestore";
import { updateAdmin } from "./Firebase";

export async function setUserPermissionLevel(email: string, newLevel: number): Promise<string> {
    try {
        await updateAdmin({ userEmail: email, newPermissionLevel: newLevel });

        return "Update success!"
    } catch (error) {
        const { code, details } = JSON.parse(JSON.stringify(error));

        switch (code) {
            case "functions/failed-precondition":
                return "The selected user is not a member of this application."
            case "functions/invalid-argument":
                return "You must choose a user to change permission for and whether to promote or demote them using an integer value 0-2."
            case "functions/permission-denied":
                return "You do not have the privileges necessary to make this call."
            default:
                return "Error updating user permission level"
        }
    }
}
// import * as firestore from "@firebase/firestore";
import { PermissionLevel } from "./Types";
// import db from "./Firestore";
import { updatePermissions } from "./Firebase";

export async function setUserPermissionLevel(email: string, newLevel: number): Promise<string> {
    try {
        const result = await updatePermissions({ userEmail: email, newPermissionLevel: newLevel });

        return "Update success!"
    } catch (error) {
        const { details } = JSON.parse(JSON.stringify(error));

        return details;
    }
}
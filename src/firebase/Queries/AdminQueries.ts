import * as firestore from "@firebase/firestore";

import db from "../Firestore";
import { updatePermissions } from "../Firebase";
import { id, PermissionLevel } from "../Types";



export async function setUserPermissionLevel(email: string, newLevel: PermissionLevel): Promise<string> {
    try {
        await updatePermissions({ userEmail: email, newPermissionLevel: newLevel });

        return "Update success!"
    } catch (error) {
        const { details } = JSON.parse(JSON.stringify(error));

        return details;
    }
}

export async function getUser(id: id) {
    const response = await firestore.getDoc(firestore.doc(db.Users, id));

    return response.data();
}

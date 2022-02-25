import { updatePermissions } from "./Firebase";
import { PermissionLevel } from "./Types";

export async function setUserPermissionLevel(email: string, newLevel: PermissionLevel): Promise<string> {
    try {
        await updatePermissions({ userEmail: email, newPermissionLevel: newLevel });

        return "Update success!"
    } catch (error) {
        const { details } = JSON.parse(JSON.stringify(error));

        return details;
    }
}
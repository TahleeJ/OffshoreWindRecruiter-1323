import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { AuthData } from 'firebase-functions/lib/common/providers/https';
import { errors } from './Errors';


admin.initializeApp();

export const firestore = admin.firestore();
export const auth = admin.auth();


export function assertValidRequest(context: functions.https.CallableContext): asserts context is (functions.https.CallableContext & { auth: AuthData }) {
    if (context.auth === undefined) {
        functions.logger.log("Unauthorized function request with context: ", context);
        throw errors.unauthorized;
    }
}

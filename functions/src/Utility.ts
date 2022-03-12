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


// Add getOrDefault to Map

declare global {
    interface Map<K, V> {
        getOrDefault(key: K, value: V): V;
    }
}

// eslint-disable-next-line no-extend-native
Map.prototype.getOrDefault = function<K, V>(key: K, value: V): V {
    return this.has(key) ? this.get(key) : value
}

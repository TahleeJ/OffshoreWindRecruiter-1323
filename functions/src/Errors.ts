import * as functions from 'firebase-functions';


export const errors = {
    invalidUser: new functions.https.HttpsError("failed-precondition", "Invalid argument!", "The selected user is not a member of this application."),
    illegalArgument: {
        userEmail: new functions.https.HttpsError("invalid-argument", "Invalid argument!", "You must choose a user to change permissions for."),
        permissionLevel: new functions.https.HttpsError("invalid-argument", "Invalid argument!", "You must choose a valid permission level using an integer value 0-2."),
        surveyResponse: new functions.https.HttpsError("invalid-argument", "Invalid argument!", "Submitted survey not in correct format."),
    },
    unauthorized: new functions.https.HttpsError("permission-denied", "Unauthorized!", "You do not have the privileges necessary to make this call."),
    applicationDisabled: new functions.https.HttpsError("failed-precondition", "Unauthorized!", "The application has disabled this action."),
};

const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// Change onCall to onRequest for local emulator if using url parsing
exports.checkAdmin = functions.https.onCall(async (request, context) => {
    const uid = context.auth.uid;
    // const userEmail = request.query.email; // used for local emulator testing
    return await firestore.collection("User").doc(uid).get().then(snapshot => {
        const data = snapshot.data();

        console.log(snapshot.data);

        return { 
            isAdmin: data.isAdmin,
            text: data.dummyData  
        };
    });
});

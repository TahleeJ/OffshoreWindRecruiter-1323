# Firebase Usage

# Setup
## Configuration File
Development with Firebase for this repository will require this Firebase project's configuration keys for app initialization. These keys are hidden inside of the provided `.env` file to be stored in the root directory.

## Node Modules
`npm install --save firebase`  
`npm install --save firebaseui`  
`npm i firebase @9.6.6`  
`npm install dotenv`  

# App API Uage
1. Every source file referencing any Firebase must include the following import before any other Firebase reference:   
`import { firebaseApp } from '../App';`  
  
    **`firebaseApp` is included inside of the root directory, so change `'../App'` to match this location where applicable*

## Authentication
1. Include the following to reference the Firebase authentication library:  
`import * as firebaseAuth from '@firebase/auth';`

2. Include the following to reference this project's Firebase authentication instance:  
`const authInstance = firebaseAuth.getAuth(firebaseApp);`

## Firestore
1. Include the following to reference the Firestore library:  
`import * as firestore from '@firebase/firestore';`

2. Include the following to reference this project's Firestore instance:  
`const firestoreInstance = firestore.getFirestore(firebaseApp);`

## Functions
1. Include the following to reference the Firebase functions library:  
`import * as functions from '@firebase/functions';`

2. Include the following to reference this project's Firebase functions instance:  
`const functionsInstance = functions.getFunctions(firebaseApp);`

3. To reference a function created and deployed from `functions/index.js`, include the following:  
`const <function reference name> = functions.HttpsCallable(functionsInstance, <name of function in index.js>);`

4. To call a function and parse its results, do the following:
    1. `const result = await <function reference name>({[function request parameters]})`
    2. `const usableData: Object = result.data as Object;`




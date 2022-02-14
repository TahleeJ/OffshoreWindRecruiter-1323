# Firebase Usage

# Setup
## Configuration File
Development with Firebase for this repository will require this Firebase project's configuration keys for app initialization. These keys are hidden inside of the provided `.env` file to be stored in the root directory.

## Node Modules
`npm install firebase`
`npm install -g firebase-tools`
`npm install --save firebase`  
`npm i firebase@9.6.6`  
`npm install dotenv`  

# App API Uage
API reference found here: https://firebase.google.com/docs/reference/js  

    ** All firebase references live in the `src/firebase` directory. When using any of these references, please make sure to update the import path accordingly *
## Authentication
1. Include the following to reference the Firebase authentication library:  
`import * as firebaseAuth from '@firebase/auth';`

2. Include the following to reference this project's Firebase authentication instance:  
`import { authInstance } from './firebase/Firebase';`

## Firestore
1. Include the following to reference the Firestore library:  
`import * as firestore from '@firebase/firestore';`

2. Include the following to reference this project's Firestore instance:  
`import { db } from './firebase/Firebase';`

## Functions
1. Include the following to reference the Firebase functions library:  
`import * as functions from '@firebase/functions';`

2. Include the following to reference this project's Firebase functions instance:  
`import { functionsInstance } from './firebase/Firebase';`

3. To reference a function created and deployed from `functions/index.js`, include the following:  
`const <function reference name> = functions.HttpsCallable(functionsInstance, <name of function in index.js>);`

4. To call a function and parse its results, do the following:
    1. `const result = await <function reference name>({[function request parameters]})`
    2. `const usableData: Object = result.data as Object;`
    3. `const dataMap = new Map(Object.entries(usableData));`




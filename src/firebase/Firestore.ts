import { collection, CollectionReference } from "firebase/firestore";

import { firestoreInstance } from "./Firebase";
import { Survey, User } from "./Types";


const table = <T>(collectionPath: string) => collection(firestoreInstance, collectionPath) as CollectionReference<T>;

const db = {
    Users: table<User>('User'),
    Surveys: table<Survey>('Survey')
}


export { db }
export default db
import { collection, CollectionReference } from "firebase/firestore";

import { firestoreInstance } from "./Firebase";
import { Label, Survey, User, JobOpp} from "./Types";


const table = <T>(collectionPath: string) => collection(firestoreInstance, collectionPath) as CollectionReference<T>;

const db = {
    Users: table<User>('User'),
    Surveys: table<Survey>('Survey'),
    Labels: table<Label>("Labels"),
    JobOpps: table<JobOpp>("JobOpps")
}


export { db }
export default db
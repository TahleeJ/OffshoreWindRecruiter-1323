import { collection, CollectionReference } from "firebase/firestore";
import _ from "lodash";

import { firestoreInstance } from "./Firebase";
import { Label, Survey, User, JobOpp} from "./Types";


const table = <T>(collectionPath: string) => collection(firestoreInstance, collectionPath) as CollectionReference<T>;

// Lazy evaluated and memorized, hopefully there is a better way to do this
class db {
    _Users = _.once(() => table<User>('User'));
    public get Users() {
        return this._Users();
    }
    
    _Surveys = _.once(() => table<Survey>('Survey'));
    public get Surveys() {
        return this._Surveys();
    }
    
    _Labels = _.once(() => table<Label>('Labels'));
    public get Labels() {
        return this._Labels();
    }
    
    _JobOpps = _.once(() => table<JobOpp>('JobOpps'));
    public get JobOpps() {
        return this._JobOpps();
    }
}

export default new db();

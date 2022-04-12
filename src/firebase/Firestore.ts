import { collection, CollectionReference } from "firebase/firestore";
import lodash from "lodash";

import { firestoreInstance } from "./Firebase";
import { JobOpp, Label, AdministeredSurveyResponse, SurveyTemplate, User } from "./Types";


const table = <T>(collectionPath: string) => collection(firestoreInstance, collectionPath) as CollectionReference<T>;

// Lazy evaluated and memorized, hopefully there is a better way to do this
class db {
    _Users = lodash.once(() => table<User>('User'));
    public get Users() {
        return this._Users();
    }
    
    _Surveys = lodash.once(() => table<SurveyTemplate>('Survey'));
    public get Surveys() {
        return this._Surveys();
    }
    
    _Labels = lodash.once(() => table<Label>('Labels'));
    public get Labels() {
        return this._Labels();
    }
    
    _JobOpps = lodash.once(() => table<JobOpp>('JobOpps'));
    public get JobOpps() {
        return this._JobOpps();
    }

    _SurveyResponses = lodash.once(() => table<AdministeredSurveyResponse>('SurveyResponse'));
    public get SurveyResponse() {
        return this._SurveyResponses();
    }
}

export default new db();

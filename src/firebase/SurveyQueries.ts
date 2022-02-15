import * as firestore from "@firebase/firestore";
import { Survey } from "./Types";
import db from "./Firestore";

export async function getSurveys(firestoreInstance: firestore.Firestore) {
    const response = await firestore.getDocs(
        firestore.query(
            firestore.collection(firestoreInstance, "Survey")
        )
    )

    const surveys: Survey[] = [];
    response.forEach(d => surveys.push(d.data() as Survey))
    return surveys;
}

export async function getSurvey(title: string) {
    const surveyDoc = firestore.doc(db.Surveys, title);  // Refrence to a specific survey at 'survey/{title}'
    const response = await firestore.getDoc(surveyDoc);
    return (response.data() as Survey);
}

export async function newSurvey(survey: Survey) {
    await firestore.setDoc(firestore.doc(db.Surveys, survey.title), survey);
}

export async function editSurvey(oldTitle: string, survey: Survey) {
    await firestore.updateDoc(firestore.doc(db.Surveys, oldTitle), survey);
}

export async function deleteSurvey(surveyTitle: string) {
    await firestore.deleteDoc(firestore.doc(db.Surveys, surveyTitle));
}
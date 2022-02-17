import * as firestore from "@firebase/firestore";
import { Survey } from "./Types";
import db from "./Firestore";

export async function getSurveys(firestoreInstance: firestore.Firestore) {
    const response = await firestore.getDocs(
        firestore.query(
            firestore.collection(firestoreInstance, "Survey")
        )
    )

    const surveys: (Survey & { id: string })[] = [];
    response.forEach(d => surveys.push({ ...d.data(), id: d.id } as any))
    return surveys;
}

export async function getSurvey(title: string) {
    const surveyDoc = firestore.doc(db.Surveys, title);  // Refrence to a specific survey at 'survey/{title}'
    const response = await firestore.getDoc(surveyDoc);
    return ({ ...response.data(), id: response.id } as Survey);
}

export async function newSurvey(survey: Survey) {
    await firestore.addDoc(db.Surveys, survey);
}

export async function editSurvey(id: string, survey: Survey) {
    await firestore.updateDoc(firestore.doc(db.Surveys, id), survey);
}

export async function deleteSurvey(id: string) {
    await firestore.deleteDoc(firestore.doc(db.Surveys, id));
}
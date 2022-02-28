import * as firestore from "@firebase/firestore";

import db from "../Firestore";
import { id, Survey, hasId } from "../Types";


export async function getSurveys() {
    const response = await firestore.getDocs(db.Surveys);

    return response.docs.map(survey => ({...survey.data(), id: survey.id } as Survey & hasId));
}

export async function getSurvey(id: id) {
    const response = await firestore.getDoc(firestore.doc(db.Surveys, id));
    const data = response.data();

    if (data === undefined)
        throw new Error("Could not find Survey/" + id); // Not sure what to do here

    return { ...data, id: response.id } as Survey & hasId;
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
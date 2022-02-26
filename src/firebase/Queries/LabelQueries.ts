import * as firestore from "firebase/firestore";

import db from "../Firestore";
import { Answer, id, Label, Survey, SurveyQuestion, hasId } from "../Types";
import { getSurveys } from "./SurveyQueries";


export async function getLabels() {
    const response = await firestore.getDocs(db.Labels);

    return response.docs.map(label => ({ ...label.data(), id: label.id } as Label & hasId));
}

export async function getLabel(id: id) {
    const response = await firestore.getDoc(firestore.doc(db.Labels, id));
    const data = response.data();

    if (data === undefined)
        throw new Error("Could not find Label/" + id); // Not sure what to do here

    return { ...data, id: response.id } as Label & hasId;
}

export async function newLabel(label: Label) {
    await firestore.addDoc(db.Labels, label);
}

export async function editLabel(id: string, label: Label) {
    await firestore.updateDoc(firestore.doc(db.Labels, id), label);
}

export async function deleteLabel(id: string) {
    await firestore.deleteDoc(firestore.doc(db.Labels, id));
}


export async function getJobReferencesToLabel(labelID: id) {
    return firestore.getDocs(firestore.query(db.JobOpps, firestore.where("labels", "array-contains", labelID)));
}

/**
 * Returns any answers that are using a label
 * 
 * @param labelID label to search for
 * @returns {Survey: {Question: Answer[]}}
 */
export async function getSurveyReferencesToLabel(labelID: id) {
    const relationMap = new Map<Survey & hasId, Map<SurveyQuestion, Answer[]>>();

    const surveys = await getSurveys();
    surveys.forEach(s => {
        console.log(s)
        const foundQuestions = new Map<SurveyQuestion, Answer[]>();
        s.questions.forEach(q => {
            console.log(q)
            const foundAnswers: Answer[] = []
            q.answers.forEach(o => {
                if (o.labelIds.includes(labelID))
                    foundAnswers.push(o);
            });

            if (foundAnswers.length)
                foundQuestions.set(q, foundAnswers);
        });

        if (foundQuestions.size)
            relationMap.set(s, foundQuestions);
    });

    return relationMap;
}
import * as firestore from "firebase/firestore";

import db from "../Firestore";
import { hasId, id, Label, SurveyTemplate, SurveyAnswer, SurveyQuestion, JobOpp } from "../Types";
import { editJobOpp } from "./JobQueries";
import { editSurvey, getSurveys } from "./SurveyQueries";


export async function getLabels() {
    const response = await firestore.getDocs(db.Labels);

    return response.docs.map(label => ({ ...label.data(), id: label.id } as Label & hasId))
        .sort((a, b) => a.name.localeCompare(b.name));
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

export async function editLabel(id: id, label: Label) {
    await firestore.updateDoc(firestore.doc(db.Labels, id), label);
}

/**
 * Deletes a Label and any references to that Label
 * @param id id of Label to delete
 */
export async function deleteLabel(id: id) {
    try {
        (await getJobReferencesToLabel(id)).forEach(job => {
            job.labelIds = job.labelIds.filter(l => l !== id);
            editJobOpp(job.id, job);
        });
    
        (await getSurveyReferencesToLabel(id)).forEach((question, survey) => {
            question.forEach(answers => {
                answers.forEach(answer => answer.labelIds = answer.labelIds.filter(l => l !== id));
            });
            
            editSurvey(survey.id, survey);
        });
    
        await firestore.deleteDoc(firestore.doc(db.Labels, id));
    } catch (error) {
        // Log error
        throw error;
    }
}


/**
 * Returns any Job Opportunities that are referencing a label 
 * @param labelID label to search for 
 * @returns Sorted array of Jobs that reference the label
 */
export async function getJobReferencesToLabel(labelID: id) {
    return (await firestore.getDocs(firestore.query(db.JobOpps, firestore.where("labelIds", "array-contains", labelID))))
        .docs.map(job => ({ ...job.data(), id: job.id } as JobOpp & hasId))
        .sort((a, b) => a.companyName.localeCompare(b.companyName));
}

/**
 * Returns any answers that are referencing a label 
 * @param labelID label to search for
 * @returns Map of Surveys to a map of Questions to an array of Answers that reference the label
 */
export async function getSurveyReferencesToLabel(labelID: id) {
    const relationMap = new Map<SurveyTemplate & hasId, Map<SurveyQuestion, SurveyAnswer[]>>();

    const surveys = await getSurveys();
    surveys.forEach(s => {
        const foundQuestions = new Map<SurveyQuestion, SurveyAnswer[]>();
        s.questions.forEach(q => {
            const foundAnswers: SurveyAnswer[] = []
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
import * as firestore from 'firebase/firestore';

import db from '../Firestore';
import { hasId, id, Label, SurveyTemplate, SurveyAnswer, SurveyComponent, JobOpp } from '../Types';
import { editJobOpp } from './JobQueries';
import { editSurvey, getSurveys } from './SurveyQueries';


/**
 * Retrieves every label from Firestore and lists them in order based on label name
 *
 * @returns an array of every label in Firestore that's sorted on label name
 */
export async function getLabels() {
    const response = await firestore.getDocs(db.Labels);

    return response.docs.map(label => ({ ...label.data(), id: label.id } as Label & hasId))
        .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Retrieves a specific label from Firestore given a label id
 *
 * @param id the id of the desired label
 * @returns a label object, which contains: name
 */
export async function getLabel(id: id) {
    const response = await firestore.getDoc(firestore.doc(db.Labels, id));
    const data = response.data();

    if (data === undefined)
        throw new Error('Could not find Label/' + id); // Not sure what to do here

    return { ...data, id: response.id } as Label & hasId;
}

/**
 * Adds a new label document to the Labels collection
 *
 * @param label the desired label object to be added in Firestore
 */
export async function newLabel(label: Label) {
    await firestore.addDoc(db.Labels, label);
}

/**
 * Updates a specified label in Firestore
 *
 * @param id the id of the desired label to be updated
 * @param label the updated label object to replace the current label
 */
export async function editLabel(id: id, label: Label) {
    await firestore.updateDoc(firestore.doc(db.Labels, id), label);
}

/**
 * Deletes a Label and any references to that Label
 *
 * @param id id of the Label to delete
 */
export async function deleteLabel(id: id) {
    (await getJobReferencesToLabel(id)).forEach(job => {
        job.labelIds = job.labelIds.filter(l => l !== id);
        editJobOpp(job.id, job);
    });

    (await getSurveyReferencesToLabel(id)).forEach((references, survey) => {
        references.forEach(answers => {
            answers.forEach(answer => {
                answer.labelIds = answer.labelIds.filter(l => l !== id);
            });
        });

        editSurvey(survey.id, survey);
    });

    await firestore.deleteDoc(firestore.doc(db.Labels, id));
}

/**
 * Returns any Job Opportunities that are referencing a Label
 *
 * @param labelID Label to search for
 * @returns Sorted array of Jobs that reference the Label
 */
export async function getJobReferencesToLabel(labelID: id) {
    return (await firestore.getDocs(firestore.query(db.JobOpps, firestore.where('labelIds', 'array-contains', labelID))))
        .docs.map(job => ({ ...job.data(), id: job.id } as JobOpp & hasId))
        .sort((a, b) => a.companyName.localeCompare(b.companyName));
}

/**
 * Returns any answers that are referencing a Label
 *
 * @param labelID Label to search for
 * @returns Map of Surveys to a map of Components to an array of Answers that reference the Label
 */
export async function getSurveyReferencesToLabel(labelID: id) {
    const relationMap = new Map<SurveyTemplate & hasId, Map<SurveyComponent, SurveyAnswer[]>>();

    const surveys = await getSurveys();
    surveys.forEach(s => {
        const foundComponents = new Map<SurveyComponent, SurveyAnswer[]>();
        s.components.forEach(q => {
            const foundAnswers: SurveyAnswer[] = [];
            q.answers.forEach(o => {
                if (o.labelIds.includes(labelID))
                    foundAnswers.push(o);
            });

            if (foundAnswers.length)
                foundComponents.set(q, foundAnswers);
        });

        if (foundComponents.size)
            relationMap.set(s, foundComponents);
    });

    return relationMap;
}

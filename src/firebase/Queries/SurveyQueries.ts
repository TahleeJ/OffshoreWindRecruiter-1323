import * as firestore from '@firebase/firestore';
import { QueryDocumentSnapshot, startAfter } from 'firebase/firestore';

import db from '../Firestore';
import { id, SurveyTemplate, hasId, StoredSurveyResponse } from '../Types';

/**
 * Retrieves every survey from Firestore and lists them in order based on survey title
 *
 * @returns an array of every survey in Firestore that's sorted on survey title
 */
export async function getSurveys() {
    const response = await firestore.getDocs(db.Surveys);

    return response.docs.map(survey => ({ ...survey.data(), id: survey.id } as SurveyTemplate & hasId))
        .sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Retrieves a specific survey from Firestore given a survey id
 *
 * @param id the id of the desired survey
 * @returns a survey object, which contains: description, components array, title
 */
export async function getSurvey(id: id) {
    const response = await firestore.getDoc(firestore.doc(db.Surveys, id));
    const data = response.data();

    if (data === undefined)
        throw new Error('Could not find Survey/' + id); // Not sure what to do here

    return { ...data, id: response.id } as SurveyTemplate & hasId;
}

/**
 * Adds a new survey document to the Survey collection
 *
 * @param survey the desired survey object to be added in Firestore
 */
export async function newSurvey(survey: SurveyTemplate) {
    await firestore.addDoc(db.Surveys, survey);
}

/**
 * Updates a specified survey in Firestore
 *
 * @param id the id of the desired survey to be updated
 * @param survey the updated survey object to replace the current survey
 */
export async function editSurvey(id: id, survey: SurveyTemplate) {
    await firestore.updateDoc(firestore.doc(db.Surveys, id), survey);
}

/**
 * Deletes a specified survey in Firestore
 *
 * @param id the id of the desired survey to be deleted
 */
export async function deleteSurvey(id: id) {
    await firestore.deleteDoc(firestore.doc(db.Surveys, id));
}


let lastSurveyResponse: QueryDocumentSnapshot<StoredSurveyResponse> | null = null;

/**
 * Retrieves the 15 most recent survey responses and lists them in descending order based on created time
 *
 * @returns an array of survey responses
 */
export async function getSurveyResponses() {
    const response = await firestore.getDocs(firestore.query(
        db.SurveyResponse,
        firestore.orderBy('created', 'desc'),
        firestore.limit(15)));

    lastSurveyResponse = response.docs[response.docs.length - 1];
    return response.docs.map(s => ({ ...s.data(), id: s.id } as StoredSurveyResponse & hasId));
}

/**
 * Retrieves the next 15 most recent survey responses
 *
 * @returns an array of survey responses
 */
export async function getNextSurveyResponses() {
    const response = await firestore.getDocs(firestore.query(
        db.SurveyResponse,
        firestore.orderBy('created', 'desc'),
        firestore.limit(15),
        startAfter(lastSurveyResponse)));

    if (response.empty)
        return undefined;

    lastSurveyResponse = response.docs[response.docs.length - 1];
    return response.docs.map(s => ({ ...s.data(), id: s.id } as StoredSurveyResponse & hasId));
}

/**
 * Deletes a specified survey response in Firestore
 *
 * @param id the id of the desired survey response to be deleted
 */
export async function deleteSurveyResponse(id: id) {
    await firestore.deleteDoc(firestore.doc(db.SurveyResponse, id));
}

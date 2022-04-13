import * as firestore from "@firebase/firestore";

import db from "../Firestore";
import { JobOpp, hasId, id } from "../Types";

/**
 * Retrieves every job opp from Firestore and lists them in order based on job name
 * 
 * @returns an array of every job opp in Firestore that's sorted on job name
 */
export async function getJobOpps() {
    const response = await firestore.getDocs(db.JobOpps);

    return response.docs.map(job => ({...job.data(), id: job.id } as JobOpp & hasId))
        .sort((a, b) => a.jobName.localeCompare(b.jobName));
}

/**
 * Retrieves a specific job opp from Firestore given a job id
 * 
 * @param id the id of the desired job
 * @returns a job opp object, which contains: jobName, companyName, labelIds, jobDescription, jobLink
 */
export async function getJobOpp(id: id) {
    const response = await firestore.getDoc(firestore.doc(db.JobOpps, id));
    const data = response.data();

    if (data === undefined)
        throw new Error("Could not find JobOpp/" + id); // Not sure what to do here

    return { ...data, id: response.id } as JobOpp & hasId;
}

/**
 * Adds a new job opp document to the JobOpps collection 
 * 
 * @param jobOpp the desired job opp object to be added in Firestore
 */
export async function newJobOpp(jobOpp: JobOpp) {
    await firestore.addDoc(db.JobOpps, jobOpp);
}

/**
 * Updates a specified job opp in Firestore
 * 
 * @param id the id of the desired job to be updated
 * @param jobOpp the updated job opp object to replace the current job opp
 */
export async function editJobOpp(id: id, jobOpp: JobOpp) {
    await firestore.updateDoc(firestore.doc(db.JobOpps, id), jobOpp);
}

/**
 * Deletes a specified job opp in Firestore
 * 
 * @param id the id of the desired job to be deleted
 */
export async function deleteJobOpp(id: id) {
    await firestore.deleteDoc(firestore.doc(db.JobOpps, id));
}
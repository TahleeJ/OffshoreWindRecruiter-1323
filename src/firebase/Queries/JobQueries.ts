import * as firestore from "@firebase/firestore";

import db from "../Firestore";
import { JobOpp, hasId } from "../Types";


export async function getJobOpps() {
    const response = await firestore.getDocs(db.JobOpps);

    return response.docs.map(job => ({...job.data(), id: job.id } as JobOpp & hasId));
}

export async function getJobOpp(id: string) {
    const response = await firestore.getDoc(firestore.doc(db.JobOpps, id));
    const data = response.data();

    if (data === undefined)
        throw new Error("Could not find JobOpp/" + id); // Not sure what to do here

    return { ...data, id: response.id } as JobOpp & hasId;
}

export async function newJobOpp(jobOpp: JobOpp) {
    await firestore.addDoc(db.JobOpps, jobOpp);
}

export async function editJobOpp(id: string, jobOpp: JobOpp) {
    await firestore.updateDoc(firestore.doc(db.JobOpps, id), jobOpp);
}

export async function deleteJobOpp(id: string) {
    await firestore.deleteDoc(firestore.doc(db.JobOpps, id));
}
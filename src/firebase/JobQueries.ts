import * as firestore from "@firebase/firestore";
import { JobOpp } from "./Types";
import db from "./Firestore";

export async function getJobOpps() {
    const response = await firestore.getDocs(db.JobOpps);

    const jobs: (JobOpp & {id: string})[] = [];
    response.forEach(d => jobs.push({ ...d.data(), id: d.id } as any))
    return jobs;
}

export async function getJobOpp(id: string) {
    const response = await firestore.getDoc(firestore.doc(db.JobOpps, id));
    return ({ ...response.data(), id: response.id } as JobOpp);
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
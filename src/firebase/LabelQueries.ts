import * as firestore from "@firebase/firestore";
import { Label } from "./Types";
import db from "./Firestore";


export async function getLabels() {
    const response = await firestore.getDocs(db.Labels);

    return response.docs.map(label => ({...label.data(), id: label.id }));
}

export async function getLabel(id: string) {
    const response = await firestore.getDoc(firestore.doc(db.Labels, id));
    return ({ ...response.data(), id: response.id } as Label);
}

export async function newLabel(Label: Label) {
    await firestore.addDoc(db.Labels, Label);
}

export async function editLabel(id: string, label: Label) {
    await firestore.updateDoc(firestore.doc(db.Labels, id), label);
}

export async function deleteLabel(id: string) {
    await firestore.deleteDoc(firestore.doc(db.Labels, id));
}
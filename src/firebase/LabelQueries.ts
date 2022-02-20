import * as firestore from "@firebase/firestore";
import { Label, Survey } from "./Types";
import db from "./Firestore";

export async function getLabels() {
    const response = await firestore.getDocs(db.Labels);

    const labels: (Label & {id: string})[] = [];
    response.forEach(d => labels.push({ ...d.data(), id: d.id } as any))
    return labels;
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
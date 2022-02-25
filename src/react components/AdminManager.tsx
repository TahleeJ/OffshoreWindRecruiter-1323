import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { changePage, PageType } from '../redux/navigationSlice';

import * as firestore from "@firebase/firestore";
import { authInstance } from '../firebase/Firebase';
import { PermissionLevel } from '../firebase/Types';
import db from '../firebase/Firestore';
import { setUserPermissionLevel } from '../firebase/AdminQueries';

/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const AdminManager: React.FC<props> = (props) => {
    const [email, setEmail] = useState("");
    const [permissionLevel, setPermission] = useState(PermissionLevel.None);
    const dispatch = useAppDispatch();

    const updateIsAdmin = async () => {
        const uid = authInstance.currentUser?.uid as string;
        const results = await firestore.getDoc(firestore.doc(db.Users, uid));

        setPermission(results.data()?.permissionLevel as PermissionLevel);
    }
    const promote = () => {
        // setUserPermissionLevel(email, 1)
    }
    const demote = () => {
        setUserPermissionLevel(email, PermissionLevel.None)
        dispatch(changePage({type: PageType.AdminHome}))
    }
    useEffect(() => { updateIsAdmin(); }, []);

    return (
        <div id="promoteUser">
            <div className="title">Administrator Authorization</div>
            <div className='textBlock'>Type the email address of the user that you would like to promote/demote to Administrator.
                <br /><br />
                Administrators have full access to the application; They are able to create new surveys, labels, jobs, and administer surveys.</div>
            <div className="inputContainer">
                <div className="userEmail">User Email:</div>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='example@gmail.com'></input>
            </div>
            <div className="buttonContainer">
                <button className="gray" onClick={() => dispatch(changePage({ type: PageType.AdminHome }))}>Go Back</button>
                <button onClick={promote}>Promote</button>
                {
                    permissionLevel === PermissionLevel.Owner ?
                        <button className='red' onClick={demote}>Demote</button>
                        : null
                }
            </div>
        </div>
    );
}

export default AdminManager;
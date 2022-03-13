import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { changePage, PageType } from '../redux/navigationSlice';

import { authInstance } from '../firebase/Firebase';
import { PermissionLevel } from '../firebase/Types';
import { getUser, setUserPermissionLevel } from '../firebase/Queries/AdminQueries';

import Prompt from './Prompt';


/** The props (arguments) to create this element */
interface props {

}

/** The header of the application. */
const AdminManager: React.FC<props> = (props) => {
    const [email, setEmail] = useState("");
    const [permissionLevel, setPermission] = useState(PermissionLevel.None);
    const dispatch = useAppDispatch();
    const [changeLevel, setChangeLevel] = useState("Admin");
    const [errorMessage, setErrorMessage] = useState("");

    const isValid = () => {
        if (!email.trim()) {
            setErrorMessage("*This field is required");
        }
    }

    const updateIsAdmin = async () => {
        const uid = authInstance.currentUser?.uid!;
        const userDoc = await getUser(uid);

        if (userDoc !== undefined)
            setPermission(userDoc.permissionLevel);
    }

    const [popupVisible, setPopupvisible] = useState<Boolean>(false);

    const togglePopup = () => setPopupvisible(!popupVisible);
    const promote = async () => {
        var get;
        if (changeLevel === "Owner") {
            get = await setUserPermissionLevel(email, PermissionLevel.Owner);
        } else if (changeLevel === "Admin") {
            get = await setUserPermissionLevel(email, PermissionLevel.Admin);
        }
        //const get = await setUserPermissionLevel(email, PermissionLevel.Owner);
        if (get !== "Update success!") {
            togglePopup();
        }
        //setUserPermissionLevel(email, 2);
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
                <div className="error">{errorMessage}</div>
            </div>
            <div className = "dropDown">
                <div className = "dropText">Promote to: </div>
                <form>
                <select value = {changeLevel} onChange={(e) => setChangeLevel(e.target.value)}>
                    <option value = "Admin">Admin</option>
                    {
                        permissionLevel === PermissionLevel.Owner ? <option value = "Owner">Owner</option>
                        : null
                    }
                
                </select>
                </form>
            </div>
            <div className="buttonContainer">
                <button className="gray" onClick={() => dispatch(changePage({ type: PageType.AdminHome }))}>Go Back</button>
                <button onClick={isValid}>Promote</button>
                {
                    permissionLevel === PermissionLevel.Owner ?
                        <button className='red' onClick={demote}>Demote</button>
                        : null
                }
                {popupVisible &&
                <Prompt
                    title="Wrong Email Address"
                    message="This email address does not exist. Please check your input."
                    handleCancel={togglePopup}
                />
            }
            </div>
            
        </div>
    );
}

export default AdminManager;

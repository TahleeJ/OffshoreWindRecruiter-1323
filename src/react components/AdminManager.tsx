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
    const [emails, setEmails] = useState("");
    const [permissionLevel, setPermission] = useState(PermissionLevel.None);
    const [updateEmails, setUpdateEmails] = useState([""]);
    const dispatch = useAppDispatch();
    const [changeLevel, setChangeLevel] = useState("Admin");
    const [errorMessage, setErrorMessage] = useState("");
    const [errorText, setErrorText] = useState("")
    const [updateLevel, setUpdateLevel] = useState(PermissionLevel.None);

    const updateIsAdmin = async () => {
        const uid = authInstance.currentUser?.uid!;
        const userDoc = await getUser(uid);

        if (userDoc !== undefined)
            setPermission(userDoc.permissionLevel);
    }

    const [popupVisible, setPopupvisible] = useState<Boolean>(false);

    const togglePopup = () => setPopupvisible(!popupVisible);

    var emailEntry: string;

    function validateEmailEntry() {
        var updateEmailEntries = [];
        if (emails.length > 0) {
            const newUpdateEmails: string[] = emails.split(",");
        
            for (const entry of newUpdateEmails) {
                const adjustedEntry = entry.trim();
                if (adjustedEntry.length < 5) {
                    setUpdateEmails([]);
    
                    return false;
                }
    
                updateEmailEntries.push(adjustedEntry);
            }

            setUpdateEmails(updateEmailEntries);
    
            return true;
        } else {
            return false;
        }
    }

    const setNewUpdateLevel = (newLevel: string) => {
        switch(newLevel) {
            case "Owner":
                setUpdateLevel(PermissionLevel.Owner);
                break;
            case "Admin":
                setUpdateLevel(PermissionLevel.Admin);
                break;
            case "None":
                setUpdateLevel(PermissionLevel.None);
                break;
        }

        setChangeLevel(newLevel);  
    }

    const setEmailEntry = (emails: string) => {
        emailEntry = emails;
        setEmails(emails);
    }

    const update = async () => {
        const validateResult = validateEmailEntry();

        if (validateResult) {
            // var errorEmails = "";
            var errorEmailsMessage = "";
            var invalidEmail = false;
    
            for (const email of updateEmails) {
                const result = await setUserPermissionLevel(email, updateLevel);
    
                if (result !== "Update success!") {
                    invalidEmail = true;
                    // errorEmails = errorEmails + `${email}: ${result}\n`;
                    errorEmailsMessage = errorEmailsMessage + `${email}: ${result}\n`;
                }
            }

            setErrorText(errorEmailsMessage);
            // setErrorMessage(errorEmails);
            togglePopup();
        } else {
            setErrorMessage("Please enter at least one email and separate the rest by commas.");
            togglePopup();
        }    
    }

    useEffect(() => { updateIsAdmin(); }, []);

    return (
        <div id="promoteUser">
            <div className="title">Administrator Authorization</div>
            <div className='textBlock'>
                <div className='textBlock' style={{ fontWeight: "bold" }}>Type the email address(es) of the user(s) that you would like to change permissions for.</div>
                <br /><br />
                <div className='textBlock'>
                Owners have all accesses of administrators as well as full administrative access in changing permission levels.
                <br /><br />
                Administrators have full access to the application: they are able to create new surveys, labels, jobs, administer surveys, and view analytics.
                <br /><br />
                None-level users will only be able to administer surveys.
                </div>
            </div>
            
            <div className="inputContainer">
                <div className="userEmail">User Email(s):</div>
                <input type="text" value={emails} onChange={(e) => setEmailEntry(e.target.value)} placeholder='example@gmail.com'></input>
                <div className="error" style={{ whiteSpace: "pre-wrap", height: "75px", overflow: "auto" }}>{errorText}</div>
            </div>
            <div className = "dropDown">
                <label className='dropText' htmlFor='permission-select'>Update to: </label>
                <select id='permission-select' value={changeLevel} onChange={(e) => setNewUpdateLevel(e.target.value)}>
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                </select>
            </div>
            <div className="buttonContainer">
                <button className="gray" onClick={() => dispatch(changePage({ type: PageType.AdminHome }))}>Go Back</button>
                
                <button onClick={update}>Update</button>
                <button className='red' onClick={update}>Demote to None</button>
                        
                {popupVisible &&
                <Prompt
                    title="Permission Update Error"
                    message="Please make sure you have entered valid email addresses and that your selected users are members of this application."
                    handleCancel={togglePopup}
                />
            }
            </div>
            
        </div>
    );
}

export default AdminManager;

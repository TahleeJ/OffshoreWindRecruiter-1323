import React, { useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { changePage, PageType } from '../redux/navigationSlice';

import { PermissionLevel } from '../firebase/Types';
import { setUserPermissionLevel } from '../firebase/Queries/AdminQueries';

import Prompt from './generic/Prompt';
import TooltipInfo from './TooltipInfo';


const AdminManager: React.FC = () => {
    const [emailsState, setEmailsState] = useState('');
    const [updateEmailsState, setUpdateEmailsState] = useState(['']);
    const dispatch = useAppDispatch();
    const [changeLevelState, setChangeLevelState] = useState('Admin');
    const [errorTextState, setErrorTextState] = useState('');
    const [updateLevelState, setUpdateLevelState] = useState(PermissionLevel.Navigator);

    const [popupVisible, setPopupVisible] = useState<Boolean>(false);
    const togglePopup = () => setPopupVisible(!popupVisible);

    let emails = emailsState;
    let updateEmails = updateEmailsState;
    let updateLevel = updateLevelState;

    function validateEmailEntry() {
        const updateEmailEntries = [];
        if (emails.length > 0) {
            const newUpdateEmails: string[] = emails.split(',');

            for (const entry of newUpdateEmails) {
                const adjustedEntry = entry.trim();
                if (adjustedEntry.length < 5) {
                    updateEmails = [];
                    setUpdateEmailsState([]);

                    return false;
                }

                updateEmailEntries.push(adjustedEntry);
            }

            updateEmails = updateEmailEntries;
            setUpdateEmailsState(updateEmails);

            return true;
        } else {
            return false;
        }
    }

    function setEmails(newEmails: string) {
        emails = newEmails;
        setEmailsState(emails);
    }

    function setNewUpdateLevel(newLevel: string) {
        console.log('hi');
        switch (newLevel) {
        case 'Owner':
            updateLevel = PermissionLevel.Owner;
            break;
        case 'Admin':
            updateLevel = PermissionLevel.Admin;
            break;
        case 'Navigator':
            updateLevel = PermissionLevel.Navigator;
            break;
        case 'None':
            updateLevel = PermissionLevel.None;
            break;
        }

        setUpdateLevelState(updateLevel);
        setChangeLevelState(newLevel);
    }

    const update = async () => {
        const validateResult = validateEmailEntry();
        console.log(updateLevel);

        if (validateResult) {
            let errorEmailsMessage = '';

            for (const email of updateEmails) {
                const result = await setUserPermissionLevel(email, updateLevel);

                if (result !== 'Update success!') {
                    errorEmailsMessage = errorEmailsMessage + `${email}: ${result}\n`;

                    togglePopup();
                } else {
                    errorEmailsMessage = errorEmailsMessage + `${email}: success!\n`;
                }
            }

            setErrorTextState(errorEmailsMessage);
        } else {
            setErrorTextState('Please enter at least one email and separate the rest by commas.');
            togglePopup();
        }
    };

    return (
        <div id="promoteUser" className='container'>
            <div className="title">Administrator Authorization</div>
            <div className='textBlock'>
                <div className='textBlock' style={{ fontWeight: 'bold' }}>Type the email address(es) of the user(s) that you would like to change permissions for.</div>
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
                <div className="userEmail">User Email(s):
                    <div className='infoIcon'>
                        <TooltipInfo textarea="Type the user's email you want to promote/demote"></TooltipInfo>
                    </div>
                </div>
                <input type="text" defaultValue={emailsState} onChange={(e) => setEmails(e.target.value)} placeholder='example@gmail.com'></input>
                <div className="error" style={{ whiteSpace: 'pre-wrap', height: '75px', overflow: 'auto' }}>{errorTextState}</div>
            </div>
            <div className = "dropDown">
                <label className='dropText' htmlFor='permission-select'>Update to: </label>
                <select id='permission-select' value={changeLevelState} onChange={(e) => setNewUpdateLevel(e.target.value)}>
                    <option value="Navigator">Navigator</option>
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
                    message="There was an error updating the permission level of some of your selected users. Please make sure you have entered valid email addresses and that your selected users are members of this application."
                    handleCancel={togglePopup}
                />
                }
            </div>

        </div>
    );
};

export default AdminManager;

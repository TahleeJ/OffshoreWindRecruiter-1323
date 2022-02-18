import React from 'react';
import { authInstance } from "../firebase/Firebase";
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { changePage, OperationType, PageType } from '../redux/navigationSlice';
import ListViewer from './ListViewer';

// import * as firestore from "@firebase/firestore";
// import { useEffect } from 'react';
// import { Survey } from '../firebase/Types';
// import { getSurveys } from '../firebase/SurveyQueries';
// import { useState } from 'react';

interface props {

}

// var firebase = require('firebase');

const Home: React.FC<props> = (props) => {
    const surveys = useAppSelector(s => s.data.surveys);
    const appDispatch = useAppDispatch();
    const user = authInstance.currentUser;

    return (
        <div id="home">
            <h1 id="account">Administer Survey:</h1>
            <p id="userEmail">{user?.email}</p>
            <ListViewer height="calc(100% - 300px)" title='Survey Templates'>
                {
                    surveys.length > 0 ?
                        surveys.map((survey, ind) => {
                            return <div
                                key={ind}
                                className="pointer"
                                onClick={() => {
                                    appDispatch(changePage({
                                        type: PageType.Survey,
                                        operation: OperationType.Administering,
                                        data: survey
                                    }))
                                }}>
                                {survey.title}
                            </div>
                        })
                        : <div>There are no survey templates at the moment</div>
                }
            </ListViewer>
        </div>
    );
}

export default Home;
import React, { useContext } from 'react';
import { AuthContext } from '../App';
import { useAppDispatch } from '../redux/hooks';
import { changeOperation, changePage, OperationType, PageType } from '../redux/navigationSlice';
import ListViewer from './ListViewer';

interface props {

}

const Home: React.FC<props> = (props) => {
    const appDispatch = useAppDispatch();
    const auth = useContext(AuthContext);
    const user = auth.user;
    console.log(user); //this is to figure out what is all on the user type


    return (
        <div id="home">
            <h1 id="account">Account Management</h1>
            <p id="userEmail">{user.attributes.email}</p>
            <ListViewer height="calc(100% - 300px)" title='Survey Templates'>
                <div onClick={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Administering }))}>TEST ITEM (this will be a survey template eventually)</div>
                <div onClick={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Administering }))}>TEST ITEM (this will be a survey template eventually)</div>
                <div onClick={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Administering }))}>TEST ITEM (this will be a survey template eventually)</div>
                <div onClick={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Administering }))}>TEST ITEM (this will be a survey template eventually)</div>
                <div onClick={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Administering }))}>TEST ITEM (this will be a survey template eventually)</div>
                <div onClick={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Administering }))}>TEST ITEM (this will be a survey template eventually)</div>
                <div onClick={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Administering }))}>TEST ITEM (this will be a survey template eventually)</div>
                <div onClick={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Administering }))}>TEST ITEM (this will be a survey template eventually)</div>
                <div onClick={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Administering }))}>TEST ITEM (this will be a survey template eventually)</div>
            </ListViewer>
            <button onClick={() => appDispatch(changeOperation({ operation: OperationType.Creating }))}>TO BE MOVED TO ADMIN DASHBOARD</button>
        </div>
    );
}

export default Home;
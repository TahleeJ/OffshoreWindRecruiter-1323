import React, { useContext } from 'react';
import { AuthContext } from '../App';
import ListViewer from './ListViewer';

interface props {

}

const Home: React.FC<props> = (props) => {
    const auth = useContext(AuthContext);
    const user = auth.user;

    console.log(user); //this is to figure out what is all on the user type

    return (
        <div id="home">
            <h1 id="account">Account Management</h1>
            <p id="userEmail">{user.attributes.email}</p>
            <ListViewer height="calc(100% - 500px)" title='Recent Surveys'>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
                <div>TEST ITEM (WILL BE ADMINISTERED SURVEY LIST EVENTUALLY)</div>
            </ListViewer>
        </div>
    );
}

export default Home;
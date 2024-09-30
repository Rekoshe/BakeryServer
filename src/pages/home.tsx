import React, {JSX} from "react";
import './home.css'
import { User } from "../App";

export default function(props: {HandleLogOut : () => void, User: User}) : JSX.Element {



    return (
        <div className="pageContainer">
            <div className="section">
                <div>{props.User.username}</div>
                <button className="logoutButton" onClick={() => {props.HandleLogOut();}}>Log out</button>
            </div>
            <div className="section" style={{backgroundColor: 'blue'}}>{'Page 2'}</div>
            <div className="section" style={{backgroundColor: 'green'}}>{'Page 3'}</div>
        </div>
    )
}
import React, { useEffect, useState, JSX } from "react";
import frame2 from "./../images/nodejs-logo.svg";
import loading from "./../images/loading.gif";
import "./login.css";
import { Credentials } from "../constants";
import axiosInstance from "../services/axiosInstance";

export default function Login(props: {
    HandleLogIn: (creds: Credentials) => Promise<string>,
    HandleSignUp: (creds: Credentials) => Promise<string>
}): JSX.Element {

    const [formInfo, setFormInfo] = useState<Credentials>({ username: '', password: '' });
    const [emailErrorString, setEmailErrorString] = useState<String>('');
    const [passwordErrorString, setpasswordErrorString] = useState<String>('');
    const [signUpMode, setSignUpMode] = useState<Boolean>(false);
    const [canLogin, setCanLogin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+~\-={}[\]:;"'<>,.?/]{5,}$/;



    function HandleEmailInput(e: React.ChangeEvent<HTMLInputElement>) {
        if (!emailRegex.test(e.target.value)) {
            setEmailErrorString('not a valid Email address');
            setCanLogin(false);
            return;
        }
        setEmailErrorString('');
        setFormInfo({ username: e.target.value, password: formInfo.password });
    }

    function HandlePasswordInput(e: React.ChangeEvent<HTMLInputElement>) {
        if (!passRegex.test(e.target.value)) {
            setpasswordErrorString('passwords must have at least one capital letter, one number and be at least 5 characters long');
            setCanLogin(false);
            return;
        }
        setpasswordErrorString('');
        setFormInfo({ username: formInfo.username, password: e.target.value })
        setCanLogin(true);
    }

    function HandleThirdField(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.value !== formInfo.password) {
            setpasswordErrorString('passwords do not match');
            setCanLogin(false);
            return;
        }
        setpasswordErrorString('');
        setCanLogin(true);
    }

    function HandleLoginButtonClick() {

        props.HandleLogIn(formInfo).then((res) => {

            setEmailErrorString(res);
            setIsLoading(false);
            setCanLogin(true);

        });
        setIsLoading(true);
        setCanLogin(false);
    }

    function HandleSignUpButtonClick() {
        props.HandleSignUp(formInfo).then((res) => {

            setEmailErrorString(res);
            setIsLoading(false);
            setCanLogin(true);

        });
        setIsLoading(true);
        setCanLogin(false);
    }

    return (
        <div className="login">
            <div className="frame-2">
                <div className="frame-4">
                    <img className="frame" alt="Frame" src={frame2} />
                </div>

            </div>
            <img src={loading} hidden={!isLoading}></img>
            <div className="login-comp">
                <form className="div" onSubmit={(event) => { event.preventDefault(); }}>
                    <div className="div-2">
                        <label className="text-wrapper" htmlFor="input-1">
                            Email
                        </label>
                        <input onChange={HandleEmailInput}
                            className="input" id="input-1" placeholder="example@example.com" type="email"
                        />
                        <div hidden={(emailErrorString === '')}>{emailErrorString}</div>
                    </div>
                    <div className="div-2">
                        <label className="text-wrapper" htmlFor="input-2">
                            Password
                        </label>
                        <input onChange={HandlePasswordInput}
                            className="input" id="input-2" placeholder="password" type="password"
                        />
                        <div hidden={(passwordErrorString === '')}>{passwordErrorString}</div>
                    </div>
                    <div className="div-2" hidden={(signUpMode === false)} style={{ display: (signUpMode) ? 'flex' : 'none' }}>
                        <label className="text-wrapper" htmlFor="input-2">
                            Type your password again
                        </label>
                        <input onChange={HandleThirdField}
                            className="input" id="input-2" placeholder="password" type="password"
                        />
                    </div>
                    <button onClick={signUpMode ? HandleSignUpButtonClick : HandleLoginButtonClick} type="submit" className="login-button" disabled={!canLogin}>
                        <div className="text-wrapper-3">{signUpMode ? 'Sign Up' : 'Log In'}</div>
                    </button>
                    <button onClick={() => { setSignUpMode(!signUpMode) }} className="login-button">
                        <div className="text-wrapper-3">{signUpMode ? 'Log in' : 'Sign Up'}</div>
                    </button>
                </form>
            </div>
        </div>
    );
};

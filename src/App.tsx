import { useState, useEffect } from 'react';
import './App.css';
import axiosInstance from './services/axiosInstance';
import axios, { AxiosError } from "axios";
import Login from './pages/Login';
import { Credentials, databaseURI } from './constants';
import Home from './pages/home';



export type User = {
  username : string;
  bio : string;
}



function App() {

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userObject, setUserObject] = useState<User>();

  useEffect(() => {

    if (!isLoggedIn) {
      axiosInstance.post('/login').then(
        (res) => {
          if (res.status === 200) {
            setIsLoggedIn(true);
            setUserObject(res.data as User);
          }
        }
      ).catch((e) => {
        console.log(e);
      });
    }

  }, [isLoggedIn]);





  async function HandleLogIn(creds: Credentials) {
    try {
      const res = await axiosInstance.post('/auth', creds);
      if (res.status === 200) {
        setIsLoggedIn(true);
      }
      return res.data.message;
    } catch (e) {
      const err = e as AxiosError;
      if (err.response) {
        const data = err.response.data as any;
        return data.message;
      }
      return err.message;
    }

  }

  async function HandleSignUp(creds: Credentials) {
    try {
      const res = await axiosInstance.post('/addUser', creds);
      return res.data.message;
    } catch (e) {
      const err = e as AxiosError;
      if (err.response) {
        const data = err.response.data as any;
        return data.message;
      }
      return err.message;
    }

  }

  async function HandleLogOut() {
    const res = await axiosInstance.post('/logout');
    if(res.status === 200){
      setIsLoggedIn(false);
    }
  }

  if (isLoggedIn && userObject) {
    return (
      <Home HandleLogOut={HandleLogOut} User={userObject}></Home>

    );
  } else {
    return (
      <Login HandleLogIn={HandleLogIn} HandleSignUp={HandleSignUp}></Login>

    )
  }

}

export default App;

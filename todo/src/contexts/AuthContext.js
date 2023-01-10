// based on the tutorial from https://usehooks.com/useAuth/

import { createContext, useState } from "react";
// a bug with this hook prevented me from using it 😢
// import { useLocalStorage } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//toast.configure();

let AuthContext = createContext();

// This is what we export from this file
export default AuthContext;

// Provider hook that creates auth object and handles state
export function useProvideAuth() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(
    window.localStorage.getItem("loggedIn")
  );

  // const notify = () => {
  //   toast('registered successfully');
  // }
  async function login(values, form) {
    let apiCall = "http://localhost:4000/auth/login";

    const response = await fetch(apiCall, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json"
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({ username: values.email, password: values.password }) // body data type must match "Content-Type" header
    })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error();
        }
        console.log(response)
        return response.json();
      })
      .then((response) => {
        setLoggedIn(true);
        window.localStorage.setItem("loggedIn", true);
        window.localStorage.setItem("token", response.token);
        window.localStorage.setItem("username", response.data.username);
        window.localStorage.setItem("pfp", response.data.pfp);
        navigate("../");
      })
      .catch((e) => {
        form.setErrors({ email: true, password: "invalid login" });
      });

  }

  async function register(values, form) {
    let apiCall = "http://localhost:4000/register";

    const response = await fetch(apiCall, {
      method: "POST", 
      mode: "cors", 
      cache: "no-cache",
      credentials: "same-origin", 
      headers: {
        "Content-Type": "application/json"
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({ username: values.email, password: values.password }) // body data type must match "Content-Type" header
    })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error();
        }
        console.log(response)
        return response.json();
      })
      .then((response) => {
        //notify;
        navigate("../");
      })
      .catch((e) => {
        form.setErrors({ email: true, password: "can't register!" });
      });
    }
  function logout() {
    window.localStorage.clear("loggedIn");
    setLoggedIn(false);
    console.log(loggedIn);
  }

  return {
    loggedIn,
    login,
    register,
    logout
  };
}

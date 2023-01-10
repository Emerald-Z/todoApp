import { Stack, Title, Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, Fragment } from "react";
import FileUploadComponent from "../components/FileUploadComponent";
import storage from "../components/Firebase/firebase"
import { ref, getDownloadURL } from "firebase/storage";
import '../Account.css';

export default function AccountPage() {
  const navigate = useNavigate(); 

  const navigateHome = () => {
    navigate('/');
  }

  //let token = localStorage.getItem("token");
  let email = localStorage.getItem("username");

  const [pfp, setPfp] = useState("");

  //submit file
  const handleSubmission = (selectedFile) => {
    const formData = new FormData();
    formData.append("demo_image", selectedFile); //set in express.js

    fetch("http://localhost:4000/file/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        setIsShown(false);
        console.log("Success:", result);
        deletePhoto(localStorage.getItem("pfp"));
        window.localStorage.setItem("pfp", result.name);
        downloadImage(result.name);
        updatePfp(result.name);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    
  };

  async function downloadImage(filename) {
    const storageRef = ref(storage, filename);
    const url = await getDownloadURL(storageRef);
    setPfp(url);
  }

  //delete image

  const [isShown, setIsShown] = useState(false);
  const showUpload = event => {
    setIsShown(current => !current);
  }

  //if request.auth != null;
  useEffect(() => {
    downloadImage(localStorage.getItem("pfp"));
  }, [])

  async function updatePfp(pfp) {
    let apiCall = "http://localhost:4000/pfp";
        await fetch(apiCall, {
        method: "PUT",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          //Authorization: `Bearer ${token}`
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({ username: {email}, pfp: pfp})
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error();
          }
          return response.json();
        })
        .catch((e) => {
          console.log(e);
        });
    }

    async function deletePhoto(pfp) {
      let apiCall = "http://localhost:4000/file/delete";
      const response = await fetch(apiCall, {
        method: "DELETE",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          //Authorization: `Bearer ${token}`
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({ file_name: pfp })
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error();
          }
          return response.json();
        })
        .catch((e) => {
          console.log(e);
        });
    }

  return (
    <div id='account_main'>
        <Button onClick={navigateHome}>Home</Button>
        <Title>${email}'s Account</Title>
        <Stack>
          <img src={pfp} alt="pfp" width="300" height="200"></img>
            <h3>username: {window.localStorage.getItem("username")}</h3>
        </Stack>
        <Button onClick={showUpload}>change profile photo</Button>
        {isShown && (
          <FileUploadComponent handleSubmission={handleSubmission}></FileUploadComponent>
        )}
    </div>

  );

}

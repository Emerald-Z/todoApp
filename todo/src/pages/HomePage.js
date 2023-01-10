import { useEffect, useState, Fragment } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import FileUploadComponent from "../components/FileUploadComponent";
import { ref, getDownloadURL } from "firebase/storage";
import storage from "../components/Firebase/firebase"
import '../App.css';

import {
  Group,
  Stack,
  Input,
  Button,
  Checkbox,
  Title
} from "@mantine/core";

export default function HomePage() {
  const navigate = useNavigate();

  let token = localStorage.getItem("token");
  let email = localStorage.getItem("username");


  async function getTasks() {
    let apiCall = `http://localhost:4000/todo/${email}`;
    const response = await fetch(apiCall, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        Authorization: `Bearer ${token}`
      },
      redirect: "follow",
      referrerPolicy: "no-referrer"
    })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error();
        }
        return response.json();
      })
      .then((response) => {
        let getTodo = []; //how do i optimize this
        response.forEach((data) => {
          getTodo.push({ name: data.todo, finished: false, uid: data.uid });
        });
        setTasks(getTodo);
      })
      .catch((e) => {
        console.log("error", e);
      });
  }

  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    // Update the document title using the browser API
    getTasks();
  }, []);

  const navigateAccount = () => {
    navigate('/account');
  }

  // taskName: a string of the name of task that you want to add; setToDo: a function that allows you to edit the taskName
  const [taskName, setTaskName] = useState("");

  async function addTask() {
    let apiCall = "http://localhost:4000/todo/";

    if (taskName === "") {return;}
    var nameArray = tasks.map((todo) => { return todo.name; });
    if (nameArray.includes(taskName)) {return;}
        await fetch(apiCall, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({ email: {email}, todo: taskName })
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error();
          }
          tasks.includes(taskName)
            ? alert("Task already exists")
            : setTasks(tasks.concat({ name: taskName, completed: false }));
          setTaskName("");
          return response.json();
        })
        .catch((e) => {
          console.log(e);
        });
    }


  async function deleteTask(task) {
    let apiCall = "http://localhost:4000/todo/";
    const response = await fetch(apiCall, {
      method: "DELETE",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify({ uid: task.uid })
    })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error();
        } else {
          const newTasks = tasks.filter((obj) => obj.name !== task.name);
          console.log(newTasks);
          setTasks(newTasks);
        }
        console.log(tasks);
        return response.json();
      })
      .catch((e) => {
        console.log(e);
      });
  }

  //overloaded add method
  async function importTask(taskName) {
    let apiCall = "http://localhost:4000/todo/";

    if (taskName === "") {return;}

    var nameArray = tasks.map((todo) => { return todo.name; });
    if (nameArray.includes(taskName)) {
      console.log("duplicate")
      return;
    }

    if (taskName) {
      const response = await fetch(apiCall, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({ email: email, todo: taskName })
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error();
          }
          tasks.includes(taskName)
            ? alert("Task already exists")
            : setTasks(tasks.concat({ name: taskName, completed: false }));
          setTaskName("");
          return response.json();
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  //has to create a new array because original state is a const and can't explicitly modify it
  function updateTask(name) {
    /*const newTasks = */tasks.map((task) => {
      if (name === task.name) {
        task.finished = !task.finished;
        deleteTask(task);
        return; //skip over
      }
      return task;
    });
    //setTasks(newTasks);
  }

  function getSummary() {
    let unfinishedTasks = 0;
    unfinishedTasks = tasks.length;
  
    if (unfinishedTasks === 1) {
      return <Title order={2}>You have 1 unfinished task</Title>;
    } else if (unfinishedTasks >= 1) {
      return (
        <Title order={2}>You have {unfinishedTasks} tasks left to do</Title>
      );
    }
  }

  function exportData() {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(tasks)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${email}todolist.json`;

    link.click();
  }

  const [isShown, setIsShown] = useState(false);
  const showUpload = event => {
    setIsShown(current => !current);
  }

  const handleSubmission = (selectedFile) => {
    const fileReader = new FileReader();

    fileReader.onloadend = ()=>{
      try {
          let todoList = JSON.parse(fileReader.result);
          console.log(todoList);
          todoList.forEach(todo => {
            importTask(todo.name);
          });
          setIsShown(false);
      } catch(e){
         console.error("**Not valid JSON file!**");
      }
    }
    if ( selectedFile!== undefined)
      fileReader.readAsText(selectedFile);
  };

  const [pfp, setPfp] = useState("");
  //probably turn this into a component
  async function downloadImage(filename) {
    const storageRef = ref(storage, filename);
    const url = await getDownloadURL(storageRef);
    setPfp(url);
  }

  useEffect(() => {
    downloadImage(localStorage.getItem("pfp"));
  }, [])

  return (
    <div id="main_div">
    <div>
      <Stack>
        <img src={pfp} alt="pfp" width="300" height="200"></img>
        <Button onClick={navigateAccount}>Account</Button>
      </Stack>
    </div>
    <div>
      <Stack align="center" justify="center" p="xl">
        {getSummary()}
        <Group>
          <Input
            value={taskName}
            placeholder="Type your task here"
            onChange={(event) => setTaskName(event.target.value)}
          ></Input>
          <Button rightIcon={<FaPlus />} onClick={() => addTask()}>
            Add
          </Button>
        </Group>
        {tasks.length < 1 && <></>}
        <Stack>
        {tasks.map((task, index) => (
          <Checkbox
            checked={task.finished}
            key={task.name}
            index={index}
            label={task.name}
            onChange={() => updateTask(task.name)}
          ></Checkbox>
        ))}
      </Stack>
      </Stack>
    </div>
    <div>
      <Stack>
      <Button onClick={showUpload}> Import JSON</Button>
          {isShown && (
            <FileUploadComponent handleSubmission={handleSubmission}></FileUploadComponent>
          )}
        <Button onClick= {exportData}>Export List</Button>
        </Stack>
        </div>
    </div>
  );
}

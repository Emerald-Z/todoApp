// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVMkBacDtvs2xWupRPfQAhsCP1biPrFvM",
  authDomain: "todotpeo.firebaseapp.com",
  projectId: "todotpeo",
  storageBucket: "todotpeo.appspot.com",
  messagingSenderId: "540398062848",
  appId: "1:540398062848:web:fef50768d62e17d173b7e5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export default storage;
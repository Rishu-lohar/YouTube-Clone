// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuhgY5bWuPS3phyekQ3YbTR8OqSr6NsAk",
  authDomain: "fir-bd38a.firebaseapp.com",
  projectId: "fir-bd38a",
  storageBucket: "fir-bd38a.firebasestorage.app",
  messagingSenderId: "18808226734",
  appId: "1:18808226734:web:63fd5af13724ce0c607e3f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth=getAuth(app)
const provider=new GoogleAuthProvider()
export {auth,provider}
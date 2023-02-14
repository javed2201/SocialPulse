// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2bKsqIvuwvB12z4B0ri4mmmsX4DD9ibA",
  authDomain: "linkedin-chatting.firebaseapp.com",
  projectId: "linkedin-chatting",
  storageBucket: "linkedin-chatting.appspot.com",
  messagingSenderId: "511050914929",
  appId: "1:511050914929:web:56efda8d4545414f060fd0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default firebaseConfig
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBcThGAGiomOjVEkiaCHb71iMuwPE9ZvZc",
    authDomain: "project-aira-2d7f3.firebaseapp.com",
    projectId: "project-aira-2d7f3",
    storageBucket: "project-aira-2d7f3.firebasestorage.app",
    messagingSenderId: "260240327920",
    appId: "1:260240327920:web:2f4a6109c56ed761bb2e35",
    measurementId: "G-G996JQV3PT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };

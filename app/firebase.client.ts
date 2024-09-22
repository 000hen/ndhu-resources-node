import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, indexedDBLocalPersistence } from "firebase/auth";

const app = initializeApp({
    apiKey: "AIzaSyDBUkMFDIKSYJEwp5LHkUlbYjpcNRo0kd8",
    authDomain: "auth.umira.moe",
    projectId: "forward-fuze-348810",
    storageBucket: "forward-fuze-348810.appspot.com",
    messagingSenderId: "718744958282",
    appId: "1:718744958282:web:8a9f379de76f716284bdb3",
    measurementId: "G-BV183G1KJZ",
});

const auth = getAuth(app);

// Let Remix handle the persistence via session cookies.
setPersistence(auth, indexedDBLocalPersistence);

export { auth };
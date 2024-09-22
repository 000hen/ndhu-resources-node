import { App, initializeApp, getApps, cert, getApp, ServiceAccount } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";

let app: App;
let auth: Auth;

const googleCert = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!googleCert) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not set.");
}

if (getApps().length === 0) {
    app = initializeApp({
        credential: cert(JSON.parse(googleCert) as ServiceAccount),
    });
    auth = getAuth(app);
} else {
    app = getApp();
    auth = getAuth(app);
}

export { auth };
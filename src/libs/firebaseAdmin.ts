import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
// 1. Construct the credentials using your environment variables
const serviceAccount = {
    // 1. Matches your NEXT_PUBLIC_FIREBASE_PROJECT_ID from the .env file
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,

    // 2. Matches FIREBASE_CLIENT_EMAIL
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,

    // 3. Matches FIREBASE_PRIVATE_KEY
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// 2. Initialize the Admin app safely (prevents double-initialization errors)
const adminApp = !getApps().length
    ? initializeApp({ credential: cert(serviceAccount) })
    : getApp();

// 3. Export the privileged Admin Firestore instance
const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);
export { adminDb,adminAuth, adminApp };

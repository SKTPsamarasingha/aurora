import {beforeEach, describe, expect, it, vi, beforeAll, afterAll} from 'vitest';
import {app, auth, db, googleProvider} from "@/src/libs/firebase"
import {adminDb} from "@/src/libs/firebaseAdmin";
import {deleteDoc} from "firebase/firestore"; // Adjust path to your actual config file


// 1. Mock the entire Firebase SDK before importing your config
vi.mock('firebase/app', () => ({
    initializeApp: vi.fn(() => ({name: 'mocked-app'})),
    getApps: vi.fn(() => []),
    getApp: vi.fn(() => ({name: 'mocked-app'})),
}));

vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(() => ({type: 'firestore'})),
}));

vi.mock('firebase/auth', () => {
    // Define a dummy class to satisfy the "new" constructor keyword
    class MockGoogleAuthProvider {
        providerId = 'google.com';
    }

    return {
        getAuth: vi.fn(() => ({type: 'auth'})),
        GoogleAuthProvider: MockGoogleAuthProvider, // 👈 Passes a valid constructor
    };
});

describe('Firebase Configuration', () => {
    beforeEach(() => {
        // Clear mocks and reset environment variables before each test
        vi.clearAllMocks();
        vi.stubEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'test-api-key');
        vi.stubEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'test-project-id');
    });

    it('should initialize the app and export all required services', async () => {
        // Dynamically import to ensure environment variables are applied correctly
        const {app, auth, db, googleProvider} = await import('../src/libs/firebase');

        // Assertions
        expect(app).toBeDefined();
        expect(auth).toBeDefined();
        expect(db).toBeDefined();
        expect(googleProvider).toBeDefined();
    });

});


describe("Firebase Admin Connection Integration Test", () => {
    const testCollection = adminDb.collection("_connection_test_");
    const testDocRef = testCollection.doc("ping");

    // Optional: Clean up any old test data before running
    beforeAll(async () => {
        await testDocRef.delete();
    });

    // Clean up after test runs to leave the database clean
    afterAll(async () => {
        await deleteDoc(testDocRef);
    });

    it("should successfully connect, write, and read from Firestore", async () => {
        const timestamp = Date.now();

        // 1. Test Write Operation
        // If credentials, network, or permissions are wrong, this will throw an error.
        await expect(
            testDocRef.set({
                status: "online",
                testedAt: timestamp,
            })
        ).resolves.not.toThrow();

        // 2. Test Read Operation
        const docSnapshot = await testDocRef.get();

        expect(docSnapshot.exists).toBe(true);
        expect(docSnapshot.data()).toEqual({
            status: "online",
            testedAt: timestamp,
        });
    });
});
"use client";

import React, {createContext, useContext, useEffect, useState} from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    User as FirebaseUser,
} from "firebase/auth";
import {doc, getDoc, setDoc, serverTimestamp} from "firebase/firestore";
import {auth, db, googleProvider} from "@/src/libs/firebase"; // Adjust import path to your firebase.ts
import {AuthContextType, AuthUser} from "@/src/types/auth";


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        console.log(user)
    }, [user]);

    // Helper to fetch or initialize user profile from Firestore
    const syncUserProfile = async (firebaseUser: FirebaseUser, defaultRole = "customer") => {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        let role = defaultRole;
        let permissions = []
        const authProviders = firebaseUser.providerData.map((p) => p.providerId);
        const displayName = firebaseUser.displayName;


        if (userSnap.exists()) {
            const data = userSnap.data();
            role = data.role || defaultRole;

        } else {
            // If the user document doesn't exist yet (e.g., initial Google sign-in or custom signup)
            const newProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: displayName || "",
                role: defaultRole,
                status: "active",
                authProviders,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            await setDoc(userRef, newProfile, {merge: true});
        }


        if (role) {
            const roleRef = await doc(db, "roles", role)
            const roleSnap = await getDoc(roleRef);
            if (roleSnap.exists()) {
                const roleData = roleSnap.data();
                permissions = roleData.permissions;
            }
        }
        const rawToken = await firebaseUser.getIdToken();


        setToken(rawToken);

        setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName,
            role,
            permissions,
            authProviders,
        });
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    await syncUserProfile(firebaseUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error syncing auth state:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Email & Password Sign In
    const signIn = async (email: string, pass: string) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } finally {
            setLoading(false);
        }
    };

    // Create User (Sign Up) with Email & Password
    const signUp = async (email: string, pass: string, displayName: string) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const firebaseUser = userCredential.user;

            // Update Auth Profile display name
            if (displayName) {
                await updateProfile(firebaseUser, {displayName});
            }

            // Create Firestore user record with default "customer" role
            const userRef = doc(db, "users", firebaseUser.uid);
            const profile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: displayName || "",
                role: "customer",
                status: "active",
                authProviders: firebaseUser.providerData.map((p) => p.providerId),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await setDoc(userRef, profile);
            await syncUserProfile(firebaseUser);
        } finally {
            setLoading(false);
        }
    };

    // Google Authentication
    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await syncUserProfile(result.user);
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{user, token, loading, signIn, signUp, signInWithGoogle, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};


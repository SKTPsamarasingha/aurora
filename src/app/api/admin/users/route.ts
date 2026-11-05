import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/src/libs/firebaseAdmin";

// GET /api/admin/users - Fetch all users
export async function GET(request: NextRequest) {
    try {
        const snapshot = await adminDb.collection("users").get();
        const users = snapshot.docs.map((doc) => ({
            uid: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ success: true, data: users }, { status: 200 });
    } catch (error: any) {
        console.error("GET /api/admin/users error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST /api/admin/users - Securely create user in Firebase Auth & Firestore
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, displayName, role, permissions } = body;

        if (!email || !password || !displayName) {
            return NextResponse.json(
                { success: false, error: "Missing required fields (email, password, displayName)." },
                { status: 400 }
            );
        }

        // 1. Create user in Firebase Authentication securely via Admin SDK
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName,
        });

        const uid = userRecord.uid;

        // 2. Save user profile metadata and permissions in Firestore
        const userData = {
            uid,
            email,
            displayName,
            role: role || "admin",
            permissions: permissions || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await adminDb.collection("users").doc(uid).set(userData);

        return NextResponse.json({ success: true, data: userData }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/admin/users error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/libs/firebaseAdmin"; // Uses privileged Admin Firestore[cite: 7]

// GET /api/admin/roles - Fetch all role documents from the 'roles' collection
export async function GET(request: NextRequest) {
    try {
        const snapshot = await adminDb.collection("roles").get();
        const roles = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ success: true, data: roles }, { status: 200 });
    } catch (error: any) {
        console.error("GET /api/admin/roles error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, permissions } = body;

        if (!name) {
            return NextResponse.json({ success: false, error: "Role name is required." }, { status: 400 });
        }

        const roleKey = name.toLowerCase().replace(/\s+/g, "_");
        const docRef = adminDb.collection("roles").doc(roleKey);

        const newRole = {
            name,
            description: description || "",
            permissions: permissions || [],
            updatedAt: new Date().toISOString(),
        };

        await docRef.set(newRole, { merge: true });
        return NextResponse.json({ success: true, data: newRole }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/admin/roles error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
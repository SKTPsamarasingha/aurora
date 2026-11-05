import {NextRequest, NextResponse} from "next/server";
import {adminDb} from "@/src/libs/firebaseAdmin"; // Uses privileged Admin Firestore[cite: 7]

// GET /api/admin/permissions - Fetch all permission documents from the 'permissions' collection
export async function GET(request: NextRequest) {
    try {
        const snapshot = await adminDb.collection("permissions").get();
        const permissions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({success: true, data: permissions}, {status: 200});
    } catch (error: any) {
        console.error("GET /api/admin/permissions error:", error);
        return NextResponse.json({success: false, error: error.message}, {status: 500});
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, resource, action } = body;

        if (!name || !resource || !action) {
            return NextResponse.json({ success: false, error: "Missing required fields (name, resource, action)." }, { status: 400 });
        }

        const docRef = adminDb.collection("permissions").doc(name);
        const newPerm = {
            name,
            description: description || "",
            resource,
            action,
            updatedAt: new Date().toISOString(),
        };

        await docRef.set(newPerm);
        return NextResponse.json({ success: true, data: newPerm }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
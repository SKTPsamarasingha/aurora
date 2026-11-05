import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/src/libs/firebaseAdmin";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT /api/admin/users/[id] - Update user details, role, or permissions
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { displayName, role, permissions } = body;

        const userDocRef = adminDb.collection("users").doc(id);
        const docSnap = await userDocRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
        }

        const updateData: any = {
            updatedAt: new Date().toISOString(),
        };

        if (displayName !== undefined) updateData.displayName = displayName;
        if (role !== undefined) updateData.role = role;
        if (permissions !== undefined) updateData.permissions = permissions;

        await userDocRef.update(updateData);

        // Optionally sync displayName to Firebase Auth if updated
        if (displayName) {
            await adminAuth.updateUser(id, { displayName });
        }

        return NextResponse.json({ success: true, message: "User updated successfully." }, { status: 200 });
    } catch (error: any) {
        console.error("PUT /api/admin/users/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE /api/admin/users/[id] - Delete user (Blocks Superadmin deletion)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const userDocRef = adminDb.collection("users").doc(id);
        const docSnap = await userDocRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
        }

        const userData = docSnap.data();

        // GUARD: Prevent deletion of Superadmin accounts
        if (userData?.role === "superadmin" || userData?.role === "super_admin") {
            return NextResponse.json(
                { success: false, error: "Security Policy: Superadmin accounts cannot be deleted." },
                { status: 403 }
            );
        }

        // 1. Delete from Firebase Authentication
        await adminAuth.deleteUser(id);

        // 2. Delete from Firestore collection
        await userDocRef.delete();

        return NextResponse.json({ success: true, message: "User deleted successfully." }, { status: 200 });
    } catch (error: any) {
        console.error("DELETE /api/admin/users/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
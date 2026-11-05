import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/libs/firebaseAdmin";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT /api/admin/permissions/[id] - Update permission details
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { description, resource, action } = body;

        const permRef = adminDb.collection("permissions").doc(id);
        const docSnap = await permRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ success: false, error: "Permission not found." }, { status: 404 });
        }

        const updateData: any = {
            updatedAt: new Date().toISOString(),
        };

        if (description !== undefined) updateData.description = description;
        if (resource !== undefined) updateData.resource = resource;
        if (action !== undefined) updateData.action = action;

        await permRef.update(updateData);

        return NextResponse.json({ success: true, message: "Permission updated successfully." }, { status: 200 });
    } catch (error: any) {
        console.error("PUT /api/admin/permissions/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE /api/admin/permissions/[id] - Remove permission from dictionary
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const permRef = adminDb.collection("permissions").doc(id);
        const docSnap = await permRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ success: false, error: "Permission not found." }, { status: 404 });
        }

        await permRef.delete();
        return NextResponse.json({ success: true, message: "Permission deleted successfully." }, { status: 200 });
    } catch (error: any) {
        console.error("DELETE /api/admin/permissions/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
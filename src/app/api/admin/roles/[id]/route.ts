import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/libs/firebaseAdmin";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT /api/admin/roles/[id] - Update role details and permission assignments
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, permissions } = body;

        const roleRef = adminDb.collection("roles").doc(id);
        const docSnap = await roleRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
        }

        const updateData: any = {
            updatedAt: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (permissions !== undefined) updateData.permissions = permissions;

        await roleRef.update(updateData);

        return NextResponse.json({ success: true, message: "Role updated successfully." }, { status: 200 });
    } catch (error: any) {
        console.error("PUT /api/admin/roles/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE /api/admin/roles/[id] - Remove a role document
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Block deletion of primary system roles
        if (["superadmin", "administrator", "customer"].includes(id.toLowerCase())) {
            return NextResponse.json(
                { success: false, error: "Core system roles cannot be deleted." },
                { status: 403 }
            );
        }

        const roleRef = adminDb.collection("roles").doc(id);
        const docSnap = await roleRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
        }

        await roleRef.delete();
        return NextResponse.json({ success: true, message: "Role deleted successfully." }, { status: 200 });
    } catch (error: any) {
        console.error("DELETE /api/admin/roles/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/libs/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// GET single order details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const docRef = doc(db, "orders", params.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(
            { success: true, data: { id: docSnap.id, ...docSnap.data() } },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT / UPDATE order status
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { status } = body;

        const docRef = doc(db, "orders", params.id);
        await updateDoc(docRef, {
            status,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json(
            { success: true, message: "Order status updated successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE order record
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const docRef = doc(db, "orders", params.id);
        await deleteDoc(docRef);

        return NextResponse.json(
            { success: true, message: "Order removed permanently" },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
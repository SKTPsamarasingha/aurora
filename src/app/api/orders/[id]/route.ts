import { NextResponse } from "next/server";
import { db, } from "@/src/libs/firebase";
import {doc, getDoc, deleteDoc, updateDoc} from "firebase/firestore";

import { updateOrderStatusSchema } from "@/src/schemas/validation";
import {parseJwtPayload} from "@/src/utils/helper";


export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // 1. Typed as a Promise for Next.js 15+ compatibility
) {
    try {
        const userId = request.headers.get('x-user-id');


        // 2. Await the params before extracting the id
        const { id: orderId } = await params;

        // 3. Create document reference using Client SDK
        const docRef = doc(db, "orders", orderId);

        // 4. Fetch the document snapshot using getDoc()
        const docSnap = await getDoc(docRef);

        // 5. Check existence using .exists() method
        if (!docSnap.exists()) {
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404 }
            );
        }

        const orderData = docSnap.data();

        // Enforce user isolation: check if order belongs to the user
        if (orderData?.userId !== userId) {
            return NextResponse.json(
                { success: false, error: "Forbidden: Access denied to this order" },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { success: true, data: { id: docSnap.id, ...orderData } }, // 6. Use docSnap.id to get the document ID
            { status: 200 }
        );
    } catch (error: any) {
        console.error("GET /api/orders/[id] error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch order" },
            { status: 500 }
        );
    }
}



export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = request.headers.get('x-user-id');

        const { id: orderId } = await params;
        const body = await request.json();

        // 1. Create a document reference using Client SDK syntax
        const docRef = doc(db, "orders", orderId);

        // 2. Fetch the document snapshot
        const docSnap = await getDoc(docRef);

        // 3. Check existence using .exists() method
        if (!docSnap.exists()) {
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404 }
            );
        }

        const existingOrder = docSnap.data();
        if (existingOrder?.userId !== userId) {
            return NextResponse.json(
                { success: false, error: "Forbidden: Cannot update this order" },
                { status: 403 }
            );
        }

        const validation = updateOrderStatusSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.format() },
                { status: 400 }
            );
        }

        const updateData = {
            ...validation.data,
            updatedAt: new Date().toISOString(),
        };

        // 4. Update the document using updateDoc()
        await updateDoc(docRef, updateData);

        return NextResponse.json(
            {
                success: true,
                data: { id: orderId, ...existingOrder, ...updateData },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("PUT /api/orders/[id] error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to update order" },
            { status: 500 }
        );
    }
}


// DELETE /api/orders/[id] - Remove an order document
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const decodedToken = await parseJwtPayload(request);
        if (!decodedToken) {
            return NextResponse.json(
                { success: false, error: "Unauthorized access" },
                { status: 401 }
            );
        }

        const userId = decodedToken.user_id;
        const { id: orderId } = await params;

        // const docRef = db.collection("orders").doc(orderId);
        const orderRef = await doc(db, "orders",orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404 }
            );
        }

        const existingOrder = orderSnap.data();
        if (existingOrder?.userId !== userId) {
            return NextResponse.json(
                { success: false, error: "Forbidden: Cannot delete this order" },
                { status: 403 }
            );
        }

        await deleteDoc(orderRef);

        return NextResponse.json(
            { success: true, message: "Order successfully deleted" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("DELETE /api/orders/[id] error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to delete order" },
            { status: 500 }
        );
    }
}
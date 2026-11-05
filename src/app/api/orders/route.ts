import { NextResponse } from "next/server";
import { db } from "@/src/libs/firebase"; // Your initialized Client Firestore instance
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import {parseJwtPayload} from "@/src/utils/helper";
import {createOrderSchema} from "@/src/schemas/validation";

// GET /api/orders
export async function GET(request: Request) {
    try {

        const userId = request.headers.get('x-user-id');
        const ordersRef = collection(db, "orders");

        // 1. Removed orderBy from the Firestore query to avoid index requirement
        const q = query(
            ordersRef,
            where("userId", "==", userId)
        );

        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // 2. Sort the array in-memory (descending order)
        orders.sort((a: any, b: any) => {
            // Safely extracts timestamp whether it's a Firestore Timestamp object, JS Date, or string
            const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
            const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();

            return dateB - dateA; // For ascending order, change to: dateA - dateB
        });

        return NextResponse.json({ success: true, data: orders }, { status: 200 });
    } catch (error: any) {
        console.error("GET /api/orders error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch orders" },
            { status: 500 }
        );
    }
}


// POST /api/orders
export async function POST(request: Request) {
    try {

        const userId = request.headers.get('x-user-id');
        const body = await request.json();

        const validation = createOrderSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.format() },
                { status: 400 }
            );
        }

        const orderData = validation.data;
        const now = new Date().toISOString();

        const newOrder = {
            userId,
            ...orderData,
            status: "pending",
            createdAt: now,
            updatedAt: now,
        };

        // Correct modular syntax: addDoc(collection(db, "orders"), newOrder)
        const docRef = await addDoc(collection(db, "orders"), newOrder);

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: docRef.id,
                    ...newOrder,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("POST /api/orders error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to create order" },
            { status: 500 }
        );
    }
}
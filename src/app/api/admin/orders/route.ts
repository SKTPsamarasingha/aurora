import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/libs/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(request: NextRequest) {
    try {
        console.log("hit admin end")

        const ordersRef = collection(db, "orders");
        const snapshot = await getDocs(ordersRef);

        const orders = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
        }));

        orders.sort(
            (a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ success: true, data: orders }, { status: 200 });
    } catch (error: any) {
        console.error("GET /api/admin/orders error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch admin orders" },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/libs/firebaseAdmin";

export async function GET(request: NextRequest) {
    try {
        const [ordersSnap, productsSnap, categoriesSnap, usersSnap] = await Promise.all([
            adminDb.collection("orders").get(),
            adminDb.collection("products").get(),
            adminDb.collection("categories").get(),
            adminDb.collection("users").get(),
        ]);

        const orders = ordersSnap.docs.map((doc) => doc.data());
        const products = productsSnap.docs.map((doc) => doc.data());
        const categories = categoriesSnap.docs.map((doc) => doc.data());
        const users = usersSnap.docs.map((doc) => doc.data());

        // 1. Core Financial & Volume Summary
        let totalRevenue = 0;
        let completedOrders = 0;
        let pendingOrders = 0;

        orders.forEach((o: any) => {
            const amount = Number(o.totalAmount || o.total || 0);
            totalRevenue += amount;
            if (o.status === "completed" || o.status === "fulfilled") {
                completedOrders++;
            } else if (o.status === "pending" || o.status === "processing") {
                pendingOrders++;
            }
        });

        // 2. Inventory Breakdown
        let activeProducts = 0;
        let outOfStockCount = 0;
        let lowStockCount = 0;
        let totalStockUnits = 0;

        products.forEach((p: any) => {
            if (p.isActive) activeProducts++;
            const stock = Number(p.stock || 0);
            totalStockUnits += stock;
            if (stock === 0) outOfStockCount++;
            else if (stock <= 3) lowStockCount++;
        });

        // 3. Category & Taxonomy Distribution
        const categoryMap: Record<string, number> = {};
        products.forEach((p: any) => {
            const catName = p.categoryName || "Unassigned";
            categoryMap[catName] = (categoryMap[catName] || 0) + 1;
        });

        const categoryBreakdown = Object.entries(categoryMap).map(([name, count]) => ({
            name,
            count,
            percentage: products.length > 0 ? Math.round((count / products.length) * 100) : 0,
        }));

        // 4. Client & Role Access Distribution
        const roleMap: Record<string, number> = {};
        users.forEach((u: any) => {
            const role = u.role || "customer";
            roleMap[role] = (roleMap[role] || 0) + 1;
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    summary: {
                        totalRevenue,
                        totalOrders: orders.length,
                        completedOrders,
                        pendingOrders,
                        totalProducts: products.length,
                        activeProducts,
                        totalCategories: categories.length,
                        totalUsers: users.length,
                        outOfStockCount,
                        lowStockCount,
                        totalStockUnits,
                    },
                    categoryBreakdown,
                    roleBreakdown: Object.entries(roleMap).map(([role, count]) => ({ role, count })),
                    recentOrders: orders.slice(0, 5),
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("GET /api/admin/analytics error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
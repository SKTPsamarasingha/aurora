"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/src/context/AuthContext";
import { useApi } from "@/src/context/useApi";
import {
    TrendingUp,
    Package,
    ShoppingBag,
    Users,
    AlertCircle,
    CheckCircle2,
    Clock,
    FolderTree,
} from "lucide-react";

interface AnalyticsData {
    summary: {
        totalRevenue: number;
        totalOrders: number;
        completedOrders: number;
        pendingOrders: number;
        totalProducts: number;
        activeProducts: number;
        totalCategories: number;
        totalUsers: number;
        outOfStockCount: number;
        lowStockCount: number;
        totalStockUnits: number;
    };
    categoryBreakdown: { name: string; count: number; percentage: number }[];
    roleBreakdown: { role: string; count: number }[];
    recentOrders: any[];
}

export default function AdminDashboardPage() {
    const { token, loading: authLoading } = useAuth();
    const api = useApi();

    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [fetching, setFetching] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const pageRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

    const fetchAnalytics = async () => {
        try {
            setFetching(true);
            setError(null);
            const response = await api.get("/admin/analytics");
            setAnalytics(response.data?.data || null);
        } catch (err: any) {
            console.error("Failed to load analytics:", err);
            setError(err?.response?.data?.error || err.message || "Failed to retrieve analytics.");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (authLoading || !token) return;
        fetchAnalytics();
    }, [authLoading, token, api]);

    // GSAP Entrance Animations
    useEffect(() => {
        if (!fetching && cardsRef.current && cardsRef.current.children.length > 0) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    cardsRef.current!.children,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out" }
                );
            }, pageRef);

            return () => ctx.revert();
        }
    }, [fetching, analytics]);

    return (
        <section ref={pageRef} className="w-full text-[#2C2825] font-sans space-y-8">
            {fetching && (
                <div className="py-24 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#2C2825] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-serif text-lg tracking-wide text-[#5C564D] uppercase font-light">
                        Aggregating Atelier Analytics...
                    </p>
                </div>
            )}

            {error && (
                <div className="py-12 text-center border border-red-200 bg-red-50/50 rounded-3xl p-8 max-w-xl mx-auto">
                    <p className="text-red-700 font-serif text-base mb-4">{error}</p>
                    <button
                        onClick={fetchAnalytics}
                        className="px-6 py-2.5 bg-[#2C2825] text-[#F4EFEB] text-xs font-mono tracking-widest rounded-full uppercase"
                    >
                        RETRY CONNECTION
                    </button>
                </div>
            )}

            {!fetching && !error && analytics && (
                <div className="space-y-8">
                    {/* Key Performance Indicator Cards */}
                    <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Revenue Card */}
                        <div className="bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl p-6 shadow-sm backdrop-blur-md space-y-3">
                            <div className="flex items-center justify-between text-[#5C564D]">
                                <span className="text-[10px] font-mono tracking-widest uppercase font-bold">
                                    GROSS REVENUE
                                </span>
                                <div className="p-2 bg-[#2C2825] text-[#F4EFEB] rounded-xl">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <h2 className="font-serif text-3xl font-bold text-[#2C2825]">
                                LKR {analytics.summary.totalRevenue.toLocaleString()}
                            </h2>
                            <p className="text-[10px] font-mono text-[#5C564D] uppercase">
                                Across {analytics.summary.totalOrders} total order dossiers
                            </p>
                        </div>

                        {/* Order Volume Card */}
                        <div className="bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl p-6 shadow-sm backdrop-blur-md space-y-3">
                            <div className="flex items-center justify-between text-[#5C564D]">
                                <span className="text-[10px] font-mono tracking-widest uppercase font-bold">
                                    FULFILLMENT STATUS
                                </span>
                                <div className="p-2 bg-[#2C2825] text-[#F4EFEB] rounded-xl">
                                    <ShoppingBag className="w-4 h-4" />
                                </div>
                            </div>
                            <h2 className="font-serif text-3xl font-bold text-[#2C2825]">
                                {analytics.summary.totalOrders} <span className="text-xs font-mono font-normal">ORDERS</span>
                            </h2>
                            <div className="flex items-center gap-4 text-[10px] font-mono">
                                <span className="flex items-center gap-1 text-emerald-800 font-bold">
                                    <CheckCircle2 className="w-3 h-3" /> {analytics.summary.completedOrders} FULFILLED
                                </span>
                                <span className="flex items-center gap-1 text-amber-800 font-bold">
                                    <Clock className="w-3 h-3" /> {analytics.summary.pendingOrders} PENDING
                                </span>
                            </div>
                        </div>

                        {/* Active Inventory Card */}
                        <div className="bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl p-6 shadow-sm backdrop-blur-md space-y-3">
                            <div className="flex items-center justify-between text-[#5C564D]">
                                <span className="text-[10px] font-mono tracking-widest uppercase font-bold">
                                    ATELIER INVENTORY
                                </span>
                                <div className="p-2 bg-[#2C2825] text-[#F4EFEB] rounded-xl">
                                    <Package className="w-4 h-4" />
                                </div>
                            </div>
                            <h2 className="font-serif text-3xl font-bold text-[#2C2825]">
                                {analytics.summary.totalProducts} <span className="text-xs font-mono font-normal">CREATIONS</span>
                            </h2>
                            <p className="text-[10px] font-mono text-[#5C564D] uppercase">
                                {analytics.summary.totalStockUnits} Total units in stock ({analytics.summary.activeProducts} Live)
                            </p>
                        </div>

                        {/* Personnel & Clients Card */}
                        <div className="bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl p-6 shadow-sm backdrop-blur-md space-y-3">
                            <div className="flex items-center justify-between text-[#5C564D]">
                                <span className="text-[10px] font-mono tracking-widest uppercase font-bold">
                                    REGISTERED CLIENTS
                                </span>
                                <div className="p-2 bg-[#2C2825] text-[#F4EFEB] rounded-xl">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>
                            <h2 className="font-serif text-3xl font-bold text-[#2C2825]">
                                {analytics.summary.totalUsers} <span className="text-xs font-mono font-normal">ACCOUNTS</span>
                            </h2>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-[#5C564D] uppercase">
                                {analytics.roleBreakdown.map((rb) => (
                                    <span key={rb.role} className="bg-[#2C2825]/10 px-2 py-0.5 rounded-full font-bold">
                                        {rb.role}: {rb.count}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Taxonomy & Stock Alerts Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category Distribution */}
                        <div className="bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-[#2C2825]/15 pb-4">
                                <h3 className="font-serif text-xl font-light text-[#2C2825] flex items-center gap-2">
                                    <FolderTree className="w-5 h-5 text-[#5C564D]" />
                                    CATEGORY DISTRIBUTION
                                </h3>
                                <span className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">
                                    {analytics.summary.totalCategories} TAXONOMIES
                                </span>
                            </div>
                            <div className="space-y-3 font-mono text-xs">
                                {analytics.categoryBreakdown.map((cat) => (
                                    <div key={cat.name} className="space-y-1">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="font-bold text-[#2C2825]">{cat.name}</span>
                                            <span className="text-[#5C564D]">
                                                {cat.count} items ({cat.percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-[#F4EFEB] rounded-full overflow-hidden border border-[#2C2825]/10">
                                            <div
                                                className="h-full bg-[#2C2825] transition-all duration-500"
                                                style={{ width: `${cat.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Inventory Health & Stock Warnings */}
                        <div className="bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-[#2C2825]/15 pb-4">
                                <h3 className="font-serif text-xl font-light text-[#2C2825] flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-amber-700" />
                                    INVENTORY HEALTH ALERTS
                                </h3>
                                <span className="text-[10px] font-mono tracking-widest text-amber-800 uppercase font-bold">
                                    STOCK CONTROL
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                                <div className="p-4 bg-red-900/10 border border-red-300 rounded-2xl space-y-1">
                                    <span className="text-[10px] text-red-900 uppercase font-bold block">
                                        OUT OF STOCK
                                    </span>
                                    <span className="font-serif text-2xl font-bold text-red-900">
                                        {analytics.summary.outOfStockCount}
                                    </span>
                                    <span className="text-[9px] text-red-800 block">Immediate restock required</span>
                                </div>

                                <div className="p-4 bg-amber-900/10 border border-amber-300 rounded-2xl space-y-1">
                                    <span className="text-[10px] text-amber-900 uppercase font-bold block">
                                        LOW STOCK (&le; 3 UNITS)
                                    </span>
                                    <span className="font-serif text-2xl font-bold text-amber-900">
                                        {analytics.summary.lowStockCount}
                                    </span>
                                    <span className="text-[9px] text-amber-800 block">Monitor allocation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
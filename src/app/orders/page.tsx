"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useAuth } from "@/src/context/AuthContext";
import { useApi } from "@/src/context/useApi";
import { Order } from "@/src/types/orders";


const STATUS_LOOKUP: Record<string, { label: string; color: string }> = {
    pending: { label: "ATELIER REVIEW", color: "bg-[#C5A880] text-[#2C2825]" },
    crafting: { label: "IN CRAFTING", color: "bg-[#2C2825] text-[#F4EFEB]" },
    quality_check: { label: "QUALITY ASSURANCE", color: "bg-amber-800 text-amber-100" },
    ready_for_dispatch: { label: "READY FOR DISPATCH", color: "bg-emerald-900 text-emerald-100" },
    shipped: { label: "IN TRANSIT", color: "bg-blue-900 text-blue-100" },
    delivered: { label: "ACQUIRED & DELIVERED", color: "bg-emerald-800 text-emerald-100" },
    cancelled: { label: "CANCELLED", color: "bg-red-800 text-red-100" },
};

export default function UserOrdersPage() {
    const { user, token, loading: authLoading } = useAuth();
    const api = useApi();

    const [orders, setOrders] = useState<Order[]>([]);
    const [fetching, setFetching] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const pageRef = useRef<HTMLElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (authLoading || !token) return;

        const fetchOrders = async () => {
            try {
                setFetching(true);
                setError(null);

                const response = await api.get("/orders");
                const orderList: Order[] = response.data?.data || [];
                setOrders(orderList);
            } catch (err: any) {
                console.error("Failed to fetch user orders:", err);
                setError(err?.response?.data?.error || err.message || "Unable to load your acquisitions.");
            } finally {
                setFetching(false);
            }
        };

        fetchOrders();
    }, [authLoading, token, api]);

    // GSAP Entrance Animations
    useEffect(() => {
        if (!fetching && listRef.current && listRef.current.children.length > 0) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    listRef.current!.children,
                    { y: 25, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" }
                );
            }, pageRef);

            return () => ctx.revert();
        }
    }, [fetching, orders]);

    const toggleExpand = (id: string) => {
        setExpandedOrderId((prev) => (prev === id ? null : id));
    };

    return (
        <section
            ref={pageRef}
            className="relative w-full min-h-screen bg-[#F4EFEB] text-[#2C2825] font-sans pt-28 pb-24 px-6 sm:px-10 lg:px-16"
        >
            {/* Background Editorial Grid */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-4 md:grid-cols-6 divide-x divide-[#2C2825]/10 opacity-60">
                <div className="h-full"></div>
                <div className="h-full"></div>
                <div className="h-full"></div>
                <div className="h-full"></div>
                <div className="h-full hidden md:block"></div>
                <div className="h-full hidden md:block"></div>
            </div>

            {/* Page Header */}
            <div className="relative z-10 max-w-7xl mx-auto border-b border-[#2C2825]/20 pb-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-[10px] sm:text-xs tracking-widest text-[#5C564D] uppercase font-medium">
                        CLIENT ARCHIVE
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight uppercase text-[#2C2825]">
                        YOUR ACQUISITIONS
                    </h1>
                </div>
                <Link
                    href="/products"
                    className="text-xs font-mono tracking-widest text-[#5C564D] hover:text-[#2C2825] transition-colors uppercase underline underline-offset-4"
                >
                    EXPLORE NEW CREATIONS &rarr;
                </Link>
            </div>

            {/* State Handling: Fetching Loader & Error */}
            {fetching && (
                <div className="relative z-10 max-w-7xl mx-auto py-24 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#2C2825] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-serif text-lg tracking-wide text-[#5C564D] uppercase font-light">
                        Retrieving Atelier Records...
                    </p>
                </div>
            )}

            {error && (
                <div className="relative z-10 max-w-7xl mx-auto py-12 text-center border border-red-200 bg-red-50/50 rounded-2xl p-8">
                    <p className="text-red-700 font-serif text-lg mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-[#2C2825] text-[#F4EFEB] text-xs tracking-widest rounded-full uppercase"
                    >
                        RETRY
                    </button>
                </div>
            )}

            {/* Orders List Render */}
            {!fetching && !error && (
                <div className="relative z-10 max-w-7xl mx-auto">
                    {orders.length === 0 ? (
                        <div className="bg-[#EAE4DA]/50 border border-[#2C2825]/15 rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6">
                            <h3 className="font-serif text-2xl font-light text-[#2C2825]">
                                NO ACQUISITIONS FOUND
                            </h3>
                            <p className="text-xs font-mono text-[#5C564D] uppercase tracking-wider">
                                Your personal atelier archive is currently empty.
                            </p>
                            <Link
                                href="/products"
                                className="inline-block bg-[#2C2825] text-[#F4EFEB] px-8 py-3.5 rounded-full text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-[#4A433E]"
                            >
                                DISCOVER THE COLLECTION
                            </Link>
                        </div>
                    ) : (
                        <div ref={listRef} className="space-y-6">
                            {orders.map((order) => {
                                const statusConfig =
                                    STATUS_LOOKUP[order.status] || {
                                        label: order.status.toUpperCase(),
                                        color: "bg-[#2C2825] text-[#F4EFEB]",
                                    };

                                const isExpanded = expandedOrderId === order.id;

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl p-6 sm:p-8 transition-all duration-300 backdrop-blur-md hover:border-[#2C2825]/30 shadow-sm"
                                    >
                                        {/* Order Summary Bar */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#2C2825]/10">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="font-mono text-xs font-bold text-[#2C2825]">
                                                        REF: #{order.id}
                                                    </span>
                                                    <span
                                                        className={`text-[9px] font-mono tracking-widest px-3 py-1 rounded-full uppercase font-bold ${statusConfig.color}`}
                                                    >
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-mono text-[#5C564D]">
                                                    PLACED ON: {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-6">
                                                <div className="text-left md:text-right">
                                                    <span className="block text-[10px] font-mono tracking-widest text-[#5C564D] uppercase">
                                                        TOTAL VALUE
                                                    </span>
                                                    <span className="font-mono text-base font-bold text-[#2C2825]">
                                                        {order.currency} {order.subtotal?.toLocaleString()}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => toggleExpand(order.id)}
                                                    className="px-5 py-2.5 border border-[#2C2825]/20 rounded-full text-[10px] font-mono tracking-widest uppercase hover:bg-[#2C2825] hover:text-[#F4EFEB] transition-all duration-300"
                                                >
                                                    {isExpanded ? "HIDE DETAILS" : "VIEW DOSSIER"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Items Preview Strip */}
                                        <div className="pt-6 flex flex-wrap items-center gap-4">
                                            {order.items?.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 bg-[#F4EFEB] border border-[#2C2825]/10 rounded-2xl p-2 pr-4"
                                                >
                                                    <div className="w-12 h-14 rounded-xl overflow-hidden bg-[#EAE4DA] flex-shrink-0">
                                                        <img
                                                            src={item.image || "/ring.jpeg"}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-serif text-sm text-[#2C2825]">
                                                            {item.name}
                                                        </h4>
                                                        <p className="font-mono text-[10px] text-[#5C564D]">
                                                            QTY: {item.quantity} &bull; {order.currency} {item.price?.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Expandable Order Dossier Details */}
                                        {isExpanded && (
                                            <div className="mt-6 pt-6 border-t border-[#2C2825]/10 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                                                {/* Shipping Address */}
                                                <div className="space-y-2">
                                                    <h5 className="font-serif text-sm uppercase tracking-wider text-[#2C2825] font-medium">
                                                        SHIPPING DESTINATION
                                                    </h5>
                                                    <div className="text-xs font-mono text-[#5C564D] space-y-1">
                                                        <p className="text-[#2C2825] font-semibold">
                                                            {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                                        </p>
                                                        <p>{order.shippingAddress?.address}</p>
                                                        <p>
                                                            {order.shippingAddress?.city}{" "}
                                                            {order.shippingAddress?.postalCode ? `(${order.shippingAddress.postalCode})` : ""}
                                                        </p>
                                                        <p>{order.shippingAddress?.country}</p>
                                                        <p>TEL: {order.shippingAddress?.phone}</p>
                                                        <p>EMAIL: {order.shippingAddress?.email}</p>
                                                    </div>
                                                </div>

                                                {/* Notes & Summary Breakdown */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <h5 className="font-serif text-sm uppercase tracking-wider text-[#2C2825] font-medium mb-1">
                                                            ATELIER INSTRUCTIONS
                                                        </h5>
                                                        <p className="text-xs font-mono text-[#5C564D] italic">
                                                            {order.notes || "No special sizing or engraving instructions attached."}
                                                        </p>
                                                    </div>

                                                    <div className="pt-2 border-t border-[#2C2825]/10 space-y-1 text-xs font-mono">
                                                        <div className="flex justify-between text-[#5C564D]">
                                                            <span>INSURED EXPRESS DISPATCH</span>
                                                            <span className="text-[#C5A880]">COMPLIMENTARY</span>
                                                        </div>
                                                        <div className="flex justify-between text-[#5C564D]">
                                                            <span>VALUABLES PACKAGING</span>
                                                            <span>INCLUDED</span>
                                                        </div>
                                                        <div className="flex justify-between font-bold text-[#2C2825] pt-1 border-t border-[#2C2825]/10">
                                                            <span>TOTAL PAID</span>
                                                            <span>{order.currency} {order.subtotal?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
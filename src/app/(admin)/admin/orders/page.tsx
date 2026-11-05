"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useAuth } from "@/src/context/AuthContext";
import { useApi } from "@/src/context/useApi";
import { ShoppingBag, Eye, Edit3, CheckCircle2, Clock, Truck, XCircle, AlertCircle } from "lucide-react";
import AdminHeader from "@/src/components/AdminHeader";

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface ShippingAddress {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
    country: string;
}

interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    subtotal: number;
    currency: string;
    status: "pending" | "crafting" | "quality_check" | "ready_for_dispatch" | "shipped" | "delivered" | "cancelled";
    notes?: string;
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "ATELIER REVIEW", color: "bg-[#C5A880]/20 text-[#2C2825] border-[#C5A880]", icon: <Clock className="w-3.5 h-3.5" /> },
    crafting: { label: "IN CRAFTING", color: "bg-[#2C2825] text-[#F4EFEB]", icon: <Edit3 className="w-3.5 h-3.5" /> },
    quality_check: { label: "QUALITY CHECK", color: "bg-amber-900/20 text-amber-900 border-amber-300", icon: <AlertCircle className="w-3.5 h-3.5" /> },
    ready_for_dispatch: { label: "READY FOR DISPATCH", color: "bg-emerald-900/20 text-emerald-900 border-emerald-300", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    shipped: { label: "IN TRANSIT", color: "bg-blue-900/20 text-blue-900 border-blue-300", icon: <Truck className="w-3.5 h-3.5" /> },
    delivered: { label: "DELIVERED", color: "bg-emerald-800 text-emerald-100", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    cancelled: { label: "CANCELLED", color: "bg-red-900/20 text-red-900 border-red-300", icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function AdminOrdersPage() {
    const { token, loading: authLoading } = useAuth();
    const api = useApi();

    const [orders, setOrders] = useState<Order[]>([]);
    const [fetching, setFetching] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

    const pageRef = useRef<HTMLElement>(null);
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);

    const fetchAdminOrders = async () => {
        try {
            setFetching(true);
            setError(null);

            // Fetching from admin orders route (adjust path if your admin route is /api/admin/orders)
            const response = await api.get("/admin/orders");
            const orderList: Order[] = response.data?.data || [];
            setOrders(orderList);
        } catch (err: any) {
            console.error("Failed to fetch admin orders:", err);
            setError(err?.response?.data?.error || err.message || "Unable to load atelier order management records.");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (authLoading || !token) return;
        fetchAdminOrders();
    }, [authLoading, token, api]);

    // GSAP Entrance Animation
    useEffect(() => {
        if (!fetching && tableBodyRef.current && tableBodyRef.current.children.length > 0) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    tableBodyRef.current!.children,
                    { y: 15, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: "power3.out" }
                );
            }, pageRef);

            return () => ctx.revert();
        }
    }, [fetching, orders]);

    const handleUpdateStatus = async (orderId: string, newStatus: Order["status"]) => {
        try {
            setIsUpdatingStatus(orderId);
            await api.put(`/orders/${orderId}`, { status: newStatus });

            // Update local state instantly
            setOrders((prev) =>
                prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
            );
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
            }
        } catch (err: any) {
            console.error("Failed to update order status:", err);
            alert(err?.response?.data?.error || "Failed to update order status.");
        } finally {
            setIsUpdatingStatus(null);
        }
    };

    return (
        <section
            ref={pageRef}
            className="w-full min-h-screen  font-sans  sm:p-10 lg:p-12"
        >

            {/* Fetching & Error States */}
            {fetching && (
                <div className="py-24 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#2C2825] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-serif text-lg tracking-wide text-[#5C564D] uppercase font-light">
                        Retrieving All Client Acquisitions...
                    </p>
                </div>
            )}

            {error && (
                <div className="py-12 text-center border border-red-200 bg-red-50/50 rounded-3xl p-8 max-w-xl mx-auto">
                    <p className="text-red-700 font-serif text-base mb-4">{error}</p>
                    <button
                        onClick={fetchAdminOrders}
                        className="px-6 py-2.5 bg-[#2C2825] text-[#F4EFEB] text-xs font-mono tracking-widest rounded-full uppercase"
                    >
                        RETRY CONNECTION
                    </button>
                </div>
            )}

            {/* Orders Table */}
            {!fetching && !error && (
                <div>
                    {orders.length === 0 ? (
                        <div className="bg-[#EAE4DA]/50 border border-[#2C2825]/15 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-4">
                            <ShoppingBag className="w-12 h-12 mx-auto text-[#5C564D]" />
                            <h3 className="font-serif text-2xl font-light text-[#2C2825]">
                                NO ORDERS RECORDED
                            </h3>
                            <p className="text-xs font-mono text-[#5C564D] uppercase tracking-wider">
                                No client orders have been placed in the database yet.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl shadow-sm backdrop-blur-md">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="border-b border-[#2C2825]/15 text-[10px] font-mono tracking-widest text-[#5C564D] uppercase">
                                    <th className="py-5 px-6 font-medium">ORDER REF</th>
                                    <th className="py-5 px-6 font-medium">CLIENT</th>
                                    <th className="py-5 px-6 font-medium">DATE</th>
                                    <th className="py-5 px-6 font-medium">STATUS</th>
                                    <th className="py-5 px-6 font-medium">PIECES</th>
                                    <th className="py-5 px-6 font-medium text-right">TOTAL</th>
                                    <th className="py-5 px-6 font-medium text-center">ACTION</th>
                                </tr>
                                </thead>
                                <tbody ref={tableBodyRef} className="divide-y divide-[#2C2825]/10 text-xs font-mono">
                                {orders.map((order) => {
                                    const statusInfo = STATUS_CONFIG[order.status] || {
                                        label: order.status.toUpperCase(),
                                        color: "bg-[#2C2825] text-[#F4EFEB]",
                                        icon: <Clock className="w-3.5 h-3.5" />,
                                    };

                                    return (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-[#2C2825]/5 transition-colors duration-200"
                                        >
                                            <td className="py-4 px-6 font-bold text-[#2C2825]">
                                                #{order.id.slice(0, 8)}...
                                            </td>
                                            <td className="py-4 px-6 text-[#2C2825]">
                                                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                            </td>
                                            <td className="py-4 px-6 text-[#5C564D]">
                                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="py-4 px-6">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 text-[9px] tracking-widest px-3 py-1 rounded-full uppercase font-bold border ${statusInfo.color}`}
                                                    >
                                                        {statusInfo.icon}
                                                        {statusInfo.label}
                                                    </span>
                                            </td>
                                            <td className="py-4 px-6 text-[#2C2825]">
                                                {order.items?.length || 0} PCS
                                            </td>
                                            <td className="py-4 px-6 text-right font-bold text-[#2C2825]">
                                                {order.currency} {order.subtotal?.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2C2825] text-[#F4EFEB] hover:bg-[#4A433E] rounded-full text-[9px] font-mono tracking-widest uppercase transition-all duration-200 shadow-sm"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    MANAGE
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Order Management Modal Drawer */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div
                        className="bg-[#F4EFEB] border border-[#2C2825]/20 max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl text-[#2C2825] space-y-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-[#2C2825]/15 pb-4">
                            <div>
                                <span className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">
                                    ATELIER DOSSIER
                                </span>
                                <h3 className="font-serif text-2xl font-light text-[#2C2825]">
                                    ORDER #{selectedOrder.id}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-8 h-8 rounded-full bg-[#2C2825]/10 hover:bg-[#2C2825] hover:text-[#F4EFEB] flex items-center justify-center transition-colors text-xs font-mono"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Status Management Bar */}
                        <div className="bg-[#EAE4DA] p-4 rounded-2xl border border-[#2C2825]/15 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <span className="block text-[9px] font-mono tracking-widest text-[#5C564D] uppercase">
                                    UPDATE FULFILLMENT STATUS
                                </span>
                                <span className="font-mono text-xs font-bold text-[#2C2825] uppercase">
                                    CURRENT: {selectedOrder.status}
                                </span>
                            </div>
                            <select
                                disabled={isUpdatingStatus === selectedOrder.id}
                                value={selectedOrder.status}
                                onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as Order["status"])}
                                className="bg-[#F4EFEB] border border-[#2C2825]/20 rounded-xl px-4 py-2 text-xs font-mono uppercase focus:outline-none focus:border-[#2C2825]"
                            >
                                <option value="pending">ATELIER REVIEW</option>
                                <option value="crafting">IN CRAFTING</option>
                                <option value="quality_check">QUALITY CHECK</option>
                                <option value="ready_for_dispatch">READY FOR DISPATCH</option>
                                <option value="shipped">IN TRANSIT (SHIPPED)</option>
                                <option value="delivered">DELIVERED</option>
                                <option value="cancelled">CANCELLED</option>
                            </select>
                        </div>

                        {/* Items & Shipping Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Items List */}
                            <div className="space-y-3">
                                <h4 className="font-serif text-sm uppercase tracking-wider text-[#2C2825] font-medium border-b border-[#2C2825]/10 pb-2">
                                    ACQUIRED PIECES ({selectedOrder.items?.length})
                                </h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-[#EAE4DA]/60 p-2.5 rounded-xl border border-[#2C2825]/10">
                                            <div className="w-10 h-12 rounded-lg overflow-hidden bg-[#F4EFEB] flex-shrink-0">
                                                <img src={item.image || "/ring.jpeg"} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h6 className="font-serif text-xs text-[#2C2825] truncate">{item.name}</h6>
                                                <p className="font-mono text-[10px] text-[#5C564D]">QTY: {item.quantity}</p>
                                            </div>
                                            <div className="font-mono text-xs font-bold text-[#2C2825]">
                                                {selectedOrder.currency} {(item.price * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Client & Destination Info */}
                            <div className="space-y-4">
                                <h4 className="font-serif text-sm uppercase tracking-wider text-[#2C2825] font-medium border-b border-[#2C2825]/10 pb-2">
                                    CLIENT & DESTINATION
                                </h4>
                                <div className="text-xs font-mono text-[#5C564D] space-y-1 bg-[#EAE4DA]/60 p-4 rounded-2xl border border-[#2C2825]/10">
                                    <p className="text-[#2C2825] font-bold text-sm">
                                        {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}
                                    </p>
                                    <p>{selectedOrder.shippingAddress?.address}</p>
                                    <p>
                                        {selectedOrder.shippingAddress?.city}{" "}
                                        {selectedOrder.shippingAddress?.postalCode ? `(${selectedOrder.shippingAddress.postalCode})` : ""}
                                    </p>
                                    <p>{selectedOrder.shippingAddress?.country}</p>
                                    <p className="pt-2">EMAIL: {selectedOrder.shippingAddress?.email}</p>
                                    <p>TEL: {selectedOrder.shippingAddress?.phone}</p>
                                </div>

                                {selectedOrder.notes && (
                                    <div>
                                        <span className="block text-[9px] font-mono tracking-widest text-[#5C564D] uppercase mb-1">
                                            ATELIER NOTES
                                        </span>
                                        <p className="text-xs font-mono italic bg-[#EAE4DA]/40 p-3 rounded-xl border border-[#2C2825]/10">
                                            "{selectedOrder.notes}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-[#2C2825]/15">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-8 py-3 rounded-full bg-[#2C2825] text-[#F4EFEB] hover:bg-[#4A433E] text-xs font-mono tracking-widest uppercase transition-all shadow-sm"
                            >
                                CLOSE DOSSIER
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
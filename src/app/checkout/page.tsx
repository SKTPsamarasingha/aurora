"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import { useApi } from "@/src/context/useApi";

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, cartTotal, totalItems, clearCart } = useCart();
    const { user } = useAuth();
    const api = useApi();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: user?.displayName?.split(" ")[0] || "",
        lastName: user?.displayName?.split(" ").slice(1).join(" ") || "",
        email: user?.email || "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: "Sri Lanka",
        notes: "",
    });

    const pageRef = useRef<HTMLElement>(null);
    const successRef = useRef<HTMLDivElement>(null);



    // Entrance Animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".checkout-animate",
                { y: 25, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
            );
        }, pageRef);

        return () => ctx.revert();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return;

        try {
            setIsSubmitting(true);
            setErrorMessage(null);

            // Construct payload matching createOrderSchema
            const orderPayload = {
                items: cart.map((item) => ({
                    productId: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    image: item.product.images[0] || "/ring.jpeg",
                })),
                shippingAddress: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    country: formData.country,
                },
                subtotal: cartTotal,
                currency: "LKR",
                notes: formData.notes,
            };

            // Post order to /orders endpoint
            const response = await api.post("/orders", orderPayload);

            if (response.data?.success) {
                const createdOrder = response.data.data;
                setOrderId(createdOrder.id);
                setOrderComplete(true);
                clearCart();

                setTimeout(() => {
                    if (successRef.current) {
                        gsap.fromTo(
                            successRef.current,
                            { scale: 0.95, opacity: 0 },
                            { scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" }
                        );
                    }
                }, 50);
            } else {
                throw new Error(response.data?.error || "Failed to create order.");
            }
        } catch (error: any) {
            console.error("Order submission failed:", error);
            setErrorMessage(
                typeof error.response?.data?.error === "string"
                    ? error.response.data.error
                    : error.message || "Failed to place your order. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderComplete) {
        return (
            <section className="relative w-full min-h-screen bg-[#F4EFEB] text-[#2C2825] font-sans pt-32 pb-24 px-6 sm:px-10 flex items-center justify-center">
                <div
                    ref={successRef}
                    className="relative z-10 max-w-2xl w-full bg-[#EAE4DA]/80 border border-[#2C2825]/20 rounded-3xl p-8 sm:p-12 text-center shadow-xl backdrop-blur-md space-y-6"
                >
                    {/*<div className="w-16 h-16 mx-auto rounded-full bg-[#2C2825] text-[#F4EFEB] flex items-center justify-center">*/}
                    {/*    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                    {/*        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12.75l6 6 9-13.5" />*/}
                    {/*    </svg>*/}
                    {/*</div>*/}

                    <div className="space-y-2">
                        <span className="text-xs tracking-widest text-[#C5A880] uppercase font-mono">
                            ACQUISITION CONFIRMED
                        </span>
                        <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-[#2C2825]">
                            THANK YOU FOR YOUR ORDER
                        </h1>
                        <p className="text-xs font-mono tracking-widest text-[#5C564D] uppercase">
                            ORDER REFERENCE: <span className="text-[#2C2825] font-bold">{orderId}</span>
                        </p>
                    </div>

                    <p className="text-sm text-[#5C564D] leading-relaxed font-light max-w-lg mx-auto">
                        Your bespoke creation has entered our atelier queue. A formal confirmation and tracking dossier have been dispatched to <span className="font-medium text-[#2C2825]">{formData.email}</span>.
                    </p>

                    <div className="pt-6 border-t border-[#2C2825]/10">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-3 bg-[#2C2825] text-[#F4EFEB] px-8 py-3.5 rounded-full text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-[#4A433E]"
                        >
                            RETURN TO COLLECTION
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={pageRef}
            className="relative w-full min-h-screen bg-[#F4EFEB] text-[#2C2825] font-sans pt-28 pb-24 px-6 sm:px-10 lg:px-16"
        >
            {/* Header */}
            <div className="checkout-animate relative z-10 max-w-7xl mx-auto border-b border-[#2C2825]/20 pb-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-[10px] sm:text-xs tracking-widest text-[#5C564D] uppercase font-medium">
                        AURORA MAISON
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight uppercase text-[#2C2825]">
                        BESPOKE CHECKOUT
                    </h1>
                </div>
                <Link
                    href="/products"
                    className="text-xs font-mono tracking-widest text-[#5C564D] hover:text-[#2C2825] transition-colors uppercase underline underline-offset-4"
                >
                    &larr; BACK TO CREATIONS
                </Link>
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
                <div className="checkout-animate max-w-7xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-xs font-mono uppercase tracking-wider">
                    {errorMessage}
                </div>
            )}

            <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Shipping Form */}
                <form onSubmit={handleSubmitOrder} className="checkout-animate lg:col-span-7 space-y-10">
                    {/* 1. Client Contact Details */}
                    <div className="space-y-4">
                        <h2 className="font-serif text-xl uppercase tracking-wide border-b border-[#2C2825]/10 pb-2">
                            01. CLIENT CONTACT
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest uppercase text-[#5C564D] mb-1">
                                    FIRST NAME *
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full bg-[#EAE4DA]/50 border border-[#2C2825]/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2C2825]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest uppercase text-[#5C564D] mb-1">
                                    LAST NAME *
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full bg-[#EAE4DA]/50 border border-[#2C2825]/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2C2825]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest uppercase text-[#5C564D] mb-1">
                                    EMAIL ADDRESS *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-[#EAE4DA]/50 border border-[#2C2825]/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2C2825]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest uppercase text-[#5C564D] mb-1">
                                    PHONE NUMBER *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    placeholder="+94 77 123 4567"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-[#EAE4DA]/50 border border-[#2C2825]/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2C2825]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Delivery Address */}
                    <div className="space-y-4">
                        <h2 className="font-serif text-xl uppercase tracking-wide border-b border-[#2C2825]/10 pb-2">
                            02. SHIPPING DESTINATION
                        </h2>
                        <div>
                            <label className="block text-[10px] font-mono tracking-widest uppercase text-[#5C564D] mb-1">
                                STREET ADDRESS *
                            </label>
                            <input
                                type="text"
                                name="address"
                                required
                                placeholder="123 Galle Road, Suite 4"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full bg-[#EAE4DA]/50 border border-[#2C2825]/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2C2825]"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest uppercase text-[#5C564D] mb-1">
                                    CITY *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full bg-[#EAE4DA]/50 border border-[#2C2825]/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2C2825]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest uppercase text-[#5C564D] mb-1">
                                    POSTAL CODE
                                </label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    className="w-full bg-[#EAE4DA]/50 border border-[#2C2825]/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2C2825]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest uppercase text-[#5C564D] mb-1">
                                    COUNTRY
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full bg-[#EAE4DA]/50 border border-[#2C2825]/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2C2825]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-mono tracking-widest uppercase text-[#5C564D] mb-1">
                                ATELIER NOTES / SPECIAL INSTRUCTIONS
                            </label>
                            <textarea
                                name="notes"
                                rows={2}
                                placeholder="Custom ring sizing, gift messaging, or delivery preferences..."
                                value={formData.notes}
                                onChange={handleChange}
                                className="w-full bg-[#EAE4DA]/50 border border-[#2C2825]/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2C2825]"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || cart.length === 0}
                        className="w-full bg-[#2C2825] text-[#F4EFEB] py-4 rounded-full text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-[#4A433E] disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
                    >
                        {isSubmitting ? "PROCESSING ACQUISITION..." : `CONFIRM ACQUISITION • LKR ${cartTotal.toLocaleString()}`}
                    </button>
                </form>

                {/* Right Column: Order Summary Sidebar */}
                <div className="checkout-animate lg:col-span-5">
                    <div className="sticky top-28 bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-md">
                        <div className="flex items-center justify-between border-b border-[#2C2825]/15 pb-4">
                            <h2 className="font-serif text-2xl uppercase tracking-tight text-[#2C2825]">
                                ACQUISITION SUMMARY
                            </h2>
                            <span className="font-mono text-xs text-[#5C564D]">{totalItems} PIECES</span>
                        </div>

                        {/* Items Scroll List */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-[#2C2825]/10 pr-2 space-y-4">
                            {cart.map(({ product, quantity }) => (
                                <div key={product.id} className="pt-4 flex items-center gap-4">
                                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#F4EFEB] flex-shrink-0">
                                        <img
                                            src={product.images[0] || "/ring.jpeg"}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-serif text-base font-normal text-[#2C2825]">
                                            {product.name}
                                        </h4>
                                        <p className="font-mono text-xs text-[#5C564D] mt-0.5">
                                            QTY: {quantity} &bull; {product.currency} {product.price.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="font-mono text-xs font-semibold text-[#2C2825]">
                                        LKR {(product.price * quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Financial Totals */}
                        <div className="border-t border-[#2C2825]/15 pt-4 space-y-2 text-xs font-mono">
                            <div className="flex justify-between text-[#5C564D]">
                                <span>SUBTOTAL</span>
                                <span>LKR {cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[#5C564D]">
                                <span>COMPLIMENTARY INSURED SHIPPING</span>
                                <span className="text-[#C5A880] uppercase">FREE</span>
                            </div>
                            <div className="flex justify-between text-[#5C564D]">
                                <span>ATELIER PACKAGING & VALUABLES TAX</span>
                                <span>INCLUDED</span>
                            </div>

                            <div className="border-t border-[#2C2825]/15 pt-4 flex justify-between text-base font-bold text-[#2C2825]">
                                <span>TOTAL</span>
                                <span>LKR {cartTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="text-[10px] font-mono tracking-widest text-[#5C564D] uppercase text-center pt-2">
                            &bull; SECURE INSURED WORLDWIDE DISPATCH &bull;
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
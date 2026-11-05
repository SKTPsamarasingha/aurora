"use client";

import React from "react";
import {useCart} from "@/src/context/CartContext";
import {useRouter} from "next/navigation";

export default function CartDrawer() {
    const {cart, totalItems, cartTotal, isCartOpen, setIsCartOpen, updateQuantity} = useCart();
    const router = useRouter();

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div
                onClick={() => setIsCartOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div
                    className="w-screen max-w-md bg-[#F4EFEB] text-[#2C2825] shadow-2xl flex flex-col justify-between p-6 sm:p-8">
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between border-b border-[#2C2825]/20 pb-4">
                        <div>
                            <span className="text-[10px] tracking-widest text-[#5C564D] uppercase font-medium">
                                YOUR SELECTIONS
                            </span>
                            <h2 className="font-serif text-2xl font-light uppercase tracking-tight text-[#2C2825]">
                                SHOPPING CART ({totalItems})
                            </h2>
                        </div>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="p-2 rounded-full text-[#2C2825] hover:bg-[#2C2825]/10 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    {/* Drawer Items List */}
                    <div className="flex-1 overflow-y-auto py-6 divide-y divide-[#2C2825]/10 space-y-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-16">
                                <p className="font-serif text-xl text-[#5C564D] font-light">
                                    Your bag is empty.
                                </p>
                            </div>
                        ) : (
                            cart.map(({product, quantity}) => (
                                <div key={product.id} className="pt-4 flex items-center justify-between gap-4">
                                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#EAE4DA] flex-shrink-0">
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
                                            {product.currency} {product.price.toLocaleString()}
                                        </p>

                                        <div className="flex items-center space-x-3 mt-2">
                                            <button
                                                onClick={() => updateQuantity(product.id, -1)}
                                                className="w-6 h-6 rounded-full border border-[#2C2825]/30 flex items-center justify-center text-xs hover:bg-[#2C2825] hover:text-[#F4EFEB] transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="font-mono text-xs">{quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(product.id, 1)}
                                                className="w-6 h-6 rounded-full border border-[#2C2825]/30 flex items-center justify-center text-xs hover:bg-[#2C2825] hover:text-[#F4EFEB] transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="font-mono text-xs font-semibold text-[#2C2825]">
                                            {product.currency} {(product.price * quantity).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Drawer Footer & Checkout */}
                    <div className="border-t border-[#2C2825]/20 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-serif text-sm uppercase tracking-wider text-[#5C564D]">
                                SUBTOTAL
                            </span>
                            <span className="font-mono text-lg font-bold text-[#2C2825]">
                                LKR {cartTotal.toLocaleString()}
                            </span>
                        </div>

                        <button
                            disabled={cart.length === 0}
                            onClick={() => {
                                setIsCartOpen(false)
                                router.push("/checkout")
                            }}
                            className="w-full bg-[#2C2825] text-[#F4EFEB] py-4 rounded-full text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-[#4A433E] disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            PROCEED TO CHECKOUT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
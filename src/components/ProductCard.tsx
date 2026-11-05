"use client";

import React from "react";
import { Product } from "@/src/types/products"; // Adjust import path to your project structure
import { useCart } from "@/src/context/CartContext";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();

    const mainImage = product.images && product.images.length > 0 ? product.images[0] : "/ring.jpeg";

    return (
        <div className="group relative bg-[#EAE4DA]/60 border border-[#2C2825]/10 rounded-2xl p-4 flex flex-col justify-between transition-all duration-500 hover:shadow-2xl hover:border-[#2C2825]/30 hover:-translate-y-1">
            {/* Product Image Holder */}
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#F4EFEB] mb-4 flex items-center justify-center">
                <img
                    src={mainImage}
                    alt={product.imageAlt || product.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {product.isFeatured && (
                    <span className="absolute top-3 left-3 bg-[#2C2825] text-[#F4EFEB] text-[9px] font-mono tracking-widest px-2.5 py-1 rounded-full uppercase">
                        FEATURED
                    </span>
                )}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="absolute top-3 right-3 bg-[#C5A880] text-[#2C2825] text-[9px] font-mono tracking-widest px-2.5 py-1 rounded-full font-bold">
                        EXCLUSIVE
                    </span>
                )}
            </div>

            {/* Product Information */}
            <div className="flex flex-col flex-grow justify-between space-y-3 px-1">
                <div>
                    <span className="text-[10px] tracking-widest uppercase text-[#C5A880] font-medium">
                        {product.categoryName || "AURORA MAISON"}
                    </span>
                    <h3 className="font-serif text-xl font-normal text-[#2C2825] tracking-wide mt-0.5 line-clamp-1">
                        {product.name}
                    </h3>
                    {product.attributes?.material && (
                        <p className="text-xs text-[#5C564D] font-light mt-0.5">
                            {product.attributes.material}
                            {product.attributes.stone ? ` • ${product.attributes.stone}` : ""}
                        </p>
                    )}
                </div>

                {/* Price & Add to Cart Button */}
                <div className="pt-2 border-t border-[#2C2825]/10 flex items-center justify-between gap-2">
                    <div>
                        <span className="font-mono text-sm font-semibold text-[#2C2825]">
                            {product.currency} {product.price.toLocaleString()}
                        </span>
                        {product.compareAtPrice && (
                            <span className="block text-[10px] font-mono text-[#5C564D] line-through">
                                {product.currency} {product.compareAtPrice.toLocaleString()}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        className="inline-flex items-center gap-1.5 bg-[#2C2825] text-[#F4EFEB] px-4 py-2.5 rounded-full text-[11px] font-medium tracking-widest uppercase transition-all duration-300 hover:bg-[#4A433E] hover:gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <span>{product.stock > 0 ? "ADD" : "OUT OF STOCK"}</span>
                        {product.stock > 0 && (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
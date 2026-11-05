"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Search, ArrowRight, Package } from "lucide-react";
import gsap from "gsap";
import Link from "next/link";
import { useApi } from "@/src/context/useApi";

interface ProductItem {
    id: string;
    name: string;
    slug: string;
    price: number;
    categoryName?: string;
    images?: string[];
}

interface SearchBarProps {
    isOpen: boolean;
    onClose: () => void;
}

// Skeleton Card Component
function SearchSkeleton() {
    return (
        <div className="space-y-2">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="flex items-center justify-between py-3 px-3 rounded-2xl bg-[#EAE4DA]/40 animate-pulse border border-[#2C2825]/5"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-14 rounded-xl bg-[#2C2825]/10 shrink-0" />
                        <div className="space-y-2">
                            <div className="h-3.5 w-36 bg-[#2C2825]/15 rounded-md" />
                            <div className="h-2.5 w-20 bg-[#2C2825]/10 rounded-md" />
                        </div>
                    </div>
                    <div className="h-3.5 w-24 bg-[#2C2825]/15 rounded-md" />
                </div>
            ))}
        </div>
    );
}

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
    const api = useApi();
    const overlayRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch catalog when search overlay is toggled open
    useEffect(() => {
        if (isOpen && products.length === 0) {
            const fetchCatalog = async () => {
                try {
                    setLoading(true);
                    const res = await api.get("/products");
                    setProducts(res.data?.data || []);
                } catch (err) {
                    console.error("Failed to load catalog for search:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchCatalog();
        }
    }, [isOpen, api, products.length]);

    // Dynamic filtering as user types
    useEffect(() => {
        if (!query.trim()) {
            setFilteredProducts([]);
            return;
        }

        const q = query.toLowerCase();
        const matches = products.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.categoryName?.toLowerCase().includes(q) ||
                p.slug.toLowerCase().includes(q)
        );
        setFilteredProducts(matches.slice(0, 5));
    }, [query, products]);

    // GSAP Open/Close Animations
    useEffect(() => {
        if (!overlayRef.current || !containerRef.current) return;

        if (isOpen) {
            gsap.to(overlayRef.current, {
                autoAlpha: 1,
                duration: 0.2,
                ease: "power2.out",
            });
            gsap.to(containerRef.current, {
                y: 0,
                duration: 0.5,
                ease: "power4.out",
            });
        } else {
            gsap.to(containerRef.current, {
                y: -40,
                duration: 0.3,
                ease: "power3.in",
            });
            gsap.to(overlayRef.current, {
                autoAlpha: 0,
                duration: 0.2,
                delay: 0.1,
                ease: "power2.inOut",
            });
            setQuery("");
            setFilteredProducts([]);
        }
    }, [isOpen]);

    return (
        <div
            ref={overlayRef}
            className="opacity-0 invisible fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start items-start pt-16 md:pt-24 px-4"
            onClick={onClose}
        >
            <div
                ref={containerRef}
                className="transform -translate-y-10 w-full max-w-3xl mx-auto bg-[#F4EFEB] border border-[#2C2825]/20 rounded-3xl p-6 md:p-8 shadow-2xl text-[#2C2825] space-y-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Input Control */}
                <div className="flex items-center justify-between gap-4 border-b border-[#2C2825]/20 pb-4">
                    <div className="flex items-center gap-3 w-full">
                        <Search className="w-5 h-5 text-[#5C564D] shrink-0" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search fine jewelry, gold, diamonds..."
                            className="w-full bg-transparent text-[#2C2825] placeholder-[#5C564D] text-base md:text-lg focus:outline-none font-medium font-serif"
                            autoFocus={isOpen}
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="text-xs font-mono uppercase text-[#5C564D] hover:text-[#2C2825]"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        aria-label="Close Search"
                        className="p-2 text-[#2C2825] hover:bg-[#2C2825]/10 transition-all rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Results & Skeleton UI */}
                <div className="space-y-3">
                    {loading && (
                        <div>
                            <span className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase font-bold block mb-2">
                                SEARCHING ATELIER ARCHIVE...
                            </span>
                            <SearchSkeleton />
                        </div>
                    )}

                    {!loading && query.trim() && filteredProducts.length === 0 && (
                        <div className="py-8 text-center space-y-2">
                            <Package className="w-8 h-8 mx-auto text-[#5C564D]" />
                            <p className="font-serif text-sm text-[#2C2825]">No creations found matching "{query}"</p>
                            <p className="text-[10px] font-mono text-[#5C564D] uppercase">Try searching by metal type, category, or gem</p>
                        </div>
                    )}

                    {!loading && filteredProducts.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">
                                MATCHING CREATIONS ({filteredProducts.length})
                            </span>
                            <div className="divide-y divide-[#2C2825]/10 max-h-72 overflow-y-auto">
                                {filteredProducts.map((prod) => (
                                    <Link
                                        key={prod.id}
                                        href={`/products/${prod.slug}`}
                                        onClick={onClose}
                                        className="flex items-center justify-between py-3 hover:bg-[#2C2825]/5 px-3 rounded-2xl transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-14 rounded-xl bg-[#EAE4DA] overflow-hidden border border-[#2C2825]/10 shrink-0">
                                                {prod.images && prod.images.length > 0 ? (
                                                    <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-mono">AUR</div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-serif text-sm font-bold text-[#2C2825] group-hover:text-[#C5A880] transition-colors">
                                                    {prod.name}
                                                </h4>
                                                <span className="text-[10px] font-mono text-[#5C564D] uppercase">
                                                    {prod.categoryName || "Fine Jewelry"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs font-mono">
                                            <span className="font-bold text-[#2C2825]">LKR {prod.price?.toLocaleString()}</span>
                                            <ArrowRight className="w-4 h-4 text-[#5C564D] group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
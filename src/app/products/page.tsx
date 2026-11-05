"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Category } from "@/src/types/category";
import { Product } from "@/src/types/products";
import ProductCard from "@/src/components/ProductCard";
import { useAuth } from "@/src/context/AuthContext";
import { useApi } from "@/src/context/useApi";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function ProductsPage() {
    const { user, token, loading: authLoading } = useAuth();
    const api = useApi();

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [fetching, setFetching] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const pageRef = useRef<HTMLElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (authLoading || !token) return;

        const fetchData = async () => {
            try {
                setFetching(true);
                setError(null);

                const [catResponse, prodResponse] = await Promise.all([
                    api.get("/categories"),
                    api.get("/products"),
                ]);

                const categoryList = catResponse.data.data || [];
                const productList = prodResponse.data.data || [];

                const activeCategories = categoryList
                    .filter((c: Category) => c.isActive)
                    .sort((a: Category, b: Category) => a.sortOrder - b.sortOrder);
                setCategories(activeCategories);

                const activeProducts = productList.filter((p: Product) => p.isActive);
                setProducts(activeProducts);
                setFilteredProducts(activeProducts);
            } catch (err: any) {
                console.error("Failed to fetch products or categories:", err);
                setError(err.message || "Failed to load collection data.");
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, [authLoading, token, api]);

    useEffect(() => {
        if (selectedCategory === "all") {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter((p) => p.categoryId === selectedCategory));
        }
    }, [selectedCategory, products]);

    useEffect(() => {
        if (!fetching && gridRef.current && gridRef.current.children.length > 0) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    gridRef.current!.children,
                    { y: 30, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        stagger: 0.08,
                        ease: "power3.out",
                    }
                );
            }, pageRef);

            return () => ctx.revert();
        }
    }, [fetching, filteredProducts]);

    return (
        <section
            ref={pageRef}
            className="relative w-full min-h-screen bg-[#F4EFEB] text-[#2C2825] font-sans pt-24 pb-20 px-6 sm:px-10 lg:px-16"
        >


            {/* Page Header */}
            <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between border-b border-[#2C2825]/20 pb-8 mb-10 gap-6">
                <div>
                    <span className="text-[10px] sm:text-xs tracking-widest text-[#5C564D] uppercase font-medium">
                        AURORA HIGH JEWELRY
                    </span>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-tight uppercase text-[#2C2825] mt-1">
                        THE COLLECTION
                    </h1>
                </div>
            </div>

            {/* Category Navigation Filter Tabs */}
            <div className="relative z-10 max-w-7xl mx-auto mb-12 overflow-x-auto no-scrollbar">
                <div className="flex items-center space-x-2 sm:space-x-4 border-b border-[#2C2825]/10 pb-4 min-w-max">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={`px-5 py-2 rounded-full text-xs font-medium tracking-widest uppercase transition-all duration-300 ${
                            selectedCategory === "all"
                                ? "bg-[#2C2825] text-[#F4EFEB]"
                                : "bg-transparent text-[#2C2825]/70 hover:text-[#2C2825] hover:bg-[#2C2825]/5"
                        }`}
                    >
                        ALL CREATIONS
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-5 py-2 rounded-full text-xs font-medium tracking-widest uppercase transition-all duration-300 ${
                                selectedCategory === cat.id
                                    ? "bg-[#2C2825] text-[#F4EFEB]"
                                    : "bg-transparent text-[#2C2825]/70 hover:text-[#2C2825] hover:bg-[#2C2825]/5"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* State Handling: Loading & Error */}
            {fetching && (
                <div className="relative z-10 max-w-7xl mx-auto py-24 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#2C2825] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-serif text-lg tracking-wide text-[#5C564D] uppercase font-light">
                        Curating Masterpieces...
                    </p>
                </div>
            )}

            {error && (
                <div className="relative z-10 max-w-7xl mx-auto py-16 text-center border border-red-200 bg-red-50/50 rounded-2xl p-8">
                    <p className="text-red-700 font-serif text-lg mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-[#2C2825] text-[#F4EFEB] text-xs tracking-widest rounded-full uppercase"
                    >
                        RETRY
                    </button>
                </div>
            )}

            {/* Product Grid Render using ProductCard component */}
            {!fetching && !error && (
                <div className="relative z-10 max-w-7xl mx-auto">
                    {filteredProducts.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="font-serif text-2xl text-[#5C564D] font-light">
                                No creations available in this category.
                            </p>
                        </div>
                    ) : (
                        <div
                            ref={gridRef}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        >
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            )}

        </section>
    );
}
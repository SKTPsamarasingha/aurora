"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/src/context/AuthContext";
import { useApi } from "@/src/context/useApi";
import { useAdmin } from "@/src/context/AdminContext";
import { Package, Image as ImageIcon, Edit3, Check, X, Upload, Trash2, Star } from "lucide-react";
import ConfirmModal from "@/src/components/ConfirmModal";

interface ProductItem {
    id: string;
    name: string;
    slug: string;
    description?: string;
    categoryId: string;
    categoryName: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    sku: string;
    isActive: boolean;
    isFeatured: boolean;
    images?: string[];
}

interface Category {
    id: string;
    name: string;
}

export default function AdminProductsPage() {
    const { token, loading: authLoading } = useAuth();
    const api = useApi();
    const { isCreateModalOpen, closeCreateModal } = useAdmin();

    const [products, setProducts] = useState<ProductItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [fetching, setFetching] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Edit and Delete Modal Target States
    const [editTarget, setEditTarget] = useState<ProductItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);

    // Form creation states
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [price, setPrice] = useState<number | "">("");
    const [compareAtPrice, setCompareAtPrice] = useState<number | "">("");
    const [stock, setStock] = useState<number>(10);
    const [sku, setSku] = useState("");
    const [imageAlt, setImageAlt] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isFeatured, setIsFeatured] = useState(false);

    // Multi-image state
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const pageRef = useRef<HTMLElement>(null);
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);

    const fetchData = async () => {
        try {
            setFetching(true);
            setError(null);

            const [prodRes, catRes] = await Promise.all([
                api.get("/products"),
                api.get("/categories"),
            ]);

            setProducts(prodRes.data?.data || []);
            setCategories(catRes.data?.data || []);
        } catch (err: any) {
            console.error("Failed to fetch product data:", err);
            setError(err?.response?.data?.error || err.message || "Failed to load product inventory.");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (authLoading || !token) return;
        fetchData();
    }, [authLoading, token, api]);

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
    }, [fetching, products]);

    const handleNameChange = (val: string, isEditing = false) => {
        const generatedSlug = val
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

        if (isEditing && editTarget) {
            setEditTarget({ ...editTarget, name: val, slug: generatedSlug });
        } else {
            setName(val);
            setSlug(generatedSlug);
            if (!sku) {
                setSku(`AUR-${val.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
            }
        }
    };

    const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setImageFiles((prev) => [...prev, ...files]);
            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setName("");
        setSlug("");
        setDescription("");
        setCategoryId("");
        setPrice("");
        setCompareAtPrice("");
        setStock(10);
        setSku("");
        setImageAlt("");
        setIsActive(true);
        setIsFeatured(false);
        setImageFiles([]);
        setImagePreviews([]);
        setFormError(null);
    };

    // CREATE PRODUCT
    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!name || !slug || !categoryId || price === "") {
            setFormError("Please fill out all required fields (Name, Slug, Category, Price).");
            return;
        }

        const selectedCategory = categories.find((c) => c.id === categoryId);

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append("name", name);
            formData.append("slug", slug);
            formData.append("description", description);
            formData.append("categoryId", categoryId);
            formData.append("categoryName", selectedCategory?.name || "General");
            formData.append("price", String(price));
            if (compareAtPrice !== "") formData.append("compareAtPrice", String(compareAtPrice));
            formData.append("stock", String(stock));
            formData.append("sku", sku || `SKU-${Date.now()}`);
            formData.append("imageAlt", imageAlt || name);
            formData.append("isActive", String(isActive));
            formData.append("isFeatured", String(isFeatured));

            imageFiles.forEach((file) => {
                formData.append("images", file);
            });

            const response = await api.post("/products", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data?.success) {
                resetForm();
                closeCreateModal();
                fetchData();
            }
        } catch (err: any) {
            console.error("Failed to create product:", err);
            setFormError(err?.response?.data?.error?.message || err?.response?.data?.error || err.message || "Failed to create product.");
        } finally {
            setSubmitting(false);
        }
    };

    // UPDATE PRODUCT
    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;

        const selectedCategory = categories.find((c) => c.id === editTarget.categoryId);

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append("name", editTarget.name);
            formData.append("slug", editTarget.slug);
            formData.append("description", editTarget.description || "");
            formData.append("categoryId", editTarget.categoryId);
            formData.append("categoryName", selectedCategory?.name || "General");
            formData.append("price", String(editTarget.price));
            if (editTarget.compareAtPrice !== undefined) formData.append("compareAtPrice", String(editTarget.compareAtPrice));
            formData.append("stock", String(editTarget.stock));
            formData.append("sku", editTarget.sku);
            formData.append("isActive", String(editTarget.isActive));
            formData.append("isFeatured", String(editTarget.isFeatured));

            imageFiles.forEach((file) => {
                formData.append("images", file);
            });

            const response = await api.put(`/products/${editTarget.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data?.success) {
                setEditTarget(null);
                setImageFiles([]);
                setImagePreviews([]);
                fetchData();
            }
        } catch (err: any) {
            console.error("Failed to update product:", err);
            alert(err?.response?.data?.error || "Failed to update product.");
        } finally {
            setSubmitting(false);
        }
    };

    // DELETE PRODUCT
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            const response = await api.delete(`/products/${deleteTarget.id}`);
            if (response.data?.success) {
                fetchData();
            }
        } catch (err: any) {
            console.error("Failed to delete product:", err);
            alert(err?.response?.data?.error || "Failed to delete product.");
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <section ref={pageRef} className="w-full text-[#2C2825] font-sans">
            {fetching && (
                <div className="py-24 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#2C2825] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-serif text-lg tracking-wide text-[#5C564D] uppercase font-light">
                        Retrieving Atelier Inventory...
                    </p>
                </div>
            )}

            {error && (
                <div className="py-12 text-center border border-red-200 bg-red-50/50 rounded-3xl p-8 max-w-xl mx-auto">
                    <p className="text-red-700 font-serif text-base mb-4">{error}</p>
                    <button
                        onClick={fetchData}
                        className="px-6 py-2.5 bg-[#2C2825] text-[#F4EFEB] text-xs font-mono tracking-widest rounded-full uppercase"
                    >
                        RETRY CONNECTION
                    </button>
                </div>
            )}

            {!fetching && !error && (
                <div>
                    {products.length === 0 ? (
                        <div className="bg-[#EAE4DA]/50 border border-[#2C2825]/15 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-4">
                            <Package className="w-12 h-12 mx-auto text-[#5C564D]" />
                            <h3 className="font-serif text-2xl font-light text-[#2C2825]">
                                NO CREATIONS FOUND
                            </h3>
                            <p className="text-xs font-mono text-[#5C564D] uppercase tracking-wider">
                                Click 'New Creation' in the header to introduce your first luxury item.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl shadow-sm backdrop-blur-md">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="border-b border-[#2C2825]/15 text-[10px] font-mono tracking-widest text-[#5C564D] uppercase">
                                    <th className="py-5 px-6 font-medium">PREVIEW</th>
                                    <th className="py-5 px-6 font-medium">CREATION NAME</th>
                                    <th className="py-5 px-6 font-medium">CATEGORY</th>
                                    <th className="py-5 px-6 font-medium">SKU</th>
                                    <th className="py-5 px-6 font-medium">PRICE (LKR)</th>
                                    <th className="py-5 px-6 font-medium text-center">STOCK</th>
                                    <th className="py-5 px-6 font-medium">STATUS</th>
                                    <th className="py-5 px-6 font-medium text-center">ACTIONS</th>
                                </tr>
                                </thead>
                                <tbody ref={tableBodyRef} className="divide-y divide-[#2C2825]/10 text-xs font-mono">
                                {products.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-[#2C2825]/5 transition-colors duration-200">
                                        <td className="py-4 px-6">
                                            <div className="w-12 h-14 rounded-xl bg-[#F4EFEB] border border-[#2C2825]/10 overflow-hidden flex items-center justify-center">
                                                {prod.images && prod.images.length > 0 ? (
                                                    <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-5 h-5 text-[#5C564D]" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-serif text-sm font-bold text-[#2C2825]">
                                            <div className="flex items-center gap-2">
                                                {prod.name}
                                                {prod.isFeatured && <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-600 flex-shrink-0" />}
                                            </div>
                                            <span className="block font-mono text-[10px] text-[#5C564D] font-normal truncate max-w-xs mt-0.5">
                                                    /{prod.slug}
                                                </span>
                                        </td>
                                        <td className="py-4 px-6 text-[#5C564D]">
                                            {prod.categoryName || "Unassigned"}
                                        </td>
                                        <td className="py-4 px-6 text-[#5C564D] uppercase">
                                            {prod.sku}
                                        </td>
                                        <td className="py-4 px-6 font-bold text-[#2C2825]">
                                            LKR {prod.price?.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6 text-center font-bold text-[#2C2825]">
                                            {prod.stock}
                                        </td>
                                        <td className="py-4 px-6">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-[9px] tracking-widest px-3 py-1 rounded-full uppercase font-bold border ${
                                                        prod.isActive
                                                            ? "bg-emerald-900/10 text-emerald-900 border-emerald-300"
                                                            : "bg-red-900/10 text-red-900 border-red-300"
                                                    }`}
                                                >
                                                    {prod.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                    {prod.isActive ? "ACTIVE" : "HIDDEN"}
                                                </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditTarget(prod);
                                                        setImagePreviews(prod.images || []);
                                                    }}
                                                    className="p-2 border border-[#2C2825]/20 rounded-xl hover:bg-[#2C2825] hover:text-[#F4EFEB] transition-all"
                                                    title="Edit Creation"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(prod)}
                                                    className="p-2 border border-red-200 text-red-800 rounded-xl hover:bg-red-800 hover:text-white transition-all"
                                                    title="Delete Creation"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* CREATE PRODUCT MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div
                        className="bg-[#F4EFEB] border border-[#2C2825]/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl text-[#2C2825] space-y-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-[#2C2825]/15 pb-4">
                            <div>
                                <span className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">
                                    INVENTORY REGISTRATION
                                </span>
                                <h3 className="font-serif text-2xl font-light text-[#2C2825]">
                                    NEW LUXURY CREATION
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    resetForm();
                                    closeCreateModal();
                                }}
                                className="w-8 h-8 rounded-full bg-[#2C2825]/10 hover:bg-[#2C2825] hover:text-[#F4EFEB] flex items-center justify-center transition-colors text-xs font-mono"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-xl text-xs font-mono">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreateProduct} className="space-y-4 font-mono text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        CREATION NAME *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        placeholder="e.g. Imperial Diamond Solitaire"
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        URL SLUG *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="imperial-diamond-solitaire"
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        ATELIER CATEGORY *
                                    </label>
                                    <select
                                        required
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825] uppercase"
                                    >
                                        <option value="">-- SELECT CATEGORY --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        SKU CODE
                                    </label>
                                    <input
                                        type="text"
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                        placeholder="AUR-IMP-001"
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825] uppercase"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        PRICE (LKR) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                        placeholder="450000"
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        COMPARE PRICE (LKR)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={compareAtPrice}
                                        onChange={(e) => setCompareAtPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                        placeholder="500000"
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        STOCK QUANTITY *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={stock}
                                        onChange={(e) => setStock(Number(e.target.value))}
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                    DESCRIPTION
                                </label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Exquisitely crafted in 18k yellow gold..."
                                    className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                    CREATION IMAGES (S3 DISPATCH)
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-center gap-2 bg-[#EAE4DA] border border-dashed border-[#2C2825]/30 rounded-xl p-4 cursor-pointer hover:bg-[#2C2825]/10 transition-colors">
                                        <Upload className="w-4 h-4 text-[#5C564D]" />
                                        <span className="text-[10px] uppercase font-bold">SELECT IMAGE FILES (MULTIPLE)</span>
                                        <input type="file" multiple accept="image/*" onChange={handleImagesSelect} className="hidden" />
                                    </label>

                                    {imagePreviews.length > 0 && (
                                        <div className="flex flex-wrap gap-3 pt-2">
                                            {imagePreviews.map((src, index) => (
                                                <div key={index} className="relative w-16 h-20 rounded-xl overflow-hidden bg-[#EAE4DA] border border-[#2C2825]/20 group">
                                                    <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-1 right-1 bg-red-800 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                                                        title="Remove Image"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        className="w-4 h-4 accent-[#2C2825]"
                                    />
                                    <span className="text-[10px] tracking-widest uppercase">IS ACTIVE</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                        className="w-4 h-4 accent-[#2C2825]"
                                    />
                                    <span className="text-[10px] tracking-widest uppercase">FEATURED CREATION</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2825]/15">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        closeCreateModal();
                                    }}
                                    className="px-6 py-3 rounded-full border border-[#2C2825]/20 hover:bg-[#2C2825]/10 text-xs tracking-widest uppercase"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-3 rounded-full bg-[#2C2825] text-[#F4EFEB] hover:bg-[#4A433E] text-xs tracking-widest uppercase font-bold shadow-md disabled:opacity-50"
                                >
                                    {submitting ? "REGISTERING..." : "SAVE CREATION"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT PRODUCT MODAL */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div
                        className="bg-[#F4EFEB] border border-[#2C2825]/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl text-[#2C2825] space-y-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-[#2C2825]/15 pb-4">
                            <div>
                                <span className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">
                                    INVENTORY REGISTRATION
                                </span>
                                <h3 className="font-serif text-2xl font-light text-[#2C2825]">
                                    EDIT CREATION
                                </h3>
                            </div>
                            <button
                                onClick={() => setEditTarget(null)}
                                className="w-8 h-8 rounded-full bg-[#2C2825]/10 hover:bg-[#2C2825] hover:text-[#F4EFEB] flex items-center justify-center transition-colors text-xs font-mono"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProduct} className="space-y-4 font-mono text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        CREATION NAME *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editTarget.name}
                                        onChange={(e) => handleNameChange(e.target.value, true)}
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        URL SLUG *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editTarget.slug}
                                        onChange={(e) => setEditTarget({ ...editTarget, slug: e.target.value })}
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        ATELIER CATEGORY *
                                    </label>
                                    <select
                                        required
                                        value={editTarget.categoryId}
                                        onChange={(e) => setEditTarget({ ...editTarget, categoryId: e.target.value })}
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825] uppercase"
                                    >
                                        <option value="">-- SELECT CATEGORY --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        SKU CODE
                                    </label>
                                    <input
                                        type="text"
                                        value={editTarget.sku}
                                        onChange={(e) => setEditTarget({ ...editTarget, sku: e.target.value })}
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825] uppercase"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        PRICE (LKR) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={editTarget.price}
                                        onChange={(e) => setEditTarget({ ...editTarget, price: Number(e.target.value) })}
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        COMPARE PRICE (LKR)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editTarget.compareAtPrice || ""}
                                        onChange={(e) => setEditTarget({ ...editTarget, compareAtPrice: e.target.value === "" ? undefined : Number(e.target.value) })}
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        STOCK QUANTITY *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={editTarget.stock}
                                        onChange={(e) => setEditTarget({ ...editTarget, stock: Number(e.target.value) })}
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                    DESCRIPTION
                                </label>
                                <textarea
                                    rows={3}
                                    value={editTarget.description || ""}
                                    onChange={(e) => setEditTarget({ ...editTarget, description: e.target.value })}
                                    className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                    ADD NEW IMAGES (S3 DISPATCH)
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-center gap-2 bg-[#EAE4DA] border border-dashed border-[#2C2825]/30 rounded-xl p-4 cursor-pointer hover:bg-[#2C2825]/10 transition-colors">
                                        <Upload className="w-4 h-4 text-[#5C564D]" />
                                        <span className="text-[10px] uppercase font-bold">SELECT NEW IMAGE FILES</span>
                                        <input type="file" multiple accept="image/*" onChange={handleImagesSelect} className="hidden" />
                                    </label>

                                    {imagePreviews.length > 0 && (
                                        <div className="flex flex-wrap gap-3 pt-2">
                                            {imagePreviews.map((src, index) => (
                                                <div key={index} className="relative w-16 h-20 rounded-xl overflow-hidden bg-[#EAE4DA] border border-[#2C2825]/20 group">
                                                    <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editTarget.isActive}
                                        onChange={(e) => setEditTarget({ ...editTarget, isActive: e.target.checked })}
                                        className="w-4 h-4 accent-[#2C2825]"
                                    />
                                    <span className="text-[10px] tracking-widest uppercase">IS ACTIVE</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editTarget.isFeatured}
                                        onChange={(e) => setEditTarget({ ...editTarget, isFeatured: e.target.checked })}
                                        className="w-4 h-4 accent-[#2C2825]"
                                    />
                                    <span className="text-[10px] tracking-widest uppercase">FEATURED CREATION</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2825]/15">
                                <button
                                    type="button"
                                    onClick={() => setEditTarget(null)}
                                    className="px-6 py-3 rounded-full border border-[#2C2825]/20 hover:bg-[#2C2825]/10 text-xs tracking-widest uppercase"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-3 rounded-full bg-[#2C2825] text-[#F4EFEB] hover:bg-[#4A433E] text-xs tracking-widest uppercase font-bold shadow-md disabled:opacity-50"
                                >
                                    {submitting ? "SAVING..." : "UPDATE CREATION"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CONFIRMATION MODAL FOR DELETION */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="DELETE LUXURY CREATION"
                description={`Are you sure you want to delete creation '${deleteTarget?.name}' from the inventory archive?`}
                confirmText="CONFIRM DELETION"
                isDestructive={true}
            />
        </section>
    );
}
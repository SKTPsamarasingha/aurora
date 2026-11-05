"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/src/context/AuthContext";
import { useApi } from "@/src/context/useApi";
import { useAdmin } from "@/src/context/AdminContext";
import { FolderTree, Image as ImageIcon, Edit3, Trash2, Check, X, Upload } from "lucide-react";
import ConfirmModal from "@/src/components/ConfirmModal";

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    sortOrder: number;
    imageUrl?: string;
    createdAt?: string;
}

export default function AdminCategoriesPage() {
    const { token, loading: authLoading } = useAuth();
    const api = useApi();
    const { isCreateModalOpen, closeCreateModal } = useAdmin();

    const [categories, setCategories] = useState<Category[]>([]);
    const [fetching, setFetching] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Edit and Delete Modal Target States
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

    // Form states for creating a new category
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [sortOrder, setSortOrder] = useState(0);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const pageRef = useRef<HTMLElement>(null);
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);

    const fetchCategories = async () => {
        try {
            setFetching(true);
            setError(null);
            const response = await api.get("/categories");
            const categoryList: Category[] = response.data?.data || [];
            setCategories(categoryList);
        } catch (err: any) {
            console.error("Failed to fetch categories:", err);
            setError(err?.response?.data?.error || err.message || "Failed to load categories archive.");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (authLoading || !token) return;
        fetchCategories();
    }, [authLoading, token, api]);

    // GSAP Table Entrance Animation
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
    }, [fetching, categories]);

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
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setName("");
        setSlug("");
        setDescription("");
        setIsActive(true);
        setSortOrder(0);
        setImageFile(null);
        setImagePreview(null);
        setFormError(null);
    };

    // CREATE CATEGORY
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!name.trim() || !slug.trim()) {
            setFormError("Name and slug are required fields.");
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append("name", name);
            formData.append("slug", slug);
            formData.append("description", description);
            formData.append("isActive", String(isActive));
            formData.append("sortOrder", String(sortOrder));

            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await api.post("/categories", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data?.success) {
                resetForm();
                closeCreateModal();
                fetchCategories();
            }
        } catch (err: any) {
            console.error("Failed to create category:", err);
            setFormError(err?.response?.data?.error?.message || err?.response?.data?.error || err.message || "Failed to create category.");
        } finally {
            setSubmitting(false);
        }
    };

    // UPDATE CATEGORY
    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append("name", editTarget.name);
            formData.append("slug", editTarget.slug);
            formData.append("description", editTarget.description || "");
            formData.append("isActive", String(editTarget.isActive));
            formData.append("sortOrder", String(editTarget.sortOrder || 0));

            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await api.put(`/categories/${editTarget.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data?.success) {
                setEditTarget(null);
                setImageFile(null);
                setImagePreview(null);
                fetchCategories();
            }
        } catch (err: any) {
            console.error("Failed to update category:", err);
            alert(err?.response?.data?.error || "Failed to update category.");
        } finally {
            setSubmitting(false);
        }
    };

    // DELETE CATEGORY
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            const response = await api.delete(`/categories/${deleteTarget.id}`);
            if (response.data?.success) {
                fetchCategories();
            }
        } catch (err: any) {
            console.error("Failed to delete category:", err);
            alert(err?.response?.data?.error || "Failed to delete category.");
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
                        Retrieving Atelier Taxonomies...
                    </p>
                </div>
            )}

            {error && (
                <div className="py-12 text-center border border-red-200 bg-red-50/50 rounded-3xl p-8 max-w-xl mx-auto">
                    <p className="text-red-700 font-serif text-base mb-4">{error}</p>
                    <button
                        onClick={fetchCategories}
                        className="px-6 py-2.5 bg-[#2C2825] text-[#F4EFEB] text-xs font-mono tracking-widest rounded-full uppercase"
                    >
                        RETRY CONNECTION
                    </button>
                </div>
            )}

            {!fetching && !error && (
                <div>
                    {categories.length === 0 ? (
                        <div className="bg-[#EAE4DA]/50 border border-[#2C2825]/15 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-4">
                            <FolderTree className="w-12 h-12 mx-auto text-[#5C564D]" />
                            <h3 className="font-serif text-2xl font-light text-[#2C2825]">
                                NO CATEGORIES DEFINED
                            </h3>
                            <p className="text-xs font-mono text-[#5C564D] uppercase tracking-wider">
                                Click 'Add Category' in the header to introduce your first taxonomy item.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl shadow-sm backdrop-blur-md">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="border-b border-[#2C2825]/15 text-[10px] font-mono tracking-widest text-[#5C564D] uppercase">
                                    <th className="py-5 px-6 font-medium">COVER</th>
                                    <th className="py-5 px-6 font-medium">CATEGORY NAME</th>
                                    <th className="py-5 px-6 font-medium">SLUG</th>
                                    <th className="py-5 px-6 font-medium">STATUS</th>
                                    <th className="py-5 px-6 font-medium text-center">ORDER</th>
                                    <th className="py-5 px-6 font-medium text-center">ACTIONS</th>
                                </tr>
                                </thead>
                                <tbody ref={tableBodyRef} className="divide-y divide-[#2C2825]/10 text-xs font-mono">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-[#2C2825]/5 transition-colors duration-200">
                                        <td className="py-4 px-6">
                                            <div className="w-12 h-12 rounded-xl bg-[#F4EFEB] border border-[#2C2825]/10 overflow-hidden flex items-center justify-center">
                                                {cat.imageUrl ? (
                                                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-5 h-5 text-[#5C564D]" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-serif text-sm font-bold text-[#2C2825]">
                                            {cat.name}
                                            {cat.description && (
                                                <span className="block font-mono text-[10px] text-[#5C564D] font-normal truncate max-w-xs mt-0.5">
                                                        {cat.description}
                                                    </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-[#5C564D]">
                                            /{cat.slug}
                                        </td>
                                        <td className="py-4 px-6">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-[9px] tracking-widest px-3 py-1 rounded-full uppercase font-bold border ${
                                                        cat.isActive
                                                            ? "bg-emerald-900/10 text-emerald-900 border-emerald-300"
                                                            : "bg-red-900/10 text-red-900 border-red-300"
                                                    }`}
                                                >
                                                    {cat.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                    {cat.isActive ? "ACTIVE" : "HIDDEN"}
                                                </span>
                                        </td>
                                        <td className="py-4 px-6 text-center font-bold text-[#2C2825]">
                                            {cat.sortOrder ?? 0}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditTarget(cat);
                                                        setImagePreview(cat.imageUrl || null);
                                                    }}
                                                    className="p-2 border border-[#2C2825]/20 rounded-xl hover:bg-[#2C2825] hover:text-[#F4EFEB] transition-all"
                                                    title="Edit Category"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(cat)}
                                                    className="p-2 border border-red-200 text-red-800 rounded-xl hover:bg-red-800 hover:text-white transition-all"
                                                    title="Delete Category"
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

            {/* CREATE CATEGORY MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div
                        className="bg-[#F4EFEB] border border-[#2C2825]/20 max-w-lg w-full rounded-3xl p-8 shadow-2xl text-[#2C2825] space-y-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-[#2C2825]/15 pb-4">
                            <div>
                                <span className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">
                                    TAXONOMY EDITOR
                                </span>
                                <h3 className="font-serif text-2xl font-light text-[#2C2825]">
                                    NEW CATEGORY
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

                        <form onSubmit={handleCreateCategory} className="space-y-4 font-mono text-xs">
                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                    CATEGORY NAME *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g. Fine Necklaces"
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
                                    placeholder="fine-necklaces"
                                    className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                    DESCRIPTION
                                </label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief atelier description..."
                                    className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        SORT ORDER
                                    </label>
                                    <input
                                        type="number"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(Number(e.target.value))}
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>

                                <div className="flex flex-col justify-end">
                                    <label className="flex items-center gap-2 cursor-pointer pb-3">
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                            className="w-4 h-4 accent-[#2C2825]"
                                        />
                                        <span className="text-[10px] tracking-widest uppercase">IS ACTIVE</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                    COVER IMAGE (S3 DISPATCH)
                                </label>
                                <div className="flex items-center gap-4">
                                    {imagePreview && (
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#EAE4DA] border border-[#2C2825]/20 flex-shrink-0">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <label className="flex-1 flex items-center justify-center gap-2 bg-[#EAE4DA] border border-dashed border-[#2C2825]/30 rounded-xl p-3 cursor-pointer hover:bg-[#2C2825]/10 transition-colors">
                                        <Upload className="w-4 h-4 text-[#5C564D]" />
                                        <span className="text-[10px] uppercase font-bold">SELECT IMAGE</span>
                                        <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e)} className="hidden" />
                                    </label>
                                </div>
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
                                    {submitting ? "CREATING..." : "SAVE CATEGORY"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT CATEGORY MODAL */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div
                        className="bg-[#F4EFEB] border border-[#2C2825]/20 max-w-lg w-full rounded-3xl p-8 shadow-2xl text-[#2C2825] space-y-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-[#2C2825]/15 pb-4">
                            <div>
                                <span className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">
                                    TAXONOMY EDITOR
                                </span>
                                <h3 className="font-serif text-2xl font-light text-[#2C2825]">
                                    EDIT CATEGORY
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setEditTarget(null);
                                    setImageFile(null);
                                    setImagePreview(null);
                                }}
                                className="w-8 h-8 rounded-full bg-[#2C2825]/10 hover:bg-[#2C2825] hover:text-[#F4EFEB] flex items-center justify-center transition-colors text-xs font-mono"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateCategory} className="space-y-4 font-mono text-xs">
                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                    CATEGORY NAME *
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        SORT ORDER
                                    </label>
                                    <input
                                        type="number"
                                        value={editTarget.sortOrder ?? 0}
                                        onChange={(e) => setEditTarget({ ...editTarget, sortOrder: Number(e.target.value) })}
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>

                                <div className="flex flex-col justify-end">
                                    <label className="flex items-center gap-2 cursor-pointer pb-3">
                                        <input
                                            type="checkbox"
                                            checked={editTarget.isActive}
                                            onChange={(e) => setEditTarget({ ...editTarget, isActive: e.target.checked })}
                                            className="w-4 h-4 accent-[#2C2825]"
                                        />
                                        <span className="text-[10px] tracking-widest uppercase">IS ACTIVE</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                    COVER IMAGE (S3 DISPATCH)
                                </label>
                                <div className="flex items-center gap-4">
                                    {imagePreview && (
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#EAE4DA] border border-[#2C2825]/20 flex-shrink-0">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <label className="flex-1 flex items-center justify-center gap-2 bg-[#EAE4DA] border border-dashed border-[#2C2825]/30 rounded-xl p-3 cursor-pointer hover:bg-[#2C2825]/10 transition-colors">
                                        <Upload className="w-4 h-4 text-[#5C564D]" />
                                        <span className="text-[10px] uppercase font-bold">CHANGE IMAGE</span>
                                        <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e, true)} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2825]/15">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditTarget(null);
                                        setImageFile(null);
                                        setImagePreview(null);
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
                                    {submitting ? "SAVING..." : "UPDATE CATEGORY"}
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
                title="DELETE CATEGORY"
                description={`Are you sure you want to delete category '${deleteTarget?.name}'? This action cannot be undone.`}
                confirmText="CONFIRM DELETION"
                isDestructive={true}
            />
        </section>
    );
}
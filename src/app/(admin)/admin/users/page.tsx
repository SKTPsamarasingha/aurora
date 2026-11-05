"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/src/context/AuthContext";
import { useApi } from "@/src/context/useApi";
import { useAdmin } from "@/src/context/AdminContext";
import { Users, Shield, ShieldAlert, Edit3, Trash2, User as UserIcon } from "lucide-react";
import ConfirmModal from "@/src/components/ConfirmModal";

interface UserRecord {
    uid: string;
    email: string;
    displayName: string;
    role: string;
    permissions: string[];
    createdAt?: string;
}

interface PermissionDoc {
    name: string;
    description: string;
    resource: string;
    action: string;
}

interface RoleDoc {
    name: string;
    roleKey?: string;
    description: string;
    permissions: string[];
}

export default function AdminUsersPage() {
    const { user: currentUser, token, loading: authLoading } = useAuth();
    const api = useApi();
    const { isCreateModalOpen, closeCreateModal } = useAdmin();

    const [users, setUsers] = useState<UserRecord[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<PermissionDoc[]>([]);
    const [availableRoles, setAvailableRoles] = useState<RoleDoc[]>([]);
    const [fetching, setFetching] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Modals state
    const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
    const [editTarget, setEditTarget] = useState<UserRecord | null>(null);

    // Form states for creation
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [selectedRole, setSelectedRole] = useState("admin");
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const pageRef = useRef<HTMLElement>(null);
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);

    const isSuperAdmin = currentUser?.role === "superadmin" || currentUser?.role === "super_admin";

    const fetchAdminDirectoryData = async () => {
        try {
            setFetching(true);
            setError(null);

            const [usersRes, permsRes, rolesRes] = await Promise.all([
                api.get("/admin/users"),
                api.get("/admin/permissions"),
                api.get("/admin/roles"),
            ]);

            setUsers(usersRes.data?.data || []);
            setAvailablePermissions(permsRes.data?.data || []);
            setAvailableRoles(rolesRes.data?.data || []);
        } catch (err: any) {
            console.error("Failed to fetch directory data:", err);
            setError(err?.response?.data?.error || err.message || "Failed to load directory configurations.");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (authLoading || !token) return;
        if (isSuperAdmin) {
            fetchAdminDirectoryData();
        } else {
            setFetching(false);
        }
    }, [authLoading, token, isSuperAdmin, api]);

    const handleRoleChange = (roleName: string) => {
        setSelectedRole(roleName);
        const foundRole = availableRoles.find(
            (r) => r.name.toLowerCase() === roleName.toLowerCase() || r.roleKey === roleName
        );
        if (foundRole && foundRole.permissions) {
            setSelectedPermissions(foundRole.permissions);
        } else if (roleName === "superadmin") {
            setSelectedPermissions(availablePermissions.map((p) => p.name));
        }
    };

    const togglePermission = (permName: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
        );
    };

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setDisplayName("");
        setSelectedRole("admin");
        setSelectedPermissions([]);
        setFormError(null);
    };

    // CREATE USER SUBMISSION
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!email || !password || !displayName) {
            setFormError("Email, password, and display name are required.");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                email,
                password,
                displayName,
                role: selectedRole,
                permissions: selectedRole === "superadmin" ? availablePermissions.map((p) => p.name) : selectedPermissions,
            };

            const response = await api.post("/admin/users", payload);

            if (response.data?.success) {
                resetForm();
                closeCreateModal();
                fetchAdminDirectoryData();
            }
        } catch (err: any) {
            console.error("Failed to create user:", err);
            setFormError(err?.response?.data?.error || err.message || "Failed to create user account.");
        } finally {
            setSubmitting(false);
        }
    };

    // UPDATE USER SUBMISSION
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;

        try {
            setSubmitting(true);
            const payload = {
                displayName: editTarget.displayName,
                role: editTarget.role,
                permissions: editTarget.permissions,
            };

            const response = await api.put(`/admin/users/${editTarget.uid}`, payload);
            if (response.data?.success) {
                setEditTarget(null);
                fetchAdminDirectoryData();
            }
        } catch (err: any) {
            console.error("Failed to update user:", err);
            alert(err?.response?.data?.error || "Failed to update user profile.");
        } finally {
            setSubmitting(false);
        }
    };

    // DELETE USER EXECUTION
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            const response = await api.delete(`/admin/users/${deleteTarget.uid}`);
            if (response.data?.success) {
                fetchAdminDirectoryData();
            }
        } catch (err: any) {
            console.error("Failed to delete user:", err);
            alert(err?.response?.data?.error || "Failed to delete user account.");
        } finally {
            setDeleteTarget(null);
        }
    };

    if (!authLoading && !isSuperAdmin) {
        return (
            <div className="py-24 text-center max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 bg-red-100 text-red-800 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="font-serif text-3xl font-light text-[#2C2825] uppercase tracking-tight">
                    ACCESS RESTRICTED
                </h2>
                <p className="text-xs font-mono text-[#5C564D] uppercase leading-relaxed">
                    This directory requires <span className="font-bold text-[#2C2825]">Super Administrator</span> clearance.
                </p>
            </div>
        );
    }

    return (
        <section ref={pageRef} className="w-full text-[#2C2825] font-sans">
            {fetching && (
                <div className="py-24 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#2C2825] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-serif text-lg tracking-wide text-[#5C564D] uppercase font-light">
                        Loading Access Control Directory...
                    </p>
                </div>
            )}

            {!fetching && !error && (
                <div className="overflow-x-auto bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl shadow-sm backdrop-blur-md">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-[#2C2825]/15 text-[10px] font-mono tracking-widest text-[#5C564D] uppercase">
                            <th className="py-5 px-6 font-medium">PERSONNEL</th>
                            <th className="py-5 px-6 font-medium">EMAIL</th>
                            <th className="py-5 px-6 font-medium">ROLE</th>
                            <th className="py-5 px-6 font-medium">PERMISSIONS ASSIGNED</th>
                            <th className="py-5 px-6 font-medium text-center">ACTIONS</th>
                        </tr>
                        </thead>
                        <tbody ref={tableBodyRef} className="divide-y divide-[#2C2825]/10 text-xs font-mono">
                        {users.map((u) => {
                            const isProtectedSuperadmin = u.role === "superadmin" || u.role === "super_admin";

                            return (
                                <tr key={u.uid} className="hover:bg-[#2C2825]/5 transition-colors duration-200">
                                    <td className="py-4 px-6 font-serif text-sm font-bold text-[#2C2825]">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4 text-[#5C564D]" />
                                            {u.displayName || "Unnamed Personnel"}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-[#5C564D]">{u.email}</td>
                                    <td className="py-4 px-6">
                                            <span
                                                className={`inline-flex items-center gap-1 text-[9px] tracking-widest px-3 py-1 rounded-full uppercase font-bold border ${
                                                    isProtectedSuperadmin
                                                        ? "bg-[#C5A880]/20 text-[#2C2825] border-[#C5A880]"
                                                        : "bg-[#2C2825] text-[#F4EFEB]"
                                                }`}
                                            >
                                                <Shield className="w-3 h-3" />
                                                {u.role}
                                            </span>
                                    </td>
                                    <td className="py-4 px-6 text-[#5C564D]">
                                        {isProtectedSuperadmin ? (
                                            <span className="font-bold text-[#2C2825]">FULL SYSTEM ACCESS</span>
                                        ) : (
                                            <span>{u.permissions?.length || 0} permissions granted</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setEditTarget(u)}
                                                className="p-2 border border-[#2C2825]/20 rounded-xl hover:bg-[#2C2825] hover:text-[#F4EFEB] transition-all"
                                                title="Edit Permissions"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            {!isProtectedSuperadmin && (
                                                <button
                                                    onClick={() => setDeleteTarget(u)}
                                                    className="p-2 border border-red-200 text-red-800 rounded-xl hover:bg-red-800 hover:text-white transition-all"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CREATE USER MODAL (Triggered by AdminHeader via AdminContext) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div
                        className="bg-[#F4EFEB] border border-[#2C2825]/20 max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl text-[#2C2825] space-y-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-[#2C2825]/15 pb-4">
                            <div>
                                <span className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">
                                    DATABASE ACCESS CONTROL
                                </span>
                                <h3 className="font-serif text-2xl font-light text-[#2C2825]">
                                    REGISTER PERSONNEL
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

                        <form onSubmit={handleCreateUser} className="space-y-4 font-mono text-xs">
                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                    DISPLAY NAME *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="e.g. Senior Curator"
                                    className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        EMAIL ADDRESS *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="curator@aurora.com"
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        PASSWORD *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimum 6 characters"
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                    ASSIGNED ROLE *
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => handleRoleChange(e.target.value)}
                                    className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825] uppercase font-bold"
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="editor">Editor</option>
                                    <option value="superadmin">Super Administrator</option>
                                    <option value="customer">Customer</option>
                                    {availableRoles.map((r) => (
                                        <option key={r.name} value={r.name.toLowerCase()}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedRole !== "superadmin" && (
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-2">
                                        GRANULAR PERMISSIONS
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-[#EAE4DA]/50 p-3 rounded-xl border border-[#2C2825]/10">
                                        {availablePermissions.map((perm) => (
                                            <label key={perm.name} className="flex items-start gap-2 cursor-pointer py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.includes(perm.name)}
                                                    onChange={() => togglePermission(perm.name)}
                                                    className="w-3.5 h-3.5 mt-0.5 accent-[#2C2825]"
                                                />
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold block">{perm.name}</span>
                                                    {perm.description && (
                                                        <span className="text-[9px] text-[#5C564D] block leading-tight">{perm.description}</span>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                    {submitting ? "REGISTERING..." : "REGISTER USER"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT USER MODAL */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div
                        className="bg-[#F4EFEB] border border-[#2C2825]/20 max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl text-[#2C2825] space-y-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-[#2C2825]/15 pb-4">
                            <div>
                                <span className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">
                                    PROFILE MANAGEMENT
                                </span>
                                <h3 className="font-serif text-2xl font-light text-[#2C2825]">
                                    EDIT PERSONNEL
                                </h3>
                            </div>
                            <button
                                onClick={() => setEditTarget(null)}
                                className="w-8 h-8 rounded-full bg-[#2C2825]/10 hover:bg-[#2C2825] hover:text-[#F4EFEB] flex items-center justify-center transition-colors text-xs font-mono"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-4 font-mono text-xs">
                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                    DISPLAY NAME
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editTarget.displayName}
                                    onChange={(e) => setEditTarget({ ...editTarget, displayName: e.target.value })}
                                    className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                    ROLE
                                </label>
                                <select
                                    value={editTarget.role}
                                    onChange={(e) => setEditTarget({ ...editTarget, role: e.target.value })}
                                    className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825] uppercase font-bold"
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="editor">Editor</option>
                                    <option value="superadmin">Super Administrator</option>
                                    <option value="customer">Customer</option>
                                </select>
                            </div>

                            {editTarget.role !== "superadmin" && (
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-2">
                                        PERMISSIONS
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-[#EAE4DA]/50 p-3 rounded-xl border border-[#2C2825]/10">
                                        {availablePermissions.map((perm) => (
                                            <label key={perm.name} className="flex items-start gap-2 cursor-pointer py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={editTarget.permissions?.includes(perm.name)}
                                                    onChange={() => {
                                                        const current = editTarget.permissions || [];
                                                        const nextPerms = current.includes(perm.name)
                                                            ? current.filter((p) => p !== perm.name)
                                                            : [...current, perm.name];
                                                        setEditTarget({ ...editTarget, permissions: nextPerms });
                                                    }}
                                                    className="w-3.5 h-3.5 mt-0.5 accent-[#2C2825]"
                                                />
                                                <span className="text-[10px] uppercase font-bold block">{perm.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                    {submitting ? "SAVING..." : "UPDATE PROFILE"}
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
                title="DELETE PERSONNEL ACCOUNT"
                description={`Are you sure you want to permanently delete account ${deleteTarget?.email}? This action revokes all system and administrative access immediately.`}
                confirmText="CONFIRM DELETION"
                cancelText="CANCEL"
                isDestructive={true}
            />
        </section>
    );
}
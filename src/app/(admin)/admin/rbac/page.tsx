"use client";

import React, {useState, useEffect, useRef} from "react";
import {useAuth} from "@/src/context/AuthContext";
import {useApi} from "@/src/context/useApi";
import {useAdmin} from "@/src/context/AdminContext";
import {ShieldAlert, Shield, Edit3, Trash2, Check, Plus} from "lucide-react";
import ConfirmModal from "@/src/components/ConfirmModal";

interface PermissionDoc {
    id: string;
    name: string;
    description: string;
    resource: string;
    action: string;
}

interface RoleDoc {
    id: string;
    name: string;
    description: string;
    permissions: string[];
}

export default function AdminRbacPage() {
    const {user: currentUser, token, loading: authLoading} = useAuth();
    const api = useApi();
    const {isCreateModalOpen, closeCreateModal} = useAdmin();

    const [permissions, setPermissions] = useState<PermissionDoc[]>([]);
    const [roles, setRoles] = useState<RoleDoc[]>([]);
    const [fetching, setFetching] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

    // Modal Edit Targets
    const [editRoleTarget, setEditRoleTarget] = useState<RoleDoc | null>(null);
    const [editPermTarget, setEditPermTarget] = useState<PermissionDoc | null>(null);

    // Deletion Targets
    const [deleteRoleTarget, setDeleteRoleTarget] = useState<RoleDoc | null>(null);
    const [deletePermTarget, setDeletePermTarget] = useState<PermissionDoc | null>(null);

    // Creation Form States
    const [permName, setPermName] = useState("");
    const [permResource, setPermResource] = useState("");
    const [permAction, setPermAction] = useState("");
    const [permDesc, setPermDesc] = useState("");

    const [roleName, setRoleName] = useState("");
    const [roleDesc, setRoleDesc] = useState("");
    const [rolePermissions, setRolePermissions] = useState<string[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const isSuperAdmin = currentUser?.role === "superadmin" || currentUser?.role === "super_admin";

    const fetchRbacData = async () => {
        try {
            setFetching(true);
            setError(null);

            const [permsRes, rolesRes] = await Promise.all([
                api.get("/admin/permissions"),
                api.get("/admin/roles"),
            ]);

            setPermissions(permsRes.data?.data || []);
            setRoles(rolesRes.data?.data || []);
        } catch (err: any) {
            console.error("Failed to fetch RBAC configuration:", err);
            setError(err?.response?.data?.error || err.message || "Failed to load access governance data.");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (authLoading || !token) return;
        if (isSuperAdmin) {
            fetchRbacData();
        } else {
            setFetching(false);
        }
    }, [authLoading, token, isSuperAdmin, api]);

    // Quick Toggle Permission for a Role directly on card
    const handleToggleRolePermission = async (role: RoleDoc, permName: string) => {
        const currentPerms = role.permissions || [];
        const updatedPerms = currentPerms.includes(permName)
            ? currentPerms.filter((p) => p !== permName)
            : [...currentPerms, permName];

        try {
            // Optimistic update locally
            setRoles((prev) =>
                prev.map((r) => (r.id === role.id ? {...r, permissions: updatedPerms} : r))
            );

            await api.put(`/admin/roles/${role.id}`, {permissions: updatedPerms});
        } catch (err: any) {
            console.error("Failed to update role permissions:", err);
            alert("Failed to sync permission state with database.");
            fetchRbacData();
        }
    };

    // Submissions
    const handleCreatePermission = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        try {
            setSubmitting(true);
            const response = await api.post("/admin/permissions", {
                name: permName,
                resource: permResource,
                action: permAction,
                description: permDesc,
            });

            if (response.data?.success) {
                setPermName("");
                setPermResource("");
                setPermAction("");
                setPermDesc("");
                closeCreateModal();
                fetchRbacData();
            }
        } catch (err: any) {
            setFormError(err?.response?.data?.error || "Failed to create permission.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        try {
            setSubmitting(true);
            const response = await api.post("/admin/roles", {
                name: roleName,
                description: roleDesc,
                permissions: rolePermissions,
            });

            if (response.data?.success) {
                setRoleName("");
                setRoleDesc("");
                setRolePermissions([]);
                closeCreateModal();
                fetchRbacData();
            }
        } catch (err: any) {
            setFormError(err?.response?.data?.error || "Failed to create role.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editRoleTarget) return;

        try {
            setSubmitting(true);
            const response = await api.put(`/admin/roles/${editRoleTarget.id}`, {
                name: editRoleTarget.name,
                description: editRoleTarget.description,
                permissions: editRoleTarget.permissions,
            });

            if (response.data?.success) {
                setEditRoleTarget(null);
                fetchRbacData();
            }
        } catch (err: any) {
            alert(err?.response?.data?.error || "Failed to update role.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmDeleteRole = async () => {
        if (!deleteRoleTarget) return;
        try {
            const response = await api.delete(`/admin/roles/${deleteRoleTarget.id}`);
            if (response.data?.success) fetchRbacData();
        } catch (err: any) {
            alert(err?.response?.data?.error || "Failed to delete role.");
        } finally {
            setDeleteRoleTarget(null);
        }
    };

    const handleConfirmDeletePerm = async () => {
        if (!deletePermTarget) return;
        try {
            const response = await api.delete(`/admin/permissions/${deletePermTarget.id}`);
            if (response.data?.success) fetchRbacData();
        } catch (err: any) {
            alert(err?.response?.data?.error || "Failed to delete permission.");
        } finally {
            setDeletePermTarget(null);
        }
    };

    if (!authLoading && !isSuperAdmin) {
        return (
            <div className="py-24 text-center max-w-lg mx-auto space-y-4">
                <div
                    className="w-16 h-16 bg-red-100 text-red-800 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <ShieldAlert className="w-8 h-8"/>
                </div>
                <h2 className="font-serif text-3xl font-light text-[#2C2825] uppercase tracking-tight">
                    ACCESS RESTRICTED
                </h2>
                <p className="text-xs font-mono text-[#5C564D] uppercase leading-relaxed">
                    RBAC governance requires <span
                    className="font-bold text-[#2C2825]">Super Administrator</span> clearance.
                </p>
            </div>
        );
    }

    return (
        <section className="w-full text-[#2C2825] font-sans space-y-6">
            {/* View Switcher */}
            <div className="flex items-center gap-3 border-b border-[#2C2825]/15 pb-4">
                <button
                    onClick={() => setActiveTab("roles")}
                    className={`px-6 py-2.5 rounded-full text-xs font-mono tracking-widest uppercase transition-all font-bold ${
                        activeTab === "roles"
                            ? "bg-[#2C2825] text-[#F4EFEB] shadow-md"
                            : "bg-[#EAE4DA] text-[#5C564D] hover:bg-[#2C2825]/10"
                    }`}
                >
                    ROLES MATRIX ({roles.length})
                </button>
                <button
                    onClick={() => setActiveTab("permissions")}
                    className={`px-6 py-2.5 rounded-full text-xs font-mono tracking-widest uppercase transition-all font-bold ${
                        activeTab === "permissions"
                            ? "bg-[#2C2825] text-[#F4EFEB] shadow-md"
                            : "bg-[#EAE4DA] text-[#5C564D] hover:bg-[#2C2825]/10"
                    }`}
                >
                    PERMISSIONS DICTIONARY ({permissions.length})
                </button>
            </div>

            {fetching && (
                <div className="py-24 text-center">
                    <div
                        className="inline-block w-8 h-8 border-2 border-[#2C2825] border-t-transparent rounded-full animate-spin mb-4"/>
                    <p className="font-serif text-lg tracking-wide text-[#5C564D] uppercase font-light">
                        Loading Access Governance Framework...
                    </p>
                </div>
            )}

            {/* ROLES TAB */}
            {!fetching && activeTab === "roles" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roles.map((role) => (
                        <div key={role.id || role.name}
                             className="bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span
                                        className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">
                                        ROLE DEFINITION
                                    </span>
                                    <h3 className="font-serif text-xl font-bold text-[#2C2825]">
                                        {role.name}
                                    </h3>
                                </div>
                                {!(
                                    role.id.toLowerCase() === "superadmin" ||
                                    role.id.toLowerCase() === "super_admin" ||
                                    role.name.toLowerCase().includes("superadmin") ||
                                    role.name.toLowerCase().includes("super administrator")
                                ) && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEditRoleTarget(role)}
                                            className="p-2 border border-[#2C2825]/20 rounded-xl hover:bg-[#2C2825] hover:text-[#F4EFEB] transition-all"
                                            title="Edit Role"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteRoleTarget(role)}
                                            className="p-2 border border-red-200 text-red-800 rounded-xl hover:bg-red-800 hover:text-white transition-all"
                                            title="Delete Role"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs font-mono text-[#5C564D] leading-relaxed">
                                {role.description || "No description provided."}
                            </p>

                            {/* Granular Permission Toggling Directly on Card */}
                            <div>
                                <span
                                    className="block text-[10px] font-mono tracking-widest text-[#2C2825] uppercase font-bold mb-2">
                                    MANAGE PERMISSIONS ({role.permissions?.length || 0} ACTIVE):
                                </span>
                                <div
                                    className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-3 bg-[#F4EFEB]/60 rounded-2xl border border-[#2C2825]/10">
                                    {permissions.map((perm) => {
                                        const isAssigned = role.permissions?.includes(perm.name);
                                        return (
                                            <button
                                                key={perm.name}
                                                type="button"
                                                onClick={() => handleToggleRolePermission(role, perm.name)}
                                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[9px] font-mono tracking-wider transition-all border ${
                                                    isAssigned
                                                        ? "bg-[#2C2825] text-[#F4EFEB] border-[#2C2825] font-bold"
                                                        : "bg-transparent text-[#5C564D] border-[#2C2825]/15 hover:border-[#2C2825]"
                                                }`}
                                            >
                                                <span className="truncate">{perm.name}</span>
                                                {isAssigned && <Check className="w-3 h-3 text-[#C5A880]"/>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* PERMISSIONS TAB */}
            {!fetching && activeTab === "permissions" && (
                <div
                    className="overflow-x-auto bg-[#EAE4DA]/70 border border-[#2C2825]/15 rounded-3xl shadow-sm backdrop-blur-md">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-[#2C2825]/15 text-[10px] font-mono tracking-widest text-[#5C564D] uppercase">
                            <th className="py-5 px-6 font-medium">PERMISSION KEY</th>
                            <th className="py-5 px-6 font-medium">RESOURCE</th>
                            <th className="py-5 px-6 font-medium">ACTION</th>
                            <th className="py-5 px-6 font-medium">DESCRIPTION</th>
                            <th className="py-5 px-6 font-medium text-center">ACTIONS</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2C2825]/10 text-xs font-mono">
                        {permissions.map((perm) => (
                            <tr key={perm.id || perm.name} className="hover:bg-[#2C2825]/5 transition-colors">
                                <td className="py-4 px-6 font-bold text-[#2C2825]">{perm.name}</td>
                                <td className="py-4 px-6 uppercase text-[#5C564D]">{perm.resource}</td>
                                <td className="py-4 px-6 uppercase text-[#5C564D]">{perm.action}</td>
                                <td className="py-4 px-6 text-[#5C564D]">{perm.description}</td>
                                <td className="py-4 px-6 text-center">
                                    <button
                                        onClick={() => setDeletePermTarget(perm)}
                                        className="p-2 border border-red-200 text-red-800 rounded-xl hover:bg-red-800 hover:text-white transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CREATE MODAL */}
            {isCreateModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div
                        className="bg-[#F4EFEB] border border-[#2C2825]/20 max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl text-[#2C2825] space-y-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-[#2C2825]/15 pb-4">
                            <div>
                                <span
                                    className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase font-bold">
                                    GOVERNANCE REGISTRATION
                                </span>
                                <h3 className="font-serif text-2xl font-light text-[#2C2825]">
                                    NEW RBAC DEFINITION
                                </h3>
                            </div>
                            <button
                                onClick={closeCreateModal}
                                className="w-8 h-8 rounded-full bg-[#2C2825]/10 hover:bg-[#2C2825] hover:text-[#F4EFEB] flex items-center justify-center transition-colors text-xs font-mono"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <div
                                className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-xl text-xs font-mono">
                                {formError}
                            </div>
                        )}

                        <div className="flex gap-2 bg-[#EAE4DA] p-1.5 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => setActiveTab("roles")}
                                className={`flex-1 py-2 text-xs font-mono uppercase rounded-xl font-bold transition-all ${
                                    activeTab === "roles" ? "bg-[#2C2825] text-[#F4EFEB]" : "text-[#5C564D]"
                                }`}
                            >
                                Create Role
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("permissions")}
                                className={`flex-1 py-2 text-xs font-mono uppercase rounded-xl font-bold transition-all ${
                                    activeTab === "permissions" ? "bg-[#2C2825] text-[#F4EFEB]" : "text-[#5C564D]"
                                }`}
                            >
                                Create Permission
                            </button>
                        </div>

                        {activeTab === "roles" ? (
                            <form onSubmit={handleCreateRole} className="space-y-4 font-mono text-xs">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        ROLE NAME *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        placeholder="e.g. Master Curator"
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        DESCRIPTION
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={roleDesc}
                                        onChange={(e) => setRoleDesc(e.target.value)}
                                        placeholder="Role description..."
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                                <div className="flex justify-end pt-4 border-t border-[#2C2825]/15">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-3 rounded-full bg-[#2C2825] text-[#F4EFEB] hover:bg-[#4A433E] text-xs font-bold uppercase shadow-md"
                                    >
                                        {submitting ? "SAVING..." : "SAVE ROLE"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleCreatePermission} className="space-y-4 font-mono text-xs">
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        PERMISSION KEY (e.g. resource.action) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={permName}
                                        onChange={(e) => setPermName(e.target.value)}
                                        placeholder="catalog.export"
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                            RESOURCE *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={permResource}
                                            onChange={(e) => setPermResource(e.target.value)}
                                            placeholder="catalog"
                                            className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                            ACTION *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={permAction}
                                            onChange={(e) => setPermAction(e.target.value)}
                                            placeholder="export"
                                            className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">
                                        DESCRIPTION
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={permDesc}
                                        onChange={(e) => setPermDesc(e.target.value)}
                                        placeholder="Permission description..."
                                        className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none focus:border-[#2C2825]"
                                    />
                                </div>
                                <div className="flex justify-end pt-4 border-t border-[#2C2825]/15">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-3 rounded-full bg-[#2C2825] text-[#F4EFEB] hover:bg-[#4A433E] text-xs font-bold uppercase shadow-md"
                                    >
                                        {submitting ? "SAVING..." : "SAVE PERMISSION"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* EDIT ROLE MODAL */}
            {editRoleTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div
                        className="bg-[#F4EFEB] border border-[#2C2825]/20 max-w-xl w-full rounded-3xl p-8 shadow-2xl text-[#2C2825] space-y-6">
                        <div className="flex items-center justify-between border-b border-[#2C2825]/15 pb-4">
                            <h3 className="font-serif text-2xl font-light text-[#2C2825]">
                                EDIT ROLE: {editRoleTarget.name}
                            </h3>
                            <button onClick={() => setEditRoleTarget(null)} className="text-xs font-mono">✕</button>
                        </div>
                        <form onSubmit={handleUpdateRole} className="space-y-4 font-mono text-xs">
                            <div>
                                <label className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">ROLE
                                    NAME</label>
                                <input
                                    type="text"
                                    required
                                    value={editRoleTarget.name}
                                    onChange={(e) => setEditRoleTarget({...editRoleTarget, name: e.target.value})}
                                    className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label
                                    className="block text-[10px] tracking-widest text-[#5C564D] uppercase mb-1">DESCRIPTION</label>
                                <textarea
                                    rows={2}
                                    value={editRoleTarget.description}
                                    onChange={(e) => setEditRoleTarget({
                                        ...editRoleTarget,
                                        description: e.target.value
                                    })}
                                    className="w-full bg-[#EAE4DA] border border-[#2C2825]/20 rounded-xl p-3 focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-[#2C2825]/15">
                                <button type="button" onClick={() => setEditRoleTarget(null)}
                                        className="px-6 py-2.5 border rounded-full">CANCEL
                                </button>
                                <button type="submit" disabled={submitting}
                                        className="px-6 py-2.5 bg-[#2C2825] text-[#F4EFEB] rounded-full font-bold">UPDATE
                                    ROLE
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CONFIRMATION MODALS */}
            <ConfirmModal
                isOpen={!!deleteRoleTarget}
                onClose={() => setDeleteRoleTarget(null)}
                onConfirm={handleConfirmDeleteRole}
                title="DELETE ROLE DEFINITION"
                description={`Are you sure you want to delete role '${deleteRoleTarget?.name}'? Personnel currently assigned to this role will lose their mapped permissions.`}
                confirmText="CONFIRM DELETION"
                isDestructive={true}
            />

            <ConfirmModal
                isOpen={!!deletePermTarget}
                onClose={() => setDeletePermTarget(null)}
                onConfirm={handleConfirmDeletePerm}
                title="DELETE PERMISSION"
                description={`Are you sure you want to delete permission key '${deletePermTarget?.name}' from the global dictionary?`}
                confirmText="CONFIRM DELETION"
                isDestructive={true}
            />
        </section>
    );
}
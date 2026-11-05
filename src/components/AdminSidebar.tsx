"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    FolderTree,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Shield,
    AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import AdminModal from "@/src/components/ConfirmModal";
import ConfirmModal from "@/src/components/ConfirmModal";

export interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    permission?: string;
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const navItems: NavItem[] = [
        {
            label: "DASHBOARD",
            href: "/admin",
            icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
        },
        {
            label: "ORDERS",
            href: "/admin/orders",
            icon: <ShoppingBag className="w-5 h-5 flex-shrink-0" />,
            permission: "orders.readAll",
        },
        {
            label: "CATEGORIES",
            href: "/admin/categories",
            icon: <FolderTree className="w-5 h-5 flex-shrink-0" />,
            permission: "categories.read",
        },
        {
            label: "PRODUCTS",
            href: "/admin/products",
            icon: <Package className="w-5 h-5 flex-shrink-0" />,
            permission: "products.read",
        },
        {
            label: "USERS",
            href: "/admin/users",
            icon: <Users className="w-5 h-5 flex-shrink-0" />,
            permission: "users.readAll",
        },
        {
            label: "ROLES",
            href: "/admin/rbac",
            icon: <Settings className="w-5 h-5 flex-shrink-0" />,
            permission: "users.readAll",
        },
    ];

    const userPermissions: string[] = user?.permissions || [];
    const isSuperAdmin = user?.role === "superadmin" || user?.role === "super_admin";

    const allowedNavItems = navItems.filter((item) => {
        if (isSuperAdmin) return true;
        if (!item.permission) return true;
        return userPermissions.includes(item.permission);
    });


    return (
        <>
            {/* Sidebar Shell Container */}
            <aside
                className={`relative min-h-screen bg-[#EAE4DA] border-r border-[#2C2825]/15 text-[#2C2825] transition-all duration-300 ease-in-out flex flex-col justify-between select-none shadow-sm z-30 ${
                    isCollapsed ? "w-20" : "w-64"
                }`}
            >
                {/* Top Section Group */}
                <div className="flex flex-col w-full">
                    {/* Brand Header */}
                    <div className="h-20 border-b border-[#2C2825]/15 flex items-center justify-between px-5 gap-2">
                        <div className="flex items-center gap-2 overflow-hidden min-w-0">
                            {isCollapsed ? (
                                <div className="w-10 flex justify-center items-center mx-auto transition-transform duration-200 hover:scale-110">
                                    <Shield className="w-6 h-6 text-[#C5A880]" />
                                </div>
                            ) : (
                                <Link href="/admin" className="flex items-center gap-2 min-w-0 transition-opacity duration-200">
                                    <span className="font-serif text-lg font-bold tracking-widest uppercase text-[#2C2825] truncate">
                                        AURORA
                                    </span>
                                    <span className="bg-[#2C2825] text-[#F4EFEB] text-[8px] font-mono tracking-wider px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap">
                                        ATELIER
                                    </span>
                                </Link>
                            )}
                        </div>

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 rounded-xl border border-[#2C2825]/20 bg-[#F4EFEB]/40 hover:bg-[#2C2825] hover:text-[#F4EFEB] transition-all duration-200 shadow-sm flex-shrink-0"
                            aria-label="Toggle Navigation Sidebar"
                        >
                            {isCollapsed ? (
                                <ChevronRight className="w-4 h-4" />
                            ) : (
                                <ChevronLeft className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {/* Navigation Items Group */}
                    <nav className="p-4 space-y-2">
                        {allowedNavItems.map((item) => {
                            const isActive =
                                item.href === "/admin"
                                    ? pathname === "/admin"
                                    : pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`flex items-center rounded-xl text-xs font-mono tracking-widest uppercase transition-all duration-200 group relative ${
                                        isCollapsed ? "justify-center p-3" : "px-4 py-3 gap-3.5"
                                    } ${
                                        isActive
                                            ? "bg-[#2C2825] text-[#F4EFEB] shadow-sm font-semibold"
                                            : "text-[#2C2825]/80 hover:bg-[#2C2825]/10 hover:text-[#2C2825]"
                                    }`}
                                >
                                    <span className={`transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-[#C5A880]" : "text-[#2C2825]/70"}`}>
                                        {item.icon}
                                    </span>

                                    <span
                                        className={`transition-all duration-200 truncate ${
                                            isCollapsed
                                                ? "w-0 opacity-0 pointer-events-none absolute hidden"
                                                : "w-auto opacity-100"
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Account & Actions Division Block */}
                <div className="p-4 border-t border-[#2C2825]/15 space-y-3 bg-[#2C2825]/5">
                    {!isCollapsed && user && (
                        <div className="bg-[#F4EFEB]/90 border border-[#2C2825]/15 rounded-xl p-3 flex items-center justify-between shadow-sm transition-opacity duration-200">
                            <div className="truncate pr-2">
                                <span className="block font-serif text-xs font-semibold text-[#2C2825] truncate">
                                    {user.displayName || "Admin User"}
                                </span>
                                <span className="block text-[9px] font-mono tracking-widest text-[#5C564D] uppercase mt-0.5">
                                    ROLE: {user.role || "ADMIN"}
                                </span>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0 animate-pulse" />
                        </div>
                    )}

                    <button
                        onClick={() => setShowLogoutModal(true)}
                        title={isCollapsed ? "Sign Out" : undefined}
                        className={`w-full flex items-center rounded-xl text-xs font-mono tracking-widest uppercase text-red-800 bg-red-50/40 border border-red-200/50 hover:bg-red-100/80 transition-all duration-200 font-semibold ${
                            isCollapsed ? "justify-center p-3" : "px-4 py-3 gap-3.5"
                        }`}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span
                            className={`transition-all duration-200 ${
                                isCollapsed
                                    ? "w-0 opacity-0 pointer-events-none absolute hidden"
                                    : "w-auto opacity-100"
                            }`}
                        >
                            SIGN OUT
                        </span>
                    </button>
                </div>
            </aside>

            <ConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={logout}
                title="CONFIRM SIGN OUT"
                description="Are you sure you want to log out of the Aurora Atelier management platform? You will need to sign in again to access administrative features."
                confirmText="CONFIRM LOGOUT"
                cancelText="CANCEL"
                isDestructive={true}
            />
        </>
    );
}
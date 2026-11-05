"use client";

import React from "react";
import {usePathname} from "next/navigation";
import {Plus, Download} from "lucide-react";
import {useAdmin} from "@/src/context/AdminContext";

interface HeaderConfigItem {
    title: string;
    subtitle: string;
    action?: {
        label: string;
        type: "modal" | "custom";
        onClick?: () => void;
        icon?: React.ReactNode;
    };
}

export default function AdminHeader() {
    const pathname = usePathname();
    const {openCreateModal} = useAdmin();

    // Path-based lookup dictionary mapping actions to modal triggers
    const HEADER_CONFIG: Record<string, HeaderConfigItem> = {
        "/admin": {
            title: "ATELIER OVERVIEW",
            subtitle: "ADMIN MANAGEMENT PORTAL",
        },
        "/admin/orders": {
            title: "ATELIER ORDERS ARCHIVE",
            subtitle: "ADMIN MANAGEMENT PORTAL",
            action: {
                label: "EXPORT DOSSIERS",
                type: "custom",
                icon: <Download className="w-3.5 h-3.5"/>,
                onClick: () => alert("Exporting orders archive..."),
            },
        },
        "/admin/products": {
            title: "LUXURY CREATIONS",
            subtitle: "PRODUCT INVENTORY MANAGEMENT",
            action: {
                label: "NEW CREATION",
                type: "modal", // Triggers layout/page modal state
                icon: <Plus className="w-3.5 h-3.5"/>,
            },
        },
        "/admin/categories": {
            title: "ATELIER CATEGORIES",
            subtitle: "COLLECTION TAXONOMY",
            action: {
                label: "ADD CATEGORY",
                type: "modal", // Triggers layout/page modal state
                icon: <Plus className="w-3.5 h-3.5"/>,
            },
        },
        "/admin/users": {
            title: "CLIENT & ADMIN ROLES",
            subtitle: "ACCESS CONTROL MANAGEMENT",
            action: {
                label: "ADD USER",
                type: "modal",
                icon: <Plus className="w-3.5 h-3.5"/>,
            },
        },
        "/admin/rbac": {
            title: "ROLE & PERMISSION MATRIX",
            subtitle: "ACCESS CONTROL GOVERNANCE",
            action: {
                label: "NEW DEFINITION",
                type: "modal",
                icon: <Plus className="w-3.5 h-3.5"/>,
            },
        },
    };

    const currentConfig = HEADER_CONFIG[pathname] || {
        title: "ADMINISTRATION PORTAL",
        subtitle: "AURORA MAISON",
    };

    return (
        <div
            className="border-b border-[#2C2825]/20 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <span className="text-[10px] sm:text-xs tracking-widest text-[#5C564D] uppercase font-mono">
                    {currentConfig.subtitle}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-light tracking-tight uppercase text-[#2C2825]">
                    {currentConfig.title}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {currentConfig.action && (
                    <button
                        onClick={
                            currentConfig.action.type === "modal"
                                ? openCreateModal
                                : currentConfig.action.onClick
                        }
                        className="inline-flex items-center gap-2 bg-[#2C2825] text-[#F4EFEB] hover:bg-[#4A433E] px-5 py-2.5 rounded-full text-xs font-mono tracking-widest uppercase transition-all shadow-sm cursor-pointer"
                    >
                        {currentConfig.action.icon}
                        {currentConfig.action.label}
                    </button>
                )}
            </div>
        </div>
    );
}
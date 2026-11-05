"use client";

import React from "react";
import AdminSidebar from "@/src/components/AdminSidebar";
import AdminHeader from "@/src/components/AdminHeader";
import { AdminProvider } from "@/src/context/AdminContext";
import "@/src/app/(admin)/globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminProvider>
            <div className="flex min-h-screen bg-[#F4EFEB] text-[#2C2825]">
                <AdminSidebar />
                <main className="flex-1 p-8 overflow-y-auto">
                    <AdminHeader />
                    {children}
                </main>
            </div>
        </AdminProvider>
    );
}
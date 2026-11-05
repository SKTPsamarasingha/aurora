"use client";

import React, { createContext, useContext, useState } from "react";

interface AdminContextType {
    isCreateModalOpen: boolean;
    openCreateModal: () => void;
    closeCreateModal: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => setIsCreateModalOpen(false);

    return (
        <AdminContext.Provider value={{ isCreateModalOpen, openCreateModal, closeCreateModal }}>
            {children}
        </AdminContext.Provider>
    );
}

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
};
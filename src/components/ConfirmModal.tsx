"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function ConfirmModal({
                                       isOpen,
                                       onClose,
                                       onConfirm,
                                       title,
                                       description,
                                       confirmText = "CONFIRM",
                                       cancelText = "CANCEL",
                                       isDestructive = true,
                                   }: AdminModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div
                className="bg-[#F4EFEB] border border-[#2C2825]/20 max-w-md w-full rounded-3xl p-8 shadow-2xl text-[#2C2825] space-y-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-4">
                    <div
                        className={`p-3.5 rounded-2xl flex-shrink-0 shadow-inner ${
                            isDestructive ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}
                    >
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                        <h3 className="font-serif text-xl font-light tracking-tight uppercase text-[#2C2825]">
                            {title}
                        </h3>
                        <p className="text-xs font-mono text-[#5C564D] leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2825]/15">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-full border border-[#2C2825]/20 hover:bg-[#2C2825]/10 text-xs font-mono tracking-widest uppercase transition-all duration-200 font-semibold text-[#2C2825]"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-6 py-3 rounded-full text-xs font-mono tracking-widest uppercase transition-all duration-200 font-bold shadow-lg ${
                            isDestructive
                                ? "bg-red-800 text-[#F4EFEB] hover:bg-red-900"
                                : "bg-[#2C2825] text-[#F4EFEB] hover:bg-[#4A433E]"
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
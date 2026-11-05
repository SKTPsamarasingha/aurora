"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search } from "lucide-react";
import MenuDrawer from "@/src/components/MenuDrawer";
import SearchBar from "@/src/components/SearchBar";
import CartDrawer from "@/src/components/CartDrawer";
import { useCart } from "@/src/context/CartContext";
import {usePathname} from "next/navigation";

interface NavbarProps {
    companyName?: string;
}

export default function Navbar({ companyName = "AURORA" }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Cart Context Integration
    const { totalItems, setIsCartOpen } = useCart();
    const pathname = usePathname();

    // Completely hide the footer on admin routes
    if (pathname.startsWith('/admin')) {
        return null;
    }
    return (
        <>
            <header className="sticky top-0 z-40 w-full h-20 flex items-center justify-between px-6 md:px-12 bg-background/80 backdrop-blur-md ">
                {/* Left Cluster: Menu Trigger & Brand Name */}
                <div className="flex items-center gap-4 md:gap-6">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Toggle Menu"
                        className="flex flex-col justify-center gap-1.5 w-6 h-6 focus:outline-none group"
                    >
                        <span className="w-6 h-[2px] bg-foreground group-hover:bg-white transition-colors duration-300 rounded-full" />
                        <span className="w-4 h-[2px] bg-foreground group-hover:bg-white transition-colors duration-300 rounded-full group-hover:w-6" />
                    </button>

                    <div className="select-none">
                        <Link
                            href="/"
                            className="font-heading text-xl md:text-2xl font-bold tracking-wider hover:text-white transition-colors duration-500 inline-flex whitespace-nowrap text-foreground"
                        >
                            {companyName}
                        </Link>
                    </div>
                </div>

                {/* Right Cluster: Search and Cart Triggers */}
                <div className="flex items-center gap-1 md:gap-2">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        aria-label="Open Search"
                        className="p-2 text-foreground hover:text-white transition-colors focus:outline-none rounded-full hover:bg-foreground/5"
                    >
                        <Search className="w-5 h-5 md:w-6 h-6" />
                    </button>

                    <button
                        onClick={() => setIsCartOpen(true)}
                        aria-label="Shopping Bag"
                        className="relative p-2 text-foreground hover:text-white transition-colors focus:outline-none rounded-full hover:bg-foreground/5"
                    >
                        <ShoppingBag className="w-5 h-5 md:w-6 h-6" />
                        {totalItems > 0 && (
                            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white shadow-md transform translate-x-1/4 -translate-y-1/4 select-none">
                {totalItems}
              </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Drawer Components */}
            <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <CartDrawer />
        </>
    );
}

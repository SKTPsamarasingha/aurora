'use client';
import React, {useEffect, useState} from "react";
import {usePathname} from "next/navigation";

interface FooterProps {
    companyName?: string;
}

export default function Footer({companyName = "AURORA"}: FooterProps) {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [currentYear, setCurrentYear] = useState<number | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    const categoryLinks = [
        {name: "Rings", href: "#rings"},
        {name: "Earrings", href: "#earrings"},
        {name: "Necklaces", href: "#necklaces"},
        {name: "Bracelets", href: "#bracelets"},
        {name: "High Jewelry", href: "#high-jewelry"},
    ];

    const navLinks = [
        {name: "Our Story", href: "#story"},
        {name: "Materials & Craft", href: "#materials"},
        {name: "Sustainability", href: "#sustainability"},
        {name: "Bespoke Services", href: "#bespoke"},
        {name: "Shipping & Returns", href: "#shipping"},
        {name: "Contact Us", href: "#contact"},
    ];

    const legalLinks = [
        {name: "Privacy Policy", href: "#privacy"},
        {name: "Terms of Service", href: "#terms"},
        {name: "Cookie Settings", href: "#cookies"},
    ];

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
            setTimeout(() => setSubscribed(false), 5000);
        }
    };

    // Completely hide the footer on admin routes
    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <footer
            className="w-full bg-[#DCD6CE] text-[#2C2825] font-sans pt-16 pb-8 px-6 sm:px-12 lg:px-20 border-t border-[#2C2825]/15 select-none overflow-hidden">
            <div className="max-w-7xl mx-auto w-full space-y-16">
                {/* Oversized Statement Brand Name Hero Header */}
                <div className="py-6 text-center overflow-hidden">
                    <h1 className="font-serif text-6xl sm:text-8xl md:text-[10rem] lg:text-[12.5rem] leading-none tracking-[0.15em] sm:tracking-[0.2em] font-light text-[#2C2825] uppercase opacity-90 hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                        {companyName}
                    </h1>
                </div>


                {/* Top Section: Navigation Columns & Newsletter Signup */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-12 border-b border-[#2C2825]/15">

                    {/* Column 1: Collections (4 cols) */}
                    <div className="lg:col-span-3 space-y-4">
                        <span
                            className="text-[10px] font-mono tracking-[0.25em] text-[#C5A880] uppercase font-bold block">
                            COLLECTIONS
                        </span>
                        <ul className="space-y-2.5 font-serif text-sm sm:text-base">
                            {categoryLinks.map((item, index) => (
                                <li key={index}>
                                    <a
                                        href={item.href}
                                        className="inline-block text-[#2C2825] hover:text-[#C5A880] hover:translate-x-1 transition-all duration-300"
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 2: Maison & Service (4 cols) */}
                    <div className="lg:col-span-4 space-y-4">
                        <span
                            className="text-[10px] font-mono tracking-[0.25em] text-[#C5A880] uppercase font-bold block">
                            MAISON & ATELIER
                        </span>
                        <ul className="space-y-2.5 text-xs sm:text-sm font-light">
                            {navLinks.map((item, index) => (
                                <li key={index}>
                                    <a
                                        href={item.href}
                                        className="inline-block text-[#2C2825]/80 hover:text-[#2C2825] transition-colors duration-300"
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Newsletter & Social Connection (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="space-y-2">
                            <span
                                className="text-[10px] font-mono tracking-[0.25em] text-[#C5A880] uppercase font-bold block">
                                THE ATELIER GAZETTE
                            </span>
                            <h4 className="font-serif text-lg sm:text-xl font-light text-[#2C2825]">
                                Subscribe for private collection previews and curated stories.
                            </h4>
                        </div>

                        {subscribed ? (
                            <div
                                className="p-3.5 bg-[#2C2825] text-[#F4EFEB] rounded-xl text-xs font-mono tracking-wider uppercase text-center border border-[#C5A880]/30 animate-fadeIn">
                                THANK YOU FOR SUBSCRIBING TO AURORA.
                            </div>
                        ) : (
                            <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address..."
                                    className="w-full bg-[#F4EFEB]/60 border border-[#2C2825]/20 rounded-full px-5 py-3 text-xs font-mono placeholder-[#5C564D] focus:outline-none focus:border-[#2C2825] transition-all"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 rounded-full bg-[#2C2825] text-[#F4EFEB] hover:bg-[#4A433E] text-xs font-mono tracking-widest uppercase transition-all duration-300 shrink-0 font-bold shadow-sm"
                                >
                                    JOIN
                                </button>
                            </form>
                        )}

                        {/* Social Icons Row */}
                        <div className="pt-2 flex items-center gap-3">
                            <span className="text-[10px] font-mono tracking-widest text-[#5C564D] uppercase mr-2">
                                CONNECT:
                            </span>
                            <a
                                href="#instagram"
                                aria-label="Instagram"
                                className="w-9 h-9 rounded-full border border-[#2C2825]/20 flex items-center justify-center hover:bg-[#2C2825] hover:text-[#DCD6CE] hover:border-[#2C2825] transition-all duration-300"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none"
                                          stroke="currentColor" strokeWidth="2"/>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none"
                                          stroke="currentColor" strokeWidth="2"/>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2"
                                          strokeLinecap="round"/>
                                </svg>
                            </a>
                            <a
                                href="#pinterest"
                                aria-label="Pinterest"
                                className="w-9 h-9 rounded-full border border-[#2C2825]/20 flex items-center justify-center hover:bg-[#2C2825] hover:text-[#DCD6CE] hover:border-[#2C2825] transition-all duration-300"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path
                                        d="M12 2a10 10 0 0 0-3.62 19.33c-.13-.83-.25-2.11.05-3.02l.64-2.73s-.16-.33-.16-.83c0-.78.45-1.37 1.02-1.37.48 0 .71.36.71.79 0 .48-.31 1.2-.47 1.87-.13.56.28 1.02.83 1.02 1 0 1.77-1.05 1.77-2.57 0-1.34-.96-2.28-2.33-2.28-1.59 0-2.53 1.19-2.53 2.42 0 .48.18 1 .41 1.28.05.06.06.11.04.25l-.17.69c-.03.11-.11.13-.25.06-0.94-.43-1.53-1.78-1.53-2.87 0-2.34 1.7-4.5 4.91-4.5 2.58 0 4.59 1.84 4.59 4.29 0 2.56-1.62 4.62-3.87 4.62-.76 0-1.47-.4-1.71-.87l-.47 1.79c-.17.65-.63 1.46-.94 1.95A10 10 0 1 0 12 2z"/>
                                </svg>
                            </a>
                            <a
                                href="#facebook"
                                aria-label="Facebook"
                                className="w-9 h-9 rounded-full border border-[#2C2825]/20 flex items-center justify-center hover:bg-[#2C2825] hover:text-[#DCD6CE] hover:border-[#2C2825] transition-all duration-300"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>


                {/* Bottom Row: Legal Links & Copyright */}
                <div
                    className="pt-8 border-t border-[#2C2825]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs font-mono text-[#2C2825]/70">
                    <p className="uppercase tracking-widest font-light">
                        &copy; {currentYear ?? ""} {companyName} MAISON & JEWELRY ATELIER. ALL RIGHTS RESERVED.
                    </p>

                    <div className="flex items-center gap-6">
                        {legalLinks.map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                className="uppercase tracking-widest hover:text-[#2C2825] transition-colors duration-300"
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    );
}
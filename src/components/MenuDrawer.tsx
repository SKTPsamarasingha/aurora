 "use client";

import React, {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {
    X,
    User,
    Package,
} from "lucide-react";
import gsap from "gsap";

interface MenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    userRole?: string;
}

const navigationData = {
    engagement_rings: {
        label: "Engagement Rings",
        sections: {
            styles: {
                title: "Shop By Style",
                items: [
                    "Solitaire",
                    "Three Stone",
                    "Halo",
                    "Vintage",
                    "Side Stone",
                    "Unique",
                    "Nature Inspired",
                ],
            },
            shop_by_shape: {
                title: "Shop By Shape",
                items: [
                    "Oval",
                    "Emerald",
                    "Marquise",
                    "Round",
                    "Cushion",
                    "Pear",
                    "Radiant",
                    "Princess",
                    "Heart",
                ],
            },
            shop_by_stone: {
                title: "Shop By Stone",
                items: [
                    "Diamond",
                    "Blue Sapphire",
                    "Pink Sapphire",
                    "Yellow Sapphire",
                    "Teal Sapphire",
                    "Padparadscha",
                    "Aquamarine",
                    "Emerald",
                    "Ruby",
                ],
            },
        },
    },
    wedding_jewellery: {
        label: "Wedding Jewellery",
        sections: {
            women: {
                title: "Women's Wedding",
                items: [
                    "Women's Wedding Ring",
                    "Eternity Rings",
                    "Anniversary Rings",
                    "Yellow Gold",
                    "White Gold",
                    "Rose Gold",
                    "Platinum",
                    "Silver",
                ],
            },
            men: {
                title: "Men's Wedding",
                items: [
                    "Men's Wedding Band",
                    "Yellow Gold",
                    "White Gold",
                    "Rose Gold",
                    "Platinum",
                    "Silver",
                ],
            },
        },
    },
    jewellery: {
        label: "Fine Jewellery",
        sections: {
            categories_1: {
                title: "Rings & Pendants",
                items: [
                    "Wedding Rings",
                    "Diamond Rings",
                    "Blue Sapphire Rings",
                    "Stackable Rings",
                    "Pendant",
                    "Religious Pendants",
                    "Customised Fonts",
                    "Diamond Pendants",
                ],
            },
            categories_2: {
                title: "Earrings & Bracelets",
                items: [
                    "Earrings",
                    "Stud Earrings",
                    "Diamond Earrings",
                    "Bracelet",
                    "Classic Gold Bracelets",
                    "Tennis Bracelets",
                    "Silver Bracelets",
                ],
            },
            categories_3: {
                title: "Accessories",
                items: [
                    "Classic Gold Bangles",
                    "Necklace",
                    "Men's Cufflinks",
                    "Initial Cufflinks",
                    "Blue Sapphire Cufflinks",
                ],
            },
        },
    },
};

const brandSidebarLinks = [
    {label: "Home", href: "/"},
    {label: "Our Story", href: "/about"},
    {label: "Contact", href: "/contact"},
];

export default function MenuDrawer({
                                       isOpen,
                                       onClose,
                                       userRole,
                                   }: MenuDrawerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);
    const contentAreaRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const gridContentRef = useRef<HTMLDivElement>(null);
    const brandCenterRef = useRef<HTMLDivElement>(null);

    // True only after the background panels are fully rendered
    const [contentReady, setContentReady] = useState(false);

    // Active mega tab selector state
    const [activeTab, setActiveTab] =
        useState<keyof typeof navigationData>("engagement_rings");

    // Dynamic ref handling text animations
    const sidebarLettersRef = useRef<(HTMLSpanElement | null)[][]>(
        brandSidebarLinks.map(() => [])
    );
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    // Animate grid items (on open, and on every tab change) only after panels are rendered
    useEffect(() => {
        if (!contentReady || !gridContentRef.current) return;

        const ctx = gsap.context(() => {
            const gridTl = gsap.timeline();

            // Each section column slides in one after another
            gridTl.fromTo(
                ".grid-section",
                {opacity: 0, x: 60},
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    stagger: 0.14,
                    ease: "power3.out",
                    delay: 0.15,
                }
            );

            // Then the titles and links inside each section
            gridTl.fromTo(
                ".grid-animate-item",
                {opacity: 0, y: 15},
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.02,
                    ease: "power2.out",
                },
                0.25
            );
        }, gridContentRef);

        return () => ctx.revert();
    }, [activeTab, contentReady]);

    // Master open / close timeline
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                paused: true,
                defaults: {ease: "power4.inOut"},
                onReverseComplete: () => setContentReady(false),
            });

            // 1. INITIAL HIDE: nothing shows until the background panels are fully rendered
            gsap.set(containerRef.current, {pointerEvents: "none"});

            gsap.set(leftPanelRef.current, {
                clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
            });
            gsap.set(rightPanelRef.current, {
                clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
            });

            gsap.set(
                [closeBtnRef.current, contentAreaRef.current, footerRef.current],
                {autoAlpha: 0}
            );

            // Side sections start off-screen and hidden
            gsap.set(".slide-left", {autoAlpha: 0, x: -60});
            gsap.set(".slide-right", {autoAlpha: 0, x: 60});

            // Dividing lines start collapsed
            gsap.set(".draw-line-x", {scaleX: 0, transformOrigin: "left center"});
            gsap.set(".draw-line-y", {scaleY: 0, transformOrigin: "center top"});
            gsap.set(".footer-line", {scaleX: 0, transformOrigin: "left center"});

            const letters = sidebarLettersRef.current.flat().filter(Boolean);
            gsap.set(letters, {yPercent: 110, rotateZ: 3});
            gsap.set(footerRef.current, {y: 30});

            // 2. PANEL REVEAL SEQUENCE
            tl.addLabel("panels")
                .to(
                    containerRef.current,
                    {autoAlpha: 1, pointerEvents: "auto", duration: 0.05},
                    "panels"
                )
                .to(
                    leftPanelRef.current,
                    {
                        clipPath: "polygon(0% 0%, 100% 0%, 0% 100%, 0% 100%)",
                        duration: 0.55,
                        ease: "power3.in",
                    },
                    "panels"
                )
                .to(
                    rightPanelRef.current,
                    {
                        clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 0% 100%)",
                        duration: 0.55,
                        ease: "power3.in",
                    },
                    "panels"
                )
                .to(
                    [leftPanelRef.current, rightPanelRef.current],
                    {
                        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                        duration: 0.45,
                        ease: "power4.out",
                    },
                    ">"
                )

                // 3. CONTENT REVEAL: only after the panels are fully rendered
                .addLabel("content", ">+=0.05")
                .call(
                    () => {
                        if (!tl.reversed()) setContentReady(true);
                    },
                    undefined,
                    "content"
                )
                .to(
                    [closeBtnRef.current, contentAreaRef.current],
                    {autoAlpha: 1, duration: 0.3},
                    "content"
                )

                // Sections slide in: tab list from the left, navigation from the right
                .to(
                    ".slide-left",
                    {autoAlpha: 1, x: 0, duration: 0.9, ease: "power3.out"},
                    "content"
                )
                .to(
                    ".slide-right",
                    {autoAlpha: 1, x: 0, duration: 0.9, ease: "power3.out"},
                    "content+=0.35"
                )

                // Dividing lines draw across the sections
                .to(
                    ".draw-line-y",
                    {scaleY: 1, duration: 0.8, ease: "power3.inOut", stagger: 0.1},
                    "content"
                )
                .to(
                    ".draw-line-x",
                    {scaleX: 1, duration: 0.8, ease: "power3.inOut", stagger: 0.1},
                    "content+=0.1"
                )

                // Sidebar brand letters
                .to(
                    letters,
                    {
                        yPercent: 0,
                        rotateZ: 0,
                        duration: 0.7,
                        stagger: 0.015,
                        ease: "power3.out",
                    },
                    "content+=0.1"
                )

                // 4. FOOTER BAR RENDERS LAST (with its own animated line)
                .addLabel("footer", ">+=0.1")
                .to(
                    ".footer-line",
                    {scaleX: 1, duration: 0.7, ease: "power3.inOut"},
                    "footer"
                )
                .to(
                    footerRef.current,
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power2.out",
                    },
                    "footer"
                );

            timelineRef.current = tl;
        }, containerRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (timelineRef.current) {
            if (isOpen) {
                timelineRef.current.play();
            } else {
                timelineRef.current.reverse();
            }
        }
    }, [isOpen]);

    // Hover animation for "AURORA since 2022" center text
    const handleBrandHoverEnter = () => {
        if (brandCenterRef.current) {
            gsap.to(brandCenterRef.current, {
                letterSpacing: "0.25em",
                color: "#B89232", // Gold
                duration: 0.4,
                ease: "power2.out",
            });
        }
    };

    const handleBrandHoverLeave = () => {
        if (brandCenterRef.current) {
            gsap.to(brandCenterRef.current, {
                letterSpacing: "0.15em",
                color: "rgba(255, 255, 255, 0.7)",
                duration: 0.4,
                ease: "power2.out",
            });
        }
    };

    return (
        <div
            ref={containerRef}
            className="opacity-0 invisible fixed inset-0 z-50 flex flex-col justify-between overflow-hidden text-foreground"
        >
            {/* Background Interlocking Panels */}
            <div
                ref={leftPanelRef}
                className="absolute inset-0 bg-background z-10 will-change-[clip-path]"
            />
            <div
                ref={rightPanelRef}
                className="absolute inset-0 bg-background z-10 will-change-[clip-path]"
            />

            {/* Top Bar: Close Button Alignment */}
            <div className="relative z-20 flex justify-end p-6 md:px-12 md:py-6">
                <button
                    ref={closeBtnRef}
                    onClick={onClose}
                    aria-label="Close Menu"
                    className="p-3 text-white hover:text-white transition-colors rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
                >
                    <X className="w-5 h-5 md:w-6 md:h-6"/>
                </button>
            </div>

            {/* Main Interactive Split Dashboard Content */}
            <div
                ref={contentAreaRef}
                className="relative z-20 flex flex-col md:flex-row w-full h-[calc(100vh-180px)] my-auto px-6 md:px-16 gap-8 overflow-hidden">
                {/* LEFT SIDE: Collections & Jewel Mega Hub Grid Panel */}
                <div
                    className="flex flex-col md:flex-row w-full md:w-3/4 gap-6 md:gap-12 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Main Nav Subcategory Selector Buttons */}
                    <div
                        className="slide-left relative flex flex-row md:flex-col gap-2 md:gap-4 pb-[calc(1rem+1px)] md:pb-0 md:pr-[calc(1.5rem+1px)] shrink-0 overflow-x-auto md:overflow-x-visible whitespace-nowrap">
                        {(
                            Object.keys(navigationData) as Array<
                                keyof typeof navigationData
                            >
                        ).map((key) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`text-left font-heading text-lg md:text-2xl font-bold tracking-wide transition-all pb-2 md:pb-0 ${
                                    activeTab === key
                                        ? "text-foreground translate-x-0 md:translate-x-2"
                                        : "text-text  hover:text-white"
                                }`}
                            >
                                {navigationData[key].label}
                            </button>
                        ))}

                        {/* Animated divider: mobile (bottom) / desktop (right) */}
                        <div
                            className="draw-line-x md:hidden absolute bottom-0 left-0 h-px w-full bg-white/10 origin-left"/>
                        <div
                            className="draw-line-y hidden md:block absolute top-0 right-0 h-full w-px bg-white/10 origin-top"/>
                    </div>

                    {/* Content Grid Area for the Active Tab */}
                    <div
                        ref={gridContentRef}
                        className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full"
                    >
                        {Object.entries(
                            navigationData[activeTab].sections
                        ).map(([secKey, section]) => (
                            <div key={secKey} className="grid-section opacity-0 flex flex-col gap-3">
                                <h4 className="grid-animate-item opacity-0 text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-2">
                                    {section.title}
                                </h4>
                                <ul className="flex flex-col gap-2">
                                    {section.items.map((item, itemIdx) => (
                                        <li
                                            key={itemIdx}
                                            className="grid-animate-item opacity-0"
                                        >
                                            <Link
                                                href={`/products`}
                                                onClick={onClose}
                                                className="text-sm md:text-base text-foreground hover:text-white transition-colors inline-block py-1"
                                            >
                                                {item}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE: Dedicated Brand Utilities Sidebar */}
                <div className="slide-right relative flex flex-col justify-between w-full md:w-1/4 pt-8 md:pt-0 md:pl-8 shrink-0">
                    {/* Animated vertical divider between the two halves (desktop only) */}
                    <div
                        className="draw-line-y hidden md:block absolute top-0 bottom-0 left-[calc(-2rem-1px)] w-px bg-white/5 origin-top"/>

                    <div className="flex flex-col gap-6">
                        <h4 className="relative text-xs font-bold uppercase tracking-widest text-white/80 pb-[calc(0.5rem+1px)]">
                            Navigation
                            <span
                                className="draw-line-x block absolute bottom-0 left-0 h-px w-full bg-white/10 origin-left"/>
                        </h4>
                        <nav className="flex flex-col gap-4">
                            {brandSidebarLinks.map((link, linkIndex) => {
                                const characters = link.label.split("");
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={onClose}
                                        className="group font-heading text-2xl md:text-3xl font-medium text-foreground hover:text-white transition-colors overflow-hidden inline-block"
                                    >
                                        <span className="inline-flex overflow-hidden">
                                            {characters.map(
                                                (char, charIndex) => (
                                                    <span
                                                        key={charIndex}
                                                        ref={(el) => {
                                                            if (
                                                                sidebarLettersRef
                                                                    .current[
                                                                    linkIndex
                                                                    ]
                                                            ) {
                                                                sidebarLettersRef.current[
                                                                    linkIndex
                                                                    ][
                                                                    charIndex
                                                                    ] = el;
                                                            }
                                                        }}
                                                        className="inline-block whitespace-pre will-change-transform"
                                                    >
                                                        {char}
                                                    </span>
                                                )
                                            )}
                                        </span>
                                    </Link>
                                );
                            })}

                            {/* User Account & Order Quick Links */}
                            <div className="relative pt-[calc(1rem+1px)] flex flex-col gap-3">
                                <div
                                    className="draw-line-x absolute top-0 left-0 h-px w-full bg-white/10 origin-left"/>

                                <Link
                                    href="/login"
                                    onClick={onClose}
                                    className="flex items-center gap-3 text-base text-foreground hover:text-white transition-colors group"
                                >
                                    <User className="w-5 h-5 text-white group-hover:scale-110 transition-transform"/>
                                    <span>My Account / Login</span>
                                </Link>

                                <Link
                                    href="/orders"
                                    onClick={onClose}
                                    className="flex items-center gap-3 text-base text-foreground hover:text-white transition-colors group"
                                >
                                    <Package className="w-5 h-5 text-white group-hover:scale-110 transition-transform"/>
                                    <span>My Orders</span>
                                </Link>

                            </div>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Bottom Footer Bar */}
            <div
                ref={footerRef}
                className="relative z-20 px-6 md:px-16 pt-[calc(1.5rem+1px)] pb-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60"
            >
                {/* Animated top divider of the footer */}
                <div
                    className="footer-line absolute top-0 left-0 h-px w-full bg-white/10 origin-left"/>

                {/* Left Side: Custom SVG Social Media Icons with Hover Animations */}
                <div className="flex items-center gap-4">
                    {/* Custom Facebook Icon */}
                    <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Facebook"
                        className="p-2.5 rounded-full border border-white/10 text-white/70 hover:border-white hover:text-white hover:scale-110 hover:shadow-[0_0_12px_rgba(184,146,50,0.3)] transition-all duration-300 flex items-center justify-center"
                    >
                        <svg
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </a>

                    {/* Custom Instagram Icon */}
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram"
                        className="p-2.5 rounded-full border border-white/10 text-white/70 hover:border-white hover:text-white hover:scale-110 hover:shadow-[0_0_12px_rgba(184,146,50,0.3)] transition-all duration-300 flex items-center justify-center"
                    >
                        <svg
                            className="w-4 h-4 fill-none stroke-current"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                        </svg>
                    </a>

                    {/* Custom X (Twitter) Icon */}
                    <a
                        href="https://x.com"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="X (Twitter)"
                        className="p-2.5 rounded-full border border-white/10 text-white/70 hover:border-white hover:text-white hover:scale-110 hover:shadow-[0_0_12px_rgba(184,146,50,0.3)] transition-all duration-300 flex items-center justify-center"
                    >
                        <svg
                            className="w-4 h-4 fill-current"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </a>
                </div>

                {/* Center: Brand Establishment Text with GSAP Letter Spacing Hover Effect */}
                <div
                    ref={brandCenterRef}
                    onMouseEnter={handleBrandHoverEnter}
                    onMouseLeave={handleBrandHoverLeave}
                    className="font-heading text-sm uppercase tracking-[0.15em] text-white/70 cursor-pointer text-center select-none"
                >
                    AURORA since 2022
                </div>

                {/* Right Side: Legal Documents Links */}
                <div className="flex items-center gap-4 text-white/60">
                    <Link
                        href="/terms"
                        onClick={onClose}
                        className="hover:text-white transition-colors"
                    >
                        Terms & Conditions
                    </Link>
                    <span>•</span>
                    <Link
                        href="/privacy"
                        onClick={onClose}
                        className="hover:text-white transition-colors"
                    >
                        Privacy Policy
                    </Link>
                    <span>•</span>
                    <Link
                        href="/certifications"
                        onClick={onClose}
                        className="hover:text-white transition-colors"
                    >
                        Certifications
                    </Link>
                </div>
            </div>
        </div>
    );
}
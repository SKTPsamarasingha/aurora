"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure ScrollTrigger plugin is registered
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface CategoryItem {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    price: string;
}

interface ProductCategoriesProps {
    companyName?: string;
    categories?: CategoryItem[];
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
    {
        id: "rings",
        title: "RINGS",
        subtitle: "EXQUISITE SOLITAIRES & BANDS",
        description:
            "Handcrafted in 18k gold and platinum, featuring conflict-free diamonds and precious gemstones designed to celebrate eternal bonds and milestone moments.",
        image: "/ring.jpeg",
        price: "From $1,200",
    },
    {
        id: "earrings",
        title: "EARRINGS",
        subtitle: "TIMELESS DROPS & STUDS",
        description:
            "From delicate diamond studs to dramatic cascading pearls, our earrings catch the light with every movement, framing the face with celestial grace.",
        image: "/earring.jpeg",
        price: "From $950",
    },
    {
        id: "necklaces",
        title: "NECKLACES",
        subtitle: "STATEMENT PENDANTS & CHAINS",
        description:
            "Graceful silhouettes resting effortlessly against the collarbone, meticulously set with brilliant stones to evoke breathtaking elegance.",
        image: "/neckless.jpeg",
        price: "From $2,100",
    },
    {
        id: "bracelets",
        title: "BRACELETS",
        subtitle: "CUFFS & TENNIS BRACELETS",
        description:
            "An orchestration of continuous brilliance wrapping the wrist in refined luxury, balancing modern architecture with enduring sophistication.",
        image: "/braceletc.jpeg",
        price: "From $1,800",
    },
];

export default function ProductCategories({
                                              companyName = "AURORA",
                                              categories = DEFAULT_CATEGORIES,
                                          }: ProductCategoriesProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
    const textContentRef = useRef<(HTMLDivElement | null)[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const total = categories.length;

            // Initial states: Stack images off-screen below, except first
            imagesRef.current.forEach((img, i) => {
                if (img) {
                    if (i > 0) {
                        gsap.set(img, { yPercent: 100 });
                    } else {
                        gsap.set(img, { yPercent: 0 });
                    }
                }
            });

            // Initial text states: Only first text visible
            textContentRef.current.forEach((text, i) => {
                if (!text) return;
                if (i === 0) {
                    gsap.set(text, { autoAlpha: 1, x: 0, rotateY: 0 });
                } else {
                    gsap.set(text, { autoAlpha: 0, x: 100, rotateY: -15 });
                }
            });

            // Pinned Scroll timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: `+=${(total - 1) * 100}%`,
                    pin: true,
                    pinSpacing: true,
                    scrub: 1,
                    snap: {
                        snapTo: 1 / (total - 1),
                        duration: 0.5,
                        ease: "power2.inOut",
                    },
                    onUpdate: (self) => {
                        const progress = self.progress;
                        const index = Math.min(
                            Math.floor(progress * total + 0.0001),
                            total - 1
                        );
                        setActiveIndex(index);
                    },
                },
            });

            for (let i = 1; i < total; i++) {
                const currentImg = imagesRef.current[i];
                const prevText = textContentRef.current[i - 1];
                const currentText = textContentRef.current[i];
                const startTime = i - 1;

                // 1. Image slides up from bottom over previous image
                if (currentImg) {
                    tl.fromTo(
                        currentImg,
                        { yPercent: 100 },
                        { yPercent: 0, ease: "power2.inOut", duration: 1 },
                        startTime
                    );
                }

                // 2. Previous text exits
                if (prevText) {
                    tl.to(
                        prevText,
                        {
                            autoAlpha: 0,
                            x: -60,
                            rotateY: 15,
                            duration: 0.35,
                            ease: "power2.in",
                        },
                        startTime
                    );
                }

                // 3. Current text enters
                if (currentText) {
                    tl.fromTo(
                        currentText,
                        { autoAlpha: 0, x: 100, rotateY: -15 },
                        {
                            autoAlpha: 1,
                            x: 0,
                            rotateY: 0,
                            duration: 0.65,
                            ease: "power2.out",
                        },
                        startTime + 0.3
                    );
                }
            }

            ScrollTrigger.refresh();
        }, sectionRef);

        return () => ctx.revert();
    }, [categories]);

    return (
        <section
            ref={sectionRef}
            className="relative w-full h-screen bg-[#F4EFEB] text-[#2C2825] font-sans overflow-hidden flex flex-col justify-between py-10 px-6 sm:px-10 lg:px-16"
            style={{ perspective: "1200px" }}
        >
            {/* Header */}
            <div className="relative z-30 flex items-center justify-between border-b border-[#2C2825]/20 pb-4">
                <div>
                    <span className="text-[10px] sm:text-xs tracking-widest text-[#5C564D] uppercase font-medium">
                        {companyName} MAISON
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light tracking-tight uppercase text-[#2C2825]">
                        PRODUCT CATEGORIES
                    </h2>
                </div>
                <div className="text-xs font-mono tracking-widest text-[#5C564D]">
                    0{activeIndex + 1} / 0{categories.length}
                </div>
            </div>

            {/* Split Layout */}
            <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full my-auto py-6">

                {/* Left Side: Full-Size Image Card Stack */}
                <div
                    className="lg:col-span-4 ml-50 max-w-[400px] mx-auto relative w-full h-[200px] sm:h-[280px] lg:h-[350px] rounded-2xl overflow-hidden bg-[#E8E2D7] shadow-xl">
                    {categories.map((cat, index) => (
                        <div
                            key={cat.id}
                            ref={(el) => {
                                imagesRef.current[index] = el;
                            }}
                            className="absolute inset-0 w-full h-full overflow-hidden will-change-transform"
                            style={{zIndex: index + 1}}
                        >
                            <img
                                src={cat.image}
                                alt={cat.title}
                                className="w-full h-full object-cover object-center filter brightness-[0.98]"
                            />
                            <div
                                className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"/>
                        </div>
                    ))}
                </div>


                {/* Right Side: Text Stack */}
                <div
                    className="lg:col-span-6 ml-50 relative flex flex-col justify-center h-full min-h-[260px]"
                    style={{perspective: "1000px"}}
                >
                    {categories.map((cat, index) => (
                        <div
                            key={cat.id}
                            ref={(el) => {
                                textContentRef.current[index] = el;
                            }}
                            className="absolute inset-0 flex flex-col justify-center space-y-6 will-change-transform"
                        >
                            <div className="space-y-1">
                                <span className="text-xs tracking-widest uppercase text-[#C5A880] font-medium">
                                    {cat.subtitle}
                                </span>
                                <h3 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-[#2C2825]">
                                    {cat.title}
                                </h3>
                            </div>

                            <p className="text-base sm:text-lg text-[#5C564D] leading-relaxed font-light max-w-xl">
                                {cat.description}
                            </p>

                            <div className="pt-2">
                                <a
                                    href={`#${cat.id}`}
                                    className="inline-flex items-center gap-3 bg-[#2C2825] text-[#F4EFEB] px-7 py-3.5 rounded-full text-xs sm:text-sm tracking-widest font-medium uppercase transition-all duration-300 hover:bg-[#4A433E] hover:gap-5"
                                >
                                    <span>EXPLORE {cat.title}</span>
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                                        />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
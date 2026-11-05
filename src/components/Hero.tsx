"use client";

import React, {useEffect, useRef} from "react";
import gsap from "gsap";
import heroImg from "@/public/hero.png";

interface HeroProps {
    companyName?: string;
}

export default function Hero({companyName = "AURORA"}: HeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const leftContentRef = useRef<HTMLDivElement>(null);
    const centerImageRef = useRef<HTMLDivElement>(null);
    const rightTaglineRef = useRef<HTMLDivElement>(null);
    const linksRef = useRef<HTMLDivElement>(null);

    const categoryLinks = [
        {name: "RINGS", href: "#rings"},
        {name: "EARRINGS", href: "#earrings"},
        {name: "NECKLACES", href: "#necklaces"},
        {name: "BRACELETS", href: "#bracelets"},
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({defaults: {ease: "power3.out"}});

            // 1. Title reveal first
            tl.fromTo(
                titleRef.current,
                {y: 40, opacity: 0},
                {y: 0, opacity: 1, duration: 1.1}
            );

            // 2. Center visual image slides up from the bottom
            tl.fromTo(
                centerImageRef.current,
                {y: 50, opacity: 0, scale: 0.95},
                {y: 0, opacity: 1, scale: 1, duration: 1.1},
                "-=0.4"
            );

            // 3. As the image comes midway, CTA section and category nav links animate in together
            if (leftContentRef.current) {
                tl.fromTo(
                    leftContentRef.current.children,
                    {y: 30, opacity: 0},
                    {y: 0, opacity: 1, duration: 0.8, stagger: 0.12},
                    "-=0.6"
                );
            }

            tl.fromTo(
                rightTaglineRef.current,
                {y: 30, opacity: 0},
                {y: 0, opacity: 1, duration: 0.8},
                "<"
            );

            if (linksRef.current) {
                tl.fromTo(
                    linksRef.current.children,
                    {x: 20, opacity: 0},
                    {x: 0, opacity: 1, duration: 0.6, stagger: 0.08},
                    "-=0.5"
                );
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative w-full h-screen bg-background text-white font-sans overflow-hidden flex flex-col justify-between py-10 sm:px-10"
        >
            {/* Hero Header Title */}
            <div className="relative -top-12 z-10 text-center w-full">
                <h1
                    ref={titleRef}
                    className="font-serif text-[12vw] sm:text-[13vw] md:text-[14vw] leading-none tracking-tight uppercase font-light text-white select-none"
                >
                    {companyName}
                </h1>
            </div>

            {/* Main Grid Content Layout */}
            <div className="relative -top-10 z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">

                {/* Left Column: Collection Info & CTA */}
                <div
                    ref={leftContentRef}
                    className="lg:col-span-4 flex flex-col items-start space-y-4 max-w-md z-20"
                >
                    <div className="space-y-0.5">
                        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide leading-tight text-white">
                            COLLECTION
                        </h2>
                        <p className="text-3xl sm:text-4xl md:text-5xl font-normal text-white">
                            2025
                        </p>
                    </div>

                    <p className="text-sm sm:text-base text-[#5C564D] leading-relaxed font-light">
                        Discover exquisite jewelry inspired by the beauty of the heavens.
                        Each piece is crafted to bring elegance and grace to your most cherished occasions.
                    </p>

                    <a
                        href="#discover"
                        className="inline-flex items-center gap-3 bg-[#2C2825] text-[#F4EFEB] px-7 py-3.5 rounded-full text-xs sm:text-sm tracking-widest font-medium uppercase transition-all duration-300 hover:bg-[#4A433E] hover:gap-5"
                    >
                        <span>DISCOVER</span>
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

                {/* Center Visual: Hand Image */}
                <div
                    ref={centerImageRef}
                    className="lg:col-span-4 flex justify-center items-start relative z-10"
                >
                    <div className="absolute -top-40 w-full max-w-xs sm:max-w-sm md:max-w-md aspect-[3/4] flex items-center justify-center">
                        <img
                            src={heroImg.src}
                            alt="Minimalist mannequin hand wearing gold luxury rings"
                            className=" w-full h-full object-contain filter drop-shadow-2xl"
                        />
                    </div>
                </div>

                {/* Right Column: Tagline & Category Menu List */}
                <div className="lg:col-span-4 flex flex-col h-full space-y-12 lg:space-y-16 z-20">
                    <div ref={rightTaglineRef} className="lg:text-right">
                        <p className="font-serif text-xl sm:text-2xl md:text-3xl font-light uppercase tracking-wide text-white leading-snug">
                            A CELESTIAL TOUCH <br className="hidden sm:inline"/>
                            FOR TIMELESS MOMENTS
                        </p>
                    </div>

                    <div
                        ref={linksRef}
                        className="w-full space-y-0 divide-y divide-[#2C2825]/20 border-t border-b border-[#2C2825]/20"
                    >
                        {categoryLinks.map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                className="group flex items-center justify-between py-3.5 text-xs sm:text-sm font-medium tracking-widest text-white uppercase transition-colors duration-300 hover:text-[#C5A880]"
                            >
                                <span>{item.name}</span>
                                <svg
                                    className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1"
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
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
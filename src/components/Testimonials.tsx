"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


interface TestimonialItem {
    id: string;
    quote: string;
    author: string;
    role: string;
    location: string;
    rating: number;
}

interface TestimonialsProps {
    companyName?: string;
    testimonials?: TestimonialItem[];
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
    {
        id: "1",
        quote: "AURORA crafted our custom engagement ring beyond anything we could have imagined. The attention to detail and celestial elegance of the final piece left us completely breathless.",
        author: "Lady Victoria Montgomery",
        role: "Private Collector",
        location: "London, UK",
        rating: 5,
    },
    {
        id: "2",
        quote: "The bespoke design experience was seamless from start to finish. Wearing AURORA's pieces feels like carrying a piece of timeless art. Absolute perfection.",
        author: "Elena Rostova",
        role: "Fashion Curator",
        location: "Paris, France",
        rating: 5,
    },
    {
        id: "3",
        quote: "Exquisite craftsmanship and unparalleled client service. The brilliance of the gemstones and the delicate weight of the gold setting reflect true mastery.",
        author: "Sophia Sterling",
        role: "Art Director",
        location: "New York, USA",
        rating: 5,
    },
];

export default function Testimonials({
                                         companyName = "AURORA",
                                         testimonials = DEFAULT_TESTIMONIALS,
                                     }: TestimonialsProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Entrance animation on scroll into view
            gsap.fromTo(
                headerRef.current,
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Animate slide change whenever currentIndex updates
    useEffect(() => {
        if (!contentRef.current) return;
        gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
    }, [currentIndex]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const current = testimonials[currentIndex];

    return (
        <section
            ref={sectionRef}
            className="relative w-full min-h-screen bg-[#F4EFEB] text-[#2C2825] font-sans flex flex-col justify-between py-16 px-6 sm:px-10 lg:px-16 overflow-hidden"
        >
            {/* Section Header */}
            <div
                ref={headerRef}
                className="relative z-20 flex items-center justify-between border-b border-[#2C2825]/20 pb-6 max-w-7xl mx-auto w-full"
            >
                <div>
          <span className="text-[10px] sm:text-xs tracking-widest text-[#5C564D] uppercase font-medium">
            {companyName} CLIENTS
          </span>
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light tracking-tight uppercase text-[#2C2825]">
                        WORDS OF ELEGANCE
                    </h2>
                </div>
                <div className="text-xs font-mono tracking-widest text-[#5C564D]">
                    0{currentIndex + 1} / 0{testimonials.length}
                </div>
            </div>

            {/* Main Testimonial Slider Content */}
            <div className="relative z-20 max-w-4xl mx-auto w-full my-auto py-12 flex flex-col items-center text-center">
                <div ref={contentRef} className="space-y-8 will-change-transform">
                    {/* Star Rating Icons */}
                    <div className="flex justify-center space-x-1.5 text-[#C5A880]">
                        {[...Array(current.rating)].map((_, i) => (
                            <svg
                                key={i}
                                className="w-5 h-5 fill-current"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed text-[#2C2825]">
                        &ldquo;{current.quote}&rdquo;
                    </blockquote>

                    {/* Author Details */}
                    <div className="space-y-1 pt-4">
                        <h3 className="font-serif text-lg sm:text-xl font-normal tracking-wide text-[#2C2825]">
                            {current.author}
                        </h3>
                        <p className="text-xs sm:text-sm tracking-widest uppercase text-[#5C564D] font-medium">
                            {current.role} &mdash; <span className="text-[#C5A880]">{current.location}</span>
                        </p>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <div className="flex items-center space-x-6 mt-12">
                    <button
                        onClick={handlePrev}
                        aria-label="Previous Testimonial"
                        className="w-12 h-12 rounded-full border border-[#2C2825]/20 flex items-center justify-center text-[#2C2825] hover:bg-[#2C2825] hover:text-[#F4EFEB] transition-all duration-300"
                    >
                        <svg
                            className="w-5 h-5 transform rotate-180"
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
                    </button>

                    <button
                        onClick={handleNext}
                        aria-label="Next Testimonial"
                        className="w-12 h-12 rounded-full border border-[#2C2825]/20 flex items-center justify-center text-[#2C2825] hover:bg-[#2C2825] hover:text-[#F4EFEB] transition-all duration-300"
                    >
                        <svg
                            className="w-5 h-5"
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
                    </button>
                </div>
            </div>


        </section>
    );
}
"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


interface StepItem {
    number: string;
    title: string;
    description: string;
}

interface ProcessStepsProps {
    companyName?: string;
    steps?: StepItem[];
}

const DEFAULT_STEPS: StepItem[] = [
    {
        number: "01",
        title: "Design Discovery & Quote",
        description: "Share your vision, style, and material preferences with us to receive a detailed quote and timeline.",
    },
    {
        number: "02",
        title: "Concept Development",
        description: "Our expert designers will transform your ideas into refined concepts and present design variations for your approval.",
    },
    {
        number: "03",
        title: "Order Placement & 3D Modelling",
        description: "After placing your order, we create a precise 3D (CAD) model of your piece for you to review and finalize before crafting.",
    },
    {
        number: "04",
        title: "Crafting & Quality Assurance",
        description: "Master craftsmen bring your design to life over 1–4 weeks, followed by a meticulous quality inspection to ensure perfection.",
    },
    {
        number: "05",
        title: "Packaging & Delivery",
        description: "Following final payment, your piece is beautifully packaged in our signature box and ready for secure worldwide delivery or pickup.",
    },
];

export default function ProcessSteps({
                                         companyName = "AURORA",
                                         steps = DEFAULT_STEPS,
                                     }: ProcessStepsProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const totalSteps = steps.length;

            // Set initial states: all steps except the first one are hidden lower down
            stepsRef.current.forEach((step, i) => {
                if (i > 0 && step) {
                    gsap.set(step, { yPercent: 100, opacity: 0 });
                } else if (step) {
                    gsap.set(step, { yPercent: 0, opacity: 1 });
                }
            });

            // Pinned Scroll sequence where each step slides up and reveals sequentially on scroll
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: `+=${(totalSteps - 1) * 100}%`,
                    pin: true,
                    pinSpacing: true,
                    scrub: 1,
                    snap: {
                        snapTo: 1 / (totalSteps - 1),
                        duration: 0.5,
                        ease: "power2.inOut",
                    },
                },
            });

            for (let i = 1; i < totalSteps; i++) {
                const currentStep = stepsRef.current[i];
                const prevStep = stepsRef.current[i - 1];

                // Fade/slide previous step back slightly or scale down for stacking depth effect
                if (prevStep) {
                    tl.to(
                        prevStep,
                        {
                            scale: 0.95,
                            opacity: 0.4,
                            filter: "blur(4px)",
                            ease: "power2.inOut",
                        },
                        i - 1
                    );
                }

                // Slide current step up into view
                if (currentStep) {
                    tl.fromTo(
                        currentStep,
                        { yPercent: 100, opacity: 0, scale: 0.95 },
                        {
                            yPercent: 0,
                            opacity: 1,
                            scale: 1,
                            filter: "blur(0px)",
                            ease: "power2.inOut",
                        },
                        i - 1
                    );
                }
            }

            ScrollTrigger.refresh();
        }, sectionRef);

        return () => ctx.revert();
    }, [steps]);

    return (
        <section
            ref={sectionRef}
            className="relative w-full h-screen bg-[#F4EFEB] text-[#2C2825] font-sans overflow-hidden flex flex-col justify-between py-10 px-6 sm:px-10 lg:px-16"
        >


            {/* Section Title Header */}
            <div className="relative z-30 flex items-center justify-between border-b border-[#2C2825]/20 pb-4">
                <div>
          <span className="text-[10px] sm:text-xs tracking-widest text-[#5C564D] uppercase font-medium">
            {companyName} ATELIER
          </span>
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light tracking-tight uppercase text-[#2C2825]">
                        BESPOKE CREATION PROCESS
                    </h2>
                </div>
                <div className="text-xs font-mono tracking-widest text-[#5C564D]">
                    ATELIER STEPS
                </div>
            </div>

            {/* Main Container where Steps Stack and Reveal on Scroll */}
            <div className="relative z-20 w-full max-w-4xl mx-auto h-[60vh] flex items-center justify-center my-auto">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        ref={(el) => {
                            stepsRef.current[index] = el;
                        }}
                        className="absolute inset-0 w-full h-full flex flex-col justify-center items-center text-center px-6 bg-[#F4EFEB] will-change-transform rounded-3xl"
                        style={{ zIndex: index + 1 }}
                    >
                        <div className="max-w-2xl space-y-6">
              <span className="inline-block font-mono text-sm sm:text-base text-[#C5A880] tracking-widest border border-[#C5A880]/30 px-4 py-1.5 rounded-full">
                STEP {step.number}
              </span>

                            <h3 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light tracking-wide text-[#2C2825]">
                                {step.title}
                            </h3>

                            <p className="text-base sm:text-lg md:text-xl text-[#5C564D] leading-relaxed font-light">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>


        </section>
    );
}
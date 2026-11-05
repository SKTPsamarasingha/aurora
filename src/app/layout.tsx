import type {Metadata} from "next";
import {Cormorant_Garamond, Inter} from "next/font/google";
import "./globals.css";
import React from "react";
import {AuthProvider} from "@/src/context/AuthContext";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {CartProvider} from "@/src/context/CartContext";

gsap.registerPlugin(ScrollTrigger);

// Heading font (High-contrast, elegant Editorial Serif)
const cormorantGaramond = Cormorant_Garamond({
    variable: "--font-heading",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600"],
    display: "swap",
});

// Body text font (Clean, modern Geometric Sans-Serif)
const inter = Inter({
    variable: "--font-body",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "AURORA Jewelry",
    description: "A celestial touch for timeless moments. Premium crafted jewelry, rings, and elegant necklaces.",
};

interface LayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({children}: LayoutProps) {
    return (
        <html
            lang="en"
            className={`${cormorantGaramond.variable} ${inter.variable} h-full antialiased`}
        >
        <body className="min-h-full flex flex-col">
        <AuthProvider>
            <CartProvider>
                <Navbar/>
                {children}
                <Footer/>
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    );
}

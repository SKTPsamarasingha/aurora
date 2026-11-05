"use client";

import {JSX} from "react";
import Hero from "@/src/components/Hero"
import Testimonials from "@/src/components/Testimonials";
import ProductsSection from "@/src/components/ProductsSection";
import CraftSteps from "@/src/components/CraftSteps";

export default function Home({}): JSX.Element {
    return (<>
        <Hero></Hero>
        <ProductsSection></ProductsSection>
        <CraftSteps></CraftSteps>

        <Testimonials></Testimonials>

    </>)
}



import React from "react";
import { SparklesCore } from "./ui/sparkles";
import { assets } from "../assets/assets";

export function SparklesLogo({ textColor = "text-black", particleColor = "#000000" }) {
    return (
        <div className="h-10 bg-transparent flex items-center justify-center overflow-hidden rounded-md relative w-12 md:w-60 md:gap-3">
            <div className="w-full absolute inset-0 h-full">
                <SparklesCore
                    id="tsparticles"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={100}
                    className="w-full h-full"
                    particleColor={particleColor}
                />
            </div>
            <img
                src={assets.hk_logo}
                alt="HK Logo"
                className="h-10 w-10 object-contain relative z-20 rounded-full"
            />
            <h1 className={`hidden md:block md:text-2xl text-xl font-bold font-brand text-center ${textColor} relative z-20 tracking-wide whitespace-nowrap`}>
                HK Signature
            </h1>
        </div>
    );
}

export default SparklesLogo;

import React from "react";
import { SparklesCore } from "./ui/sparkles";

export function SparklesLogo({ textColor = "text-black", particleColor = "#000000" }) {
    return (
        <div className="h-10 w-48 bg-transparent flex flex-col items-center justify-center overflow-hidden rounded-md relative">
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
            <h1 className={`md:text-2xl text-xl font-bold font-brand text-center ${textColor} relative z-20 tracking-wide whitespace-nowrap`}>
                HK Signature
            </h1>
        </div>
    );
}

export default SparklesLogo;

import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets.js';
import CustomDesign from './CustomDesign.jsx';
import { Link } from 'react-router-dom';
import { motion } from "motion/react";

const heroImages = [assets.hero_img, assets.about_img, assets.contact_img];

const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-black flex flex-col justify-center">

      {/* Cinematic Background Slideshow - Fixed for parallax feel on mobile */}
      <div className="absolute inset-0 w-full h-full z-0">
        {heroImages.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={src}
              alt="Cinematic Fashion"
              className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${i === index ? 'scale-110' : 'scale-100'}`}
            />
            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent lg:via-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
          </div>
        ))}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-12 py-32 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">

          {/* Left: Typography */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-white space-y-8 lg:space-y-10 max-w-3xl relative z-20"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/30 rounded-full backdrop-blur-md bg-white/10 shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/90">The New Standard</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-bold tracking-tight uppercase text-transparent leading-[0.9] drop-shadow-2xl" style={{ WebkitTextStroke: '1px #ffffff' }}>
                Design & Order
              </h1>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif italic font-medium leading-[0.9] tracking-tight drop-shadow-2xl">
                <span className="text-white/90">Your </span>
                <span className="bg-gradient-to-r from-blue-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">Imagination.</span>
              </h1>
            </div>

            <p className="text-lg sm:text-2xl text-white/90 max-w-xl font-serif font-light leading-relaxed drop-shadow-md">
              Experience the convergence of high fashion and generative AI.
              Craft bespoke apparel that defines your signature style.
            </p>

            <div className="flex flex-wrap gap-4 sm:gap-6 pt-4 lg:pt-6">
              <Link to="/collection" className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-white text-black text-xs sm:text-sm font-serif font-bold uppercase tracking-widest overflow-hidden hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-sm">
                <span className="relative z-10">Explore Collection</span>
                <div className="absolute inset-0 bg-gray-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              </Link>
              <Link to="/about" className="px-8 sm:px-10 py-4 sm:py-5 border border-white/40 text-white text-xs sm:text-sm font-serif font-bold uppercase tracking-widest backdrop-blur-md bg-white/5 hover:bg-white hover:text-black transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] rounded-sm">
                About Us
              </Link>
            </div>
          </motion.div>

          {/* Right: Floating Glass Tool */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:pl-12 w-full"
          >
            <div className="relative group max-w-md mx-auto lg:max-w-none">
              {/* Glass Card */}
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500 hover:bg-white/15 hover:border-white/30 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)]">

                {/* Decorative Header */}
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                    <div className="text-[10px] sm:text-xs font-bold tracking-widest text-white/80 uppercase">AI Design Studio</div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                  </div>
                </div>

                {/* Tool Component - Wrapped to ensure visibility */}
                <div className="bg-white/95 rounded-xl p-1 shadow-inner ring-1 ring-black/5">
                  <CustomDesign />
                </div>

                {/* Shine Effect */}
                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-shine pointer-events-none"></div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce cursor-pointer z-20"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
      </motion.div>

    </section>
  );
};

export default Hero;

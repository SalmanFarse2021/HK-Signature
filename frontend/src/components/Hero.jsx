import React, { useEffect, useState } from 'react';
import CustomDesign from './CustomDesign.jsx';
import HeroParticles from './HeroParticles.jsx';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

const Hero = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]); // Reduced rotation for elegance
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    x.set(clientX / innerWidth - 0.5);
    y.set(clientY / innerHeight - 0.5);
  };

  return (
    <section
      className="relative w-full min-h-screen flex flex-col lg:flex-row items-center overflow-hidden bg-[#fafafa]"
      onMouseMove={handleMouseMove}
    >

      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <HeroParticles color="#9ca3af" />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-100/50 rounded-full blur-[120px] mix-blend-multiply"></div>
      </div>

      {/* Left Content - Typography */}
      <div className="relative z-10 w-full lg:w-1/2 px-6 sm:px-12 pt-24 lg:pt-0 flex flex-col justify-center h-full pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8 max-w-xl pointer-events-auto"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">Next-Gen Fashion Tech</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-sans font-black tracking-tighter text-gray-900 leading-[1.05]">
            Design & Order <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">your Imagination.</span>
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed font-medium max-w-xl">
            Turn your vision into fashion. Create your own designed saree, panjabi, or handcrafted piece — crafted with tradition, shaped by your creativity.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/collection" className="group relative px-8 py-4 bg-black text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden">
              <span className="relative z-10">Collection</span>
              <div className="absolute inset-0 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </Link>
            <Link to="/about" className="px-8 py-4 bg-white text-gray-900 font-bold border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all">
              View Gallery
            </Link>
          </div>

          <div className="flex items-center gap-4 pt-4 text-sm font-medium text-gray-400">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
              ))}
            </div>
            <p>Trusted by 10k+ Designers</p>
          </div>
        </motion.div>
      </div>

      {/* Right Content - 3D Floating Studio */}
      <div className="relative z-20 w-full lg:w-1/2 h-[60vh] lg:h-screen flex items-center justify-center perspective-[1500px]">
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative w-full max-w-md lg:max-w-lg"
        >
          {/* Main 3D Card Container */}
          <div className="relative bg-white/60 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] p-3 transform-gpu">

            {/* Shine Effect */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-white/80 via-transparent to-transparent opacity-60 pointer-events-none"></div>

            {/* App Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
              </div>
              <div className="px-3 py-1 rounded-full bg-gray-100/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                HK Studio Pro
              </div>
            </div>

            {/* The Actual Tool */}
            <div className="p-1 bg-white/50 rounded-b-[1.5rem] overflow-hidden min-h-[300px]">
              <CustomDesign />
            </div>



          </div>
        </motion.div>
      </div>

    </section>
  );
};

export default Hero;

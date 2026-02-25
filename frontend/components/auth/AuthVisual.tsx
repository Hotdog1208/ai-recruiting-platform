"use client";

import { motion } from "framer-motion";

export function AuthVisual() {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center pointer-events-none">
      {/* Dynamic Background Noise */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-color-dodge z-10" />
      
      {/* Central Glowing Core */}
      <motion.div 
        className="relative z-20 w-[600px] h-[600px] flex items-center justify-center transform-gpu"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {/* Abstract Liquid Shape 1 */}
        <motion.div className="absolute top-0 right-[10%] w-[400px] h-[400px] bg-[#00f0ff] rounded-full mix-blend-screen blur-[100px] opacity-40" />
        
        {/* Abstract Liquid Shape 2 */}
        <motion.div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-[#7a00ff] rounded-full mix-blend-screen blur-[120px] opacity-30" />
        
        {/* Abstract Liquid Shape 3 */}
        <motion.div className="absolute top-[30%] left-[30%] w-[300px] h-[300px] bg-[#ef00ff] rounded-full mix-blend-screen blur-[80px] opacity-20" />
        
        {/* Wireframe Matrix Globe */}
        <div className="absolute inset-0 rounded-full border border-white/10 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)] flex items-center justify-center">
           <div className="w-[80%] h-[80%] rounded-full border border-white/5" />
           <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:radial-gradient(circle_at_center,white,transparent_60%)]" />
        </div>
      </motion.div>

      {/* High Contrast Typography Overlay */}
      <div className="absolute inset-0 z-30 flex flex-col justify-end p-20 text-white/50">
        <h2 className="font-display text-[clamp(2.5rem,4vw,4rem)] font-black text-white leading-none tracking-tighter mix-blend-difference mb-4">
           Compute
           <br/>Your Future.
        </h2>
        <p className="font-medium text-lg max-w-sm">
           The engine is initializing. Connecting to the 1536-dimensional matrix array.
        </p>
      </div>
    </div>
  );
}

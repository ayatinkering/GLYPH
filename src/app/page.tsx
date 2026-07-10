"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { FeetSimulator } from "@/components/FeetSimulator";
import { ArrowDown, Footprints, Monitor, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(1); // Default hover on middle card (1)
  const [showWalkModal, setShowWalkModal] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setQrUrl(`${window.location.origin}/walk`);
    }
  }, []);

  const handleStartWalkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setShowWalkModal(true);
    } else {
      router.push("/walk");
    }
  };

  return (
    <div className="relative min-h-screen bg-canvas  overflow-x-hidden selection:bg-nature-forest selection:text-white font-serif">
      {/* Floating capsule navigation bar */}
      <Header />

      {/* SECTION 1: HERO & MAIN MOCKUP BANNER */}
      <section className="relative px-6 pt-32 pb-24 max-w-5xl mx-auto z-10">
        
        {/* Mockup Top Banner Image (Inspired by Farce Mockup) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full aspect-[2.1/1] sm:aspect-[2.8/1] rounded-[24px] sm:rounded-[32px] overflow-hidden border border-border-subtle/50 shadow-sm mb-16"
        >
          {/* Pixel Art Nature Background */}
          <div
            className="absolute inset-0 bg-cover bg-[center_35%] scale-[1.01]"
            style={{ backgroundImage: `url('/images/field_roses.png')` }}
          />
          {/* Subtle overlay filter */}
          <div className="absolute inset-0 bg-black/[0.04]" />
        </motion.div>

        {/* Mockup Typography & Details Layout (Split Grid) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-start">
          
          {/* Left Column: Heading inside serif Lastik */}
          <div className="md:col-span-7 text-left">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-5xl sm:text-7xl text-text-primary tracking-tight font-normal leading-[1.05]"
            >
              Commit to <br />
              touching grass.
            </motion.h1>
          </div>

          {/* Right Column: Paragraph and Clean Capsule Buttons */}
          <div className="md:col-span-5 text-left flex flex-col items-start pt-2">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[#60554E] text-base sm:text-lg leading-relaxed mb-8 font-serif font-normal"
            >
              GitHub records the code you wrote. GLYPH records the moments you chose to step outside. Every walk leaves behind a Mandala Commit.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-row gap-3 w-full sm:w-auto"
            >
              <a
                href="/walk"
                onClick={handleStartWalkClick}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-btn-primary-bg hover:bg-btn-primary-hover text-white transition-all duration-200 text-sm sm:text-base font-normal shadow-sm"
              >
                <span>Start Walking →</span>
              </a>
              <Link
                href="#playground"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#F4F4F3] hover:bg-neutral-200/50 transition-all duration-200 text-sm sm:text-base font-normal text-text-secondary"
              >
                <span>See an example</span>
              </Link>
            </motion.div>
          </div>

        </div>

      </section>

      {/* SECTION 2: EXPANDING ACCORDION GRID (Inspired by Mockup 2) */}
      <section id="philosophy" className="py-24 px-6 border-t border-border-subtle bg-white">
        <div className="max-w-5xl mx-auto">
          
          {/* Header Block */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-4xl sm:text-5xl text-text-primary mb-4 font-normal">
              How GLYPH maps your steps
            </h2>
            <p className="text-[#60554E] text-base sm:text-lg leading-relaxed font-serif">
              Hover over each panel below to expand and discover how your movement compiles into procedural mandalas.
            </p>
          </div>

          {/* Accordion flex cards row */}
          <div className="flex flex-col md:flex-row items-stretch gap-4 sm:gap-6 w-full min-h-[380px] sm:min-h-[440px]">
            
            {/* Card 1: Gait Flow (unfolds on hover) */}
            <div 
              onMouseEnter={() => setHoveredCard(0)}
              className={`group relative rounded-[24px] overflow-hidden border border-neutral-950/5 shadow-sm flex flex-col justify-end p-6 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                hoveredCard === 0 ? "flex-[2.5]" : "flex-[1]"
              }`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 scale-[1.01]"
                style={{ backgroundImage: `url('/images/lily_pond.png')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              
              <div className="relative z-10 text-left text-white max-w-sm">
                <h4 className="font-serif font-normal text-xl sm:text-2xl">Cadence & Smoothness</h4>
                
                {/* Accordion FAQ Expanded Info */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  hoveredCard === 0 ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}>
                  <p className="text-sm sm:text-base text-white font-serif leading-relaxed">
                    GLYPH processes motion accelerometer data using a low-pass butterworth filter. Stride interval peaks compile your real-time Cadence (BPM), while variance in gait regularity measures gait entropy.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Lake Shore (unfolds on hover) */}
            <div 
              onMouseEnter={() => setHoveredCard(1)}
              className={`group relative rounded-[24px] overflow-hidden border border-neutral-950/5 shadow-sm flex flex-col justify-end p-6 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                hoveredCard === 1 ? "flex-[2.5]" : "flex-[1]"
              }`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 scale-[1.01]"
                style={{ backgroundImage: `url('/images/lake_shore.png')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              
              <div className="relative z-10 text-left text-white max-w-sm">
                <h4 className="font-serif font-normal text-xl sm:text-2xl">Celestial Palettes</h4>
                
                {/* Accordion FAQ Expanded Info */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  hoveredCard === 1 ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}>
                  <p className="text-sm sm:text-base text-white font-serif leading-relaxed">
                    Astronomical coordinates calculate the sun's elevation relative to your horizon. Walks at Golden Hour trigger warm sunflower palettes; Blue Hour transitions into indigo violet; night walks render deep midnight blues.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Field Roses (unfolds on hover) */}
            <div 
              onMouseEnter={() => setHoveredCard(2)}
              className={`group relative rounded-[24px] overflow-hidden border border-neutral-950/5 shadow-sm flex flex-col justify-end p-6 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                hoveredCard === 2 ? "flex-[2.5]" : "flex-[1]"
              }`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 scale-[1.01]"
                style={{ backgroundImage: `url('/images/field_roses.png')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              
              <div className="relative z-10 text-left text-white max-w-sm">
                <h4 className="font-serif font-normal text-xl sm:text-2xl">Phyllotaxis Symmetry</h4>
                
                {/* Accordion FAQ Expanded Info */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  hoveredCard === 2 ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}>
                  <p className="text-sm sm:text-base text-white font-serif leading-relaxed">
                    Impulses route through golden spiral formulas: r = c * √n and θ = n * 137.508°. As step counts hit Fibonacci milestones, the engine replicates arms into symmetric mandala patterns.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: MOCKUP 3 INTERACTIVE SANDBOX */}
      <section id="playground" className="relative py-24 px-6 border-t border-border-subtle/50 bg-canvas overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Typographic lockup inspired by Mockup 3 (Left Column) */}
          <div className="md:col-span-6 text-left">
            <h2 className="font-serif font-normal text-4xl sm:text-5xl text-text-primary mb-4 leading-tight">
              Seamless Walk Simulation, <br />
              <span className="font-serif font-normal">procedural mandalas</span>
            </h2>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed font-serif">
              Click inside the coordinates grid below to simulate steps. Each step plays a woodblock percussion chime and blooms the geometry equations.
            </p>
          </div>

          {/* Minimalist Sandbox Panel Card (Right Column) */}
          <div className="md:col-span-6 w-full flex justify-center md:justify-end relative z-10">
            <FeetSimulator />
          </div>

        </div>
      </section>

      {/* WALK MODAL: Local QR code popup for desktop users */}
      {showWalkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/10 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-[24px] border border-border-subtle bg-canvas p-8 shadow-xl text-center">
            {/* Close button */}
            <button
              onClick={() => setShowWalkModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-200/50 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl text-text-primary mb-4">Scan to start walk</h3>
            
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-6 font-serif">
              GLYPH uses phone accelerometer motion sensors to compile your mandala. Scan the code to open the app on your mobile device:
            </p>

            {/* QR Code Specimen Frame */}
            <div className="w-44 h-44 bg-white rounded-2xl border border-border-subtle flex items-center justify-center p-2 mx-auto mb-2 shadow-sm">
              {qrUrl ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=0a3323&bgcolor=ffffff&data=${encodeURIComponent(qrUrl)}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-6 h-6 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* AESTHETIC CINEMATIC FOOTER: Background covers the bottom page image */}
      <footer className="relative pt-24 pb-16 px-6 sm:px-12 overflow-hidden border-t border-border-subtle/50 text-white">
        {/* Background Image: lily_pond.png */}
        <div 
          className="absolute inset-0 bg-cover bg-[center_30%]"
          style={{ backgroundImage: `url('/images/lily_pond.png')` }}
        />
        {/* Lighter overlays for a brighter and more vibrant pixel art backdrop */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/25" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-10 text-center">
          


          <div className="w-full grid grid-cols-1 md:grid-cols-3 items-center gap-8 pt-4">
            {/* Left: Tagline - Lastik font, increased size */}
            <div className="text-center md:text-left">
              <span className="font-serif text-base sm:text-lg text-white/95">Make us a part of your daily walk.</span>
            </div>

            {/* Center: Cute Mandala Logo & Wordmark (Increased font size) */}
            <div className="flex flex-col items-center text-center justify-center select-none">
              <svg viewBox="0 0 100 100" className="w-9 h-9 text-white/90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1.2" />
                <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="50" cy="50" r="4.5" fill="currentColor" />
              </svg>
              <span className="font-serif tracking-wider font-normal text-lg text-white lowercase">glyph</span>
            </div>

            {/* Right: GitHub Repo Link (Aligned Right) */}
            <div className="flex justify-center md:justify-end items-center text-sm font-serif text-white/90">
              <a 
                href="https://github.com/ayatinkering/GLYPH" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>github repository</span>
                <span className="text-xs">↗</span>
              </a>
            </div>
          </div>

          {/* Bottom disclaimer */}
          <div className="text-sm sm:text-base font-serif text-white select-none tracking-widest">
            {"© 2026 GLYPH Inc.    All Rights Reserved. "}
          </div>
        </div>
      </footer>
    </div>
  );
}

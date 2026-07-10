"use client";

import { motion } from "framer-motion";

export function GlyphWordmark() {
  const letters = [
    { char: "G", color: "hover:text-nature-forest" },      // Moss/Forest Green
    { char: "L", color: "hover:text-nature-lavender" },    // Lavender
    { char: "Y", color: "hover:text-nature-gold" },        // Sunflower Gold
    { char: "P", color: "hover:text-nature-sky" },         // Sky Blue
    { char: "H", color: "hover:text-nature-forest" },      // Forest Green
  ];

  return (
    <div className="flex justify-center items-center select-none py-4">
      <h1 className="font-serif font-normal text-[15vw] sm:text-[12vw] md:text-[10rem] leading-none tracking-tight flex">
        {letters.map((item, index) => (
          <motion.span
            key={index}
            className={`inline-block text-neutral-900 transition-colors duration-500 ${item.color} px-[2px]`}
            whileHover={{
              scale: 1.05,
              y: -10,
              transition: { type: "spring", stiffness: 300, damping: 15 },
            }}
          >
            {item.char}
          </motion.span>
        ))}
      </h1>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Playfair_Display, EB_Garamond } from "next/font/google";
import { Fraunces, Alice } from "next/font/google";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { LightRays } from "@/components/ui/light-rays"


const fraunces = Fraunces({
  subsets: ["latin"],
  display: 'swap',
  weight: ["700", "900"],
});

const alice = Alice({
  subsets: ["latin"],
  weight: ["400"],
});

const playfair = Playfair_Display({ subsets: ["latin"], style: 'italic' });
const garamond = EB_Garamond({ subsets: ["latin"], style: 'italic' });

import {
  CloudRain,
  Leaf,
  Wind,
  Sun,
  Zap
} from "lucide-react";

export default function Home() {
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
  
      <section className="relative min-h-[90vh] mt-20 flex flex-col items-center justify-center py-12 px-4">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl bottom-0 right-0 animate-pulse delay-700" />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />
        </div>
          <LightRays />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative space-y-4 text-center"
        >
          <div className="flex flex-col items-center sm:items-start max-w-fit mx-auto">
            <h1 className={`${fraunces.className} text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-left leading-[0.9]`}>
              <span className="inline-block text-primary">
                Paper Trace
              </span>
            </h1>
          </div>
        </motion.div>
      </section>    
    </div>
  );
}
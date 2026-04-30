"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Fraunces } from "next/font/google";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LightRays } from "@/components/ui/light-rays";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["700", "900"],
});

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-background">
      {/* ================= HERO ================= */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 text-center">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute w-[500px] h-[500px] bg-primary/10 blur-3xl top-10 left-10 rounded-full" />
          <div className="absolute w-[400px] h-[400px] bg-secondary/10 blur-3xl bottom-10 right-10 rounded-full" />
          <LightRays />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 40 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl space-y-6"
        >
          <h1
            className={`${fraunces.className} text-5xl sm:text-6xl md:text-7xl font-black leading-tight`}
          >
            Detect Similarity in <span className="text-primary">Seconds</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload question papers or enter a single question to instantly find
            similarities from past data. Fast, accurate, and built for students
            and educators.
          </p>

          {/* CTA */}
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/dashboard/similarity">
              <Button size="lg" className="px-8">
                Try Similarity Check
              </Button>
            </Link>

            <Link href="/about">
              <Button variant="outline" size="lg" className="px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">What You Can Do</h2>
          <p className="text-muted-foreground mt-2">
            Powerful tools designed for students and educators
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl border bg-white/40 backdrop-blur-md p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Check Question Similarity</h3>
            <p className="text-muted-foreground text-sm">
              Enter a question and instantly find similar questions from past papers.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border bg-white/40 backdrop-blur-md p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Upload Full Papers</h3>
            <p className="text-muted-foreground text-sm">
              Upload PDFs and analyze entire question papers at once.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border bg-white/40 backdrop-blur-md p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">AI Matching Engine</h3>
            <p className="text-muted-foreground text-sm">
              Advanced algorithms ensure accurate and meaningful similarity detection.
            </p>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-24 px-6 bg-muted/40">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">1</div>
              <p className="font-medium">Input your question or upload PDF</p>
            </div>

            <div>
              <div className="text-4xl font-bold mb-2">2</div>
              <p className="font-medium">Our AI analyzes and compares data</p>
            </div>

            <div>
              <div className="text-4xl font-bold mb-2">3</div>
              <p className="font-medium">Get similarity scores instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Check Your Paper?
        </h2>

        <Link href="/dashboard/similarity">
          <Button size="lg">Start Now</Button>
        </Link>
      </section>
    </div>
  );
}

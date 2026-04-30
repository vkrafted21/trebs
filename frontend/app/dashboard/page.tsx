"use client"

import { Container } from "@/components/ui/container"
import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Fraunces } from "next/font/google"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/contexts/session-context"
import { MessageSquare, ArrowRight } from "lucide-react";

const fraunces = Fraunces({ subsets: ["latin"] })

export default function Dashboard() {
    const [currentTime, setCurrentTime] = useState(new Date())
    const router = useRouter()
    const { user } = useSession()

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

   // const handleStartTherapy = () => router.push("/therapy/new")
   

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto pt-20 space-y-10">

  {/* Header */}
  <div>
    <h1 className="text-4xl font-bold">Welcome back</h1>
    <p className="text-muted-foreground">
      Quickly access your tools and continue your work
    </p>
  </div>

  {/* Actions Grid */}
  <div className="grid md:grid-cols-3 gap-6">

    {/* MAIN ACTION */}
    <button
      onClick={() => router.push("/dashboard/similarity")}
      className="col-span-2 group rounded-3xl bg-card border border-border p-8 flex justify-between items-center hover:scale-[1.02] transition"
    >
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-primary" />
        </div>
        <div className="text-left">
          <p className="text-xl font-semibold">Check Paper Similarity</p>
          <p className="text-sm text-muted-foreground">
            Analyze questions instantly
          </p>
        </div>
      </div>
      <ArrowRight className="opacity-40 group-hover:translate-x-1 transition" />
    </button>

    {/* SECONDARY */}
    <div className="space-y-6">

      <button className="w-full rounded-2xl bg-card border border-border p-5 text-left hover:bg-white/5 transition">
        <p className="font-medium">Upload Paper</p>
        <p className="text-xs text-muted-foreground">
          Analyze full PDFs
        </p>
      </button>

      <button className="w-full rounded-2xl bg-card border border-border p-5 text-left hover:bg-white/5 transition">
        <p className="font-medium">View Results</p>
        <p className="text-xs text-muted-foreground">
          Past similarity checks
        </p>
      </button>

    </div>

  </div>
</div>
        </div>
    )
}
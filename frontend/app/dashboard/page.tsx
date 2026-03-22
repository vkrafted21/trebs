"use client"

import { Container } from "@/components/ui/container"
import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Fraunces } from "next/font/google"
import { 
  MessageSquare, 
  ArrowRight,  
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/contexts/session-context"

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
            <Container className="pt-20 pb-8 space-y-12">
                
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-2">
                    <h1 className={`${fraunces.className} text-4xl font-bold text-slate-900`}>Welcome back, {user?.name}</h1>
                    <p className="text-muted-foreground font-medium italic">{currentTime.toLocaleDateString("en-us", { weekday: "long", month: "long", day: "numeric" })}</p>
                </motion.div>

                <div className="max-w-6xl">
                    <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-6 shadow-sm border border-white/40">
                        <div className="flex flex-col md:flex-row justify-between items-stretch gap-16">
                            <div className="flex-1">
                                <Button className="w-full h-full min-h-[140px] justify-between items-center px-10 py-6 bg-slate-900 hover:bg-slate-800 transition-all rounded-[2rem] group relative overflow-hidden">
                                    <div className="flex items-center gap-6 text-left relative z-10">
                                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <MessageSquare className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-white mb-1">Check Paper Similarity</div>
                                            <div className="text-white/50 text-xs font-medium max-w-[180px]">some description five words</div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-white opacity-40 group-hover:translate-x-1 transition-transform relative z-10 right-4" />
                                </Button>
                            </div>
                            
                        </div>
                    </div>
                </div>

            </Container>
        </div>
    )
}
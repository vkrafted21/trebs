"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/contexts/session-context"
import { MessageSquare, ArrowRight } from "lucide-react"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from "recharts"

const COLORS = [
  "#AC8F8F",
  "#E6D0B8",
  "#C1B08F",
  "#8AA08A",
  "#6A3E3E",
  "#BFA6A0"
]

export default function Dashboard() {
  const router = useRouter()
  const { user } = useSession()

  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await fetch("/api/analytics", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto pt-20 space-y-10">

        {/* ORIGINAL HEADER */}
        <div>
          <h1 className="text-4xl font-bold">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>

          <p className="text-muted-foreground">
            Quickly access your tools and continue your work
          </p>
        </div>

        {/* ORIGINAL ACTION GRID */}
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
                <p className="text-xl font-semibold">
                  Check Paper Similarity
                </p>

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

        {/* ANALYTICS SECTION */}
        {loading ? (
          <div className="bg-card border rounded-2xl p-10">
            Loading analytics...
          </div>
        ) : analytics && (
          <>
            {/* STATS CARDS */}
            <div className="grid md:grid-cols-3 gap-6">

              <div className="bg-card border rounded-2xl p-6">
                <p className="text-sm text-muted-foreground">
                  Total Questions
                </p>
                <p className="text-4xl font-bold mt-2">
                  {analytics.total_questions}
                </p>
              </div>

              <div className="bg-card border rounded-2xl p-6">
                <p className="text-sm text-muted-foreground">
                  Bloom Levels Used
                </p>
                <p className="text-4xl font-bold mt-2">
                  {analytics.charts.bl_distribution.length}
                </p>
              </div>



            </div>

            {/* CHARTS */}
            <div className="grid md:grid-cols-2 gap-8">

              {/* PIE */}
              <div className="bg-card border rounded-2xl p-6 h-[420px]">
                <h2 className="font-semibold mb-4">
                  Bloom Level Distribution
                </h2>

                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={analytics.charts.bl_distribution}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={130}
                      label
                    >
                      {analytics.charts.bl_distribution.map(
                        (_: any, index: number) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* LINE */}
              <div className="bg-card border rounded-2xl p-6 h-[420px]">
                <h2 className="font-semibold mb-4">
                  BL Trend by Year
                </h2>

                <ResponsiveContainer width="100%" height="90%">
                  <LineChart
                    data={analytics.charts.bl_trend_by_year}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />

                    <Line dataKey="BL1" stroke="#AC8F8F" />
                    <Line dataKey="BL2" stroke="#E6D0B8" />
                    <Line dataKey="BL3" stroke="#C1B08F" />
                    <Line dataKey="BL4" stroke="#8AA08A" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* BAR */}
              <div className="bg-card border rounded-2xl p-6 h-[420px]">
                <h2 className="font-semibold mb-4">
                  Average Difficulty
                </h2>

                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={analytics.charts.avg_difficulty}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />

                    <Bar
                      dataKey="score"
                      fill="#6366f1"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* STACKED */}
              <div className="bg-card border rounded-2xl p-6 h-[420px]">
                <h2 className="font-semibold mb-4">
                  Partwise BL Comparison
                </h2>

                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={analytics.charts.partwise_bl}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="part" />
                    <YAxis />
                    <Tooltip />
                    <Legend />

                    <Bar stackId="a" dataKey="BL1" fill="#6366f1" />
                    <Bar stackId="a" dataKey="BL2" fill="#22c55e" />
                    <Bar stackId="a" dataKey="BL3" fill="#f59e0b" />
                    <Bar stackId="a" dataKey="BL4" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* REPEATED QUESTIONS */}
            <div className="bg-card border rounded-2xl p-6">
              <h2 className="font-semibold mb-5">
                Most Repeated Questions
              </h2>

              <div className="space-y-3">
                {analytics.charts.most_repeated_questions.map(
                  (item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between border-b pb-2 text-sm"
                    >
                      <span className="w-[85%]">
                        {item.question}
                      </span>

                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
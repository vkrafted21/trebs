"use client";

import { useState } from "react";
import { Upload, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { findSimilarQuestion } from "@/lib/api/question";
import { useSession } from "@/lib/contexts/session-context";

export default function SimilarityPage() {
  const { isAuthenticated } = useSession();

  const [question, setQuestion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [singleResults, setSingleResults] = useState<any[]>([]);
  const [paperResults, setPaperResults] = useState<any>(null);

  const [error, setError] = useState("");

  // ---------------- SINGLE QUESTION ----------------
  const handleTextSubmit = async () => {
    if (!question.trim()) return;

    if (!isAuthenticated) {
      setError("Please login first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await findSimilarQuestion(question);

      setSingleResults(data.results || []);
      setPaperResults(null);

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PDF UPLOAD ----------------
  const handleFileSubmit = async () => {
    if (!file) return;

    if (!isAuthenticated) {
      setError("Please login first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");

      const res = await fetch("/api/similarity/upload-paper", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      setPaperResults(data);
      setSingleResults([]);

    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- BADGE ----------------
  const getBadge = (score: number) => {
    if (score >= 0.85) return "bg-red-500/20 text-red-400";
    if (score >= 0.65) return "bg-yellow-500/20 text-yellow-400";
    return "bg-green-500/20 text-green-400";
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-4 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold">Check Similarity</h1>
        <p className="text-muted-foreground mt-2">
          Upload full paper or test a single question instantly.
        </p>
      </div>

      {/* PDF CARD */}
      <div className="rounded-3xl border p-6 bg-card shadow-lg space-y-4">
        <div className="flex gap-2 items-center font-semibold text-lg">
          <Upload className="w-5 h-5 text-primary" />
          Upload Question Paper
        </div>

        <Input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <Button onClick={handleFileSubmit} disabled={loading}>
          {loading ? "Analyzing..." : "Check Full Paper"}
        </Button>
      </div>

      {/* TEXT CARD */}
      <div className="rounded-3xl border p-6 bg-card shadow-lg space-y-4">
        <div className="flex gap-2 items-center font-semibold text-lg">
          <FileText className="w-5 h-5 text-primary" />
          Check Single Question
        </div>

        <Textarea
          placeholder="Enter question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-h-[120px]"
        />

        <Button onClick={handleTextSubmit} disabled={loading}>
          {loading ? "Checking..." : "Check Similarity"}
        </Button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="text-red-400 font-medium text-center">
          {error}
        </div>
      )}

      {/* SINGLE QUESTION RESULTS */}
      {singleResults.length > 0 && (
        <div className="rounded-3xl border p-6 bg-card shadow-lg space-y-4">
          <h2 className="text-xl font-semibold">Results</h2>

          {singleResults.map((r: any, i: number) => (
            <div
              key={i}
              className="p-4 rounded-xl border flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{r.question}</p>
                <p className="text-sm text-muted-foreground">
                  Year: {r.year} | Part: {r.part}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getBadge(
                  r.similarity
                )}`}
              >
                {(r.similarity * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* PDF RESULTS */}
      {paperResults && (
        <div className="space-y-8">

          <div className="rounded-3xl border p-6 bg-card shadow-lg">
            <h2 className="text-2xl font-bold">
              Paper Analysis
            </h2>

            <p className="text-muted-foreground mt-2">
              Total Questions: {paperResults.total_questions}
            </p>
          </div>

          {/* PART A */}
          <div className="rounded-3xl border p-6 bg-card shadow-lg space-y-5">
            <h3 className="text-xl font-semibold">PART-A</h3>

            {paperResults.part_a?.map((q: any, i: number) => (
              <div key={i} className="border rounded-xl p-4 space-y-3">
                <p className="font-medium">{q.question}</p>

                {q.matches?.map((m: any, j: number) => (
                  <div
                    key={j}
                    className="flex justify-between text-sm text-muted-foreground"
                  >
                    <span>{m.question}</span>

                    {m.similarity && (
                      <span
                        className={`px-2 py-1 rounded ${getBadge(
                          m.similarity
                        )}`}
                      >
                        {(m.similarity * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* PART B */}
          {Object.entries(paperResults.part_b || {}).map(
            ([unit, questions]: any, idx: number) => (
              <div
                key={idx}
                className="rounded-3xl border p-6 bg-card shadow-lg space-y-5"
              >
                <h3 className="text-xl font-semibold">{unit}</h3>

                {questions.map((q: any, i: number) => (
                  <div key={i} className="border rounded-xl p-4 space-y-3">
                    <p className="font-medium">{q.question}</p>

                    {q.matches?.map((m: any, j: number) => (
                      <div
                        key={j}
                        className="flex justify-between text-sm text-muted-foreground"
                      >
                        <span>{m.question}</span>

                        {m.similarity && (
                          <span
                            className={`px-2 py-1 rounded ${getBadge(
                              m.similarity
                            )}`}
                          >
                            {(m.similarity * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
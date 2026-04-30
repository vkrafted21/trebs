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
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");

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
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async () => {
    if (!file) return;

    if (!isAuthenticated) {
      setError("Please login first");
      return;
    }

    console.log("PDF upload coming soon:", file);
  };

  return (
    <div className="max-w-5xl mx-auto py-16 px-4 space-y-10">

      {/* ===== HEADER ===== */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Check Similarity
        </h1>
        <p className="text-muted-foreground">
          Upload a full paper or test a single question to find matches instantly.
        </p>
      </div>

      {/* ===== UPLOAD CARD ===== */}
      <div className="rounded-3xl bg-card backdrop-blur-xl border border-border p-6 space-y-5 shadow-lg">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Upload className="w-5 h-5 text-primary" />
          Upload Question Paper
        </div>

        <Input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <Button
          onClick={handleFileSubmit}
          disabled={loading}
          className="bg-primary hover:opacity-90 transition"
        >
          Check Full Paper
        </Button>
      </div>

      {/* ===== TEXT CARD ===== */}
      <div className="rounded-3xl bg-card backdrop-blur-xl border border-border p-6 space-y-5 shadow-lg">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <FileText className="w-5 h-5 text-primary" />
          Check Single Question
        </div>

        <Textarea
          placeholder="Enter your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-h-[120px]"
        />

        <Button
          onClick={handleTextSubmit}
          disabled={loading}
          className="bg-primary hover:opacity-90 transition"
        >
          {loading ? "Checking..." : "Check Similarity"}
        </Button>
      </div>

      {/* ===== ERROR ===== */}
      {error && (
        <p className="text-red-400 text-center font-medium">{error}</p>
      )}

      {/* ===== RESULTS ===== */}
      {results.length > 0 && (
        <div className="rounded-3xl bg-card backdrop-blur-xl border border-border p-6 space-y-4 shadow-lg">
          <h2 className="text-xl font-semibold">Results</h2>

          {results.map((r, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border flex justify-between items-center hover:bg-white/5 transition"
            >
              <div>
                <p className="font-medium">{r.question}</p>
                <p className="text-sm text-muted-foreground">
                  Year: {r.year} | Part: {r.part || "-"}
                </p>
              </div>

              <div
                className={`font-semibold text-lg ${
                  r.similarity > 0.8
                    ? "text-red-400"
                    : r.similarity > 0.5
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {(r.similarity * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
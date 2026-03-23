"use client";

import { useState } from "react";
import { Upload, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { findSimilarQuestion } from "@/lib/api/question";
import { useSession } from "@/lib/contexts/session-context";

export default function SimilarityPage() {
  const { isAuthenticated, loading: sessionLoading } = useSession();

  const [question, setQuestion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");

  //  text similarity
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
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      
      <h1 className="text-3xl font-bold tracking-tight">
        Check Similarity Score
      </h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Upload className="w-5 h-5" />
            Upload Question Paper (PDF)
          </div>

          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <Button onClick={handleFileSubmit} disabled={loading}>
            Check Full Paper
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <FileText className="w-5 h-5" />
            Check Single Question
          </div>

          <Textarea
            placeholder="Enter your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <Button onClick={handleTextSubmit} disabled={loading}>
            {loading ? "Checking..." : "Check Similarity"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <p className="text-red-500 text-center font-medium">{error}</p>
      )}

      {/* ================= RESULTS ================= */}
      {results.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Results</h2>

            {results.map((r, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{r.question}</p>
                  <p className="text-sm text-muted-foreground">
                    Year: {r.year} | Part: {r.part || "-"}
                  </p>
                </div>

                <div
                  className={`font-semibold ${
                    r.similarity > 0.8
                      ? "text-red-500"
                      : r.similarity > 0.5
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {(r.similarity * 100).toFixed(2)}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
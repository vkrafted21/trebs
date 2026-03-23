interface SimilarityResult {
  question: string;
  year: number;
  part?: string;
  bl: string;
  similarity: number;
}

// 🔐 get token
function getToken() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");
  return token;
}

// 🔐 headers
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// 🔍 check similarity (single question)
export async function findSimilarQuestion(question: string) {
  const res = await fetch("/api/similarity/similar", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ question }),
  });

  return res.json();
}

// ➕ add question
export async function addQuestion(
  question: string,
  year: number,
  part: string,
  bl: string
) {
  const res = await fetch("/api/similarity/add-question", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      question,
      year,
      part,
      bl,
    }),
  });

  return res.json();
}
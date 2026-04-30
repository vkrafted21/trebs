import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const API_URL = process.env.BACKEND_API_URL || "http://localhost:8000";
  const token = req.headers.get("authorization");

  const formData = await req.formData();

  try {
    const response = await fetch(`${API_URL}/analyze-paper`, {
      method: "POST",
      headers: {
        Authorization: token || "",
      },
      body: formData,
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Upload failed" },
      { status: 500 }
    );
  }
}
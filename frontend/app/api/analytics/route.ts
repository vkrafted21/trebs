import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const API_URL =
    process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

  const token = req.headers.get("authorization");

  if (!token) {
    return NextResponse.json(
      { message: "No token provided" },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/analytics`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });

  } catch (error) {
    return NextResponse.json(
      {
        message: "Server error",
        error,
      },
      { status: 500 }
    );
  }
}
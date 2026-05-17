import { AnalyzeResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export async function analyzePost(payload: { post_link?: string; comments?: { username: string; comment: string }[] }): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE}/analyze_post`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Analyze request failed.");
  }
  return response.json();
}

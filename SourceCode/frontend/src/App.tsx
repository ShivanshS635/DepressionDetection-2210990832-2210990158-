import { FormEvent, useEffect, useState } from "react";
import { CommentTable } from "./components/CommentTable";
import { UserRiskPanel } from "./components/UserRiskPanel";
import { analyzePost } from "./services/api";
import { AnalyzeResponse } from "./types";

function App() {
  const [postLink, setPostLink] = useState("");
  const [commentsJson, setCommentsJson] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const parsed = commentsJson.trim() ? JSON.parse(commentsJson) : null;
      const payload: any = {};
      if (postLink.trim().length > 0) payload.post_link = postLink.trim();
      if (parsed) payload.comments = parsed;
      const data = await analyzePost(payload);
      setResult(data);
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error("API call failed with error:", err);
      // More descriptive error state
      if (errorMessage.includes("No simulated thread found")) {
        setError("Error: No simulated thread found for this post link. Please provide a mock fixture or use the comments fallback.");
      } else {
        setError(`Processing Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
      <header style={{ textAlign: "center", marginBottom: 40 }} className="animate-fade-in">
        <h1>Depression Detection Engine</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          AI-powered comment thread severity analysis platform.
        </p>
      </header>

      <div className="glass-panel animate-fade-in delay-1" style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Analyze Thread</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Provide a link to a social media post, or fallback to JSON array of comments.
        </p>
        <form onSubmit={submit}>
          <label htmlFor="post-link">Post URL</label>
          <input
            id="post-link"
            value={postLink}
            onChange={(e) => setPostLink(e.target.value)}
            placeholder="https://x.com/sample/post/123"
          />
          <label htmlFor="comments-json">JSON Comments Fallback</label>
          <textarea
            id="comments-json"
            rows={6}
            value={commentsJson}
            onChange={(e) => setCommentsJson(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Processing NLP Model..." : "Evaluate Content Engine"}
          </button>
        </form>
        {error && <p style={{ color: "var(--color-severe)", marginTop: 16 }}>{error}</p>}
      </div>

      {result && (
        <div className="animate-fade-in delay-2">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>Processing Results</h2>
            <div className="badge mild" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
              API v{result.model_version || "1.0"} • {result.total_comments} Comments
            </div>
          </div>

          <UserRiskPanel users={result.user_risk_rankings} />

          <h3 style={{ marginTop: 40, marginBottom: 16 }}>Detailed Breakdown</h3>
          <CommentTable rows={result.processed_comments} />
        </div>
      )}
    </main>
  );
}

export default App;

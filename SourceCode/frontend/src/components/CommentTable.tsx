import { CommentPrediction } from "../types";

type Props = { rows: CommentPrediction[] };

export function CommentTable({ rows }: Props) {
  const getBadgeClass = (label: string) => {
    switch (label) {
      case "Normal": return "badge normal";
      case "Mild": return "badge mild";
      case "Severe": return "badge severe";
      default: return "badge";
    }
  };

  return (
    <div className="table-wrapper glass-panel" style={{ padding: 0, overflow: "auto" }}>
      <table>
        <thead>
          <tr>
            <th style={{ width: "10%" }}>User</th>
            <th style={{ width: "35%" }}>Comment</th>
            <th style={{ width: "30%" }}>Reasoning Insights</th>
            <th style={{ width: "10%" }}>Risk Score</th>
            <th style={{ width: "8%" }}>Label</th>
            <th style={{ width: "7%" }}>Conf.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={`${row.username}-${idx}`}>
              <td style={{ fontWeight: 500 }}>@{row.username}</td>
              <td style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {row.comment}
              </td>
              <td>
                {row.top_tokens && row.top_tokens.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                    {row.top_tokens.map((tt, i) => (
                      <span key={i} style={{
                        fontSize: "0.75rem",
                        background: "rgba(255,255,255,0.06)",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "var(--text-primary)",
                        display: "flex",
                        gap: "4px",
                        alignItems: "center"
                      }}>
                        {tt.token}
                        <span style={{ opacity: 0.5, fontSize: "0.7rem", fontVariantNumeric: "tabular-nums" }}>
                          {tt.importance.toFixed(2)}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
                {row.explanation && (
                  <div style={{ fontSize: "0.80rem", color: "var(--text-secondary)", fontStyle: "italic", borderLeft: "2px solid var(--accent-color)", paddingLeft: 8 }}>
                    {row.explanation}
                  </div>
                )}
              </td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(row.risk_score * 100, 100)}%`,
                        background: row.label === "Severe" ? "var(--color-severe)" : row.label === "Mild" ? "var(--color-mild)" : "var(--color-normal)",
                        transition: "width 1s ease-out"
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.85rem", fontVariantNumeric: "tabular-nums" }}>
                    {(row.risk_score * 100).toFixed(1)}
                  </span>
                </div>
              </td>
              <td>
                <span className={getBadgeClass(row.label)}>{row.label}</span>
              </td>
              <td style={{ fontVariantNumeric: "tabular-nums", fontSize: "0.9rem" }}>
                {(row.confidence * 100).toFixed(0)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

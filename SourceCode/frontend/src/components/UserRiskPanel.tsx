import { UserRiskProfile } from "../types";

type Props = { users: UserRiskProfile[] };

export function UserRiskPanel({ users }: Props) {
  const getRiskColorClass = (riskLevel: string) => {
    switch (riskLevel) {
      case "High Risk": return "high";
      case "Medium Risk": return "medium";
      case "Low Risk": return "low";
      default: return "";
    }
  };

  const getBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case "High Risk": return "badge severe";
      case "Medium Risk": return "badge mild";
      case "Low Risk": return "badge normal";
      default: return "badge";
    }
  };

  return (
    <div className="glass-panel" style={{ padding: "20px 24px" }}>
      <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        User Aggregation Profiles
        <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          {users.length} Users Found
        </span>
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
        {users.map((user) => {
          const colorClass = getRiskColorClass(user.risk_level);
          return (
            <div key={user.username} className={`risk-card ${colorClass}`}>
              <div className="user-meta">
                <div className="user-name">@{user.username}</div>
                <div className="user-stats">
                  Avg Risk: {(user.average_risk_score * 100).toFixed(1)}
                  <br />
                  Depressive Comments: <strong style={{ color: "var(--text-primary)" }}>{user.depressive_comment_count}</strong> / {user.total_comments}
                </div>
              </div>
              <div>
                <span className={getBadgeClass(user.risk_level)}>{user.risk_level}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

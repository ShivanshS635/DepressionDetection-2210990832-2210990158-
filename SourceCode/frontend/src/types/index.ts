export type TokenImportance = {
  token: string;
  importance: number;
};

export type CommentPrediction = {
  username: string;
  comment: string;
  label: "Normal" | "Mild" | "Severe";
  confidence: number;
  risk_score: number;
  top_tokens: TokenImportance[];
  explanation: string;
};

export type UserRiskProfile = {
  username: string;
  average_risk_score: number;
  depressive_comment_count: number;
  total_comments: number;
  risk_level: "Low Risk" | "Medium Risk" | "High Risk";
};

export type AnalyzeResponse = {
  processed_comments: CommentPrediction[];
  user_risk_rankings: UserRiskProfile[];
  model_version: string;
  total_comments: number;
};

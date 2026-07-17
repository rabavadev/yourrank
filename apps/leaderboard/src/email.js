// Re-export shared email helpers. The implementation lives in shared/email.ts so
// both the leaderboard and bot Workers can use the same send/onboarding logic.
export * from "../../../shared/email.js";

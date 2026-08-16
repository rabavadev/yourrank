import { cookiesPage } from "../../../../../apps/leaderboard/src/pages/cookies.js";
import { marketingResponse } from "@/lib/marketing";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return marketingResponse(cookiesPage);
}

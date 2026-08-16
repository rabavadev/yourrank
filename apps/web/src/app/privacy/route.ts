import { privacyPage } from "../../../../../apps/leaderboard/src/pages/privacy.js";
import { marketingResponse } from "@/lib/marketing";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return marketingResponse(privacyPage);
}

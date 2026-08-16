import { termsPage } from "../../../../../apps/leaderboard/src/pages/terms.js";
import { marketingResponse } from "@/lib/marketing";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return marketingResponse(termsPage);
}

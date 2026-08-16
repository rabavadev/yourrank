import { pricingPage } from "../../../../../apps/leaderboard/src/pages/pricing.js";
import { marketingResponse } from "@/lib/marketing";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return marketingResponse(pricingPage);
}

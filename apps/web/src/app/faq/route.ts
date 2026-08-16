import { faqPage } from "../../../../../apps/leaderboard/src/pages/faq.js";
import { marketingResponse } from "@/lib/marketing";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return marketingResponse(faqPage);
}

import { refundPage } from "../../../../../apps/leaderboard/src/pages/refund.js";
import { marketingResponse } from "@/lib/marketing";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return marketingResponse(refundPage);
}

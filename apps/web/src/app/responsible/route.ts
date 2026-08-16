import { responsiblePage } from "../../../../../apps/leaderboard/src/pages/responsible.js";
import { marketingResponse } from "@/lib/marketing";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return marketingResponse(responsiblePage);
}

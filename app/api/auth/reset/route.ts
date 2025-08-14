import { NextRequest } from "next/server";
import { resetPassword } from "../../../../server/controllers/auth.controller";

export async function POST(req: NextRequest) {
  return resetPassword(req);
}
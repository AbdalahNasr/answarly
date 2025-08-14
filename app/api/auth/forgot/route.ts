import { NextRequest } from "next/server";
import { forgotPassword } from "../../../../server/controllers/auth.controller";

export async function POST(req: NextRequest) {
  return forgotPassword(req);
}
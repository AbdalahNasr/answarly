// app/api/test-db/route.ts
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  await connectToDatabase();
  return new Response(JSON.stringify({ message: "DB Connected" }), { status: 200 });
}

// pages/api/test.ts
import { connectToDatabase } from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase(); // This will log to terminal
  res.status(200).json({ message: "Connected" });
}

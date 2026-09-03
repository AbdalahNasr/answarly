import { NextRequest, NextResponse } from "next/server";
import { verifyResetCode } from "@/server/services/passwordReset.service";

export async function POST(req: NextRequest) {
    try {
        const { email, code } = await req.json();
        if (!email || !code) {
            return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
        }
        const result = await verifyResetCode(email, code);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

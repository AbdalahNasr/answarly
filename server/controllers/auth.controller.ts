// server/controllers/auth.controller.ts
import { NextRequest, NextResponse } from "next/server";
import * as UserService from "../services/user.service";

export async function register(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();
    const user = await UserService.registerUser(username, email, password);
    return NextResponse.json({ message: "User registered", user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function login(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const { token, user } = await UserService.loginUser(email, password);
    return NextResponse.json({ token, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function forgotPassword(req: NextRequest) {
  try {
    const { email } = await req.json();
    const result = await UserService.requestPasswordReset(email);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function resetPassword(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    const result = await UserService.resetPassword(token, newPassword);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
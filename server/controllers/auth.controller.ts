// server/controllers/auth.controller.ts
import { NextRequest, NextResponse } from "next/server";
import * as UserService from "../services/user.service";
import { connectToDatabase } from '@/lib/db'
import User from '@/server/models/user.model'
import bcrypt from 'bcrypt'
import * as FileSystemUserService from '@/server/services/user.filesystem.service'
import { saveBase64Image } from '../lib/file-store'

export async function register(req: NextRequest) {
  try {
  const { username, email, password, avatarUrl, avatarBase64, avatarFilename } = await req.json();

  console.log('[auth.controller] register: received', { username, email, hasAvatarBase64: !!avatarBase64, avatarFilename });

  let finalAvatarUrl: string | undefined = undefined
  if (avatarBase64 && avatarFilename) {
    finalAvatarUrl = await saveBase64Image(avatarBase64, avatarFilename)
  } else if (avatarUrl) {
    finalAvatarUrl = avatarUrl
  }

  const user = await UserService.registerUser(username, email, password, finalAvatarUrl);
  console.log('[auth.controller] register: created user', { id: user?.id || user?._id, email: user?.email });
    return NextResponse.json({ message: "User registered", user }, { status: 201 });
  } catch (error: any) {
  console.error('[auth.controller] register: error', error && (error.stack || error.message || error));
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function login(req: NextRequest) {
  try {
  const { email, password } = await req.json();
  console.log('[auth.controller] login: attempt', { email });
  const { token, user } = await UserService.loginUser(email, password);
  console.log('[auth.controller] login: success', { id: user?.id || user?._id, email: user?.email });
    return NextResponse.json({ token, user });
  } catch (error: any) {
  console.error('[auth.controller] login: error', error && (error.stack || error.message || error));
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

export async function changePassword(req: NextRequest) {
  try {
    const { userId, oldPassword, newPassword } = await req.json();
    if (!userId || !oldPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 })
    }

    // Attempt DB-backed flow first
    try {
      await connectToDatabase();
      const user = await User.findById(userId).exec();
      if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

      const match = await bcrypt.compare(oldPassword, user.password as string)
      if (!match) return NextResponse.json({ success: false, message: 'Invalid current password' }, { status: 401 })

      const hashed = await bcrypt.hash(newPassword, 10)
      user.password = hashed as any
      await user.save()

      return NextResponse.json({ success: true, message: 'Password changed' })
    } catch (dbErr) {
      // Fallback to filesystem/service strategy
      try {
        // userService strategy may be filesystem; use provided helpers
        // findUserById is only available for filesystem strategy via UserService
        const existing: any = await (UserService.findUserById ? UserService.findUserById(userId as string) : FileSystemUserService.findUserById(userId as string))
        if (!existing) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

        // If filesystem returns hashed password, verify it
        if (existing.password) {
          const match = await bcrypt.compare(oldPassword, existing.password)
          if (!match) return NextResponse.json({ success: false, message: 'Invalid current password' }, { status: 401 })
        } else {
          // As a last resort attempt loginUser which will throw on invalid creds
          await UserService.loginUser(existing.email, oldPassword)
        }

        // Use filesystem service to update the password if available
        if (FileSystemUserService.updateUserPassword) {
          await FileSystemUserService.updateUserPassword(userId, newPassword)
        } else if (UserService.updateUser) {
          // Last resort: store hashed password into updateUser
          const hashed = await bcrypt.hash(newPassword, 10)
          await UserService.updateUser(userId, { password: hashed as any })
        }

        return NextResponse.json({ success: true, message: 'Password changed' })
      } catch (err: any) {
        console.error('changePassword fallback error', err && (err.message || err))
        return NextResponse.json({ success: false, message: 'Failed to change password' }, { status: 500 })
      }
    }
  } catch (error: any) {
    console.error('changePassword error', error && (error.message || error))
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
  }
}
import { NextRequest } from 'next/server'
import { changePassword } from '@/server/controllers/auth.controller'

export async function POST(req: NextRequest) {
  return changePassword(req)
}

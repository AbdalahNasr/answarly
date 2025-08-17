import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/server/models/user.model'
import { saveBase64Image } from '@/server/lib/file-store'
import { getStorageStrategy } from '@/server/config/storage.config'
import mongoose from 'mongoose'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
  const { id } = (await params) as { id: string }
  const user = await User.findById(id).lean()
    if (!user) return Response.json({ success: false, message: 'User not found' }, { status: 404 })
    return Response.json({ success: true, user })
  } catch (err) {
    console.error('GET /api/users/[id] error', err)
    return Response.json({ success: false, message: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    console.log('[api/users/[id] PATCH] storage strategy:', getStorageStrategy())
    const body = await request.json()
    const updates: any = {}

    if (body.username) updates.username = body.username
    if (body.avatarBase64 && body.avatarFilename) {
      console.log('[api/users/[id] PATCH] processing avatar upload')
      // body.avatarBase64 may be a data URL like 'data:image/png;base64,...' — strip prefix if present
      let b64 = body.avatarBase64
      const match = String(b64).match(/base64,(.*)$/)
      if (match) b64 = match[1]
      
      const publicPath = await saveBase64Image(b64, body.avatarFilename)
      updates.avatarUrl = publicPath
      console.log('[api/users/[id] PATCH] saved avatar', { publicPath: publicPath.substring(0, 100) + '...', filename: body.avatarFilename })
      console.log('[api/users/[id] PATCH] updates object:', updates)
    }

    const { id } = (await params) as { id: string }
    console.log('[api/users/[id] PATCH] updating user with:', updates)
    console.log('[api/users/[id] PATCH] user ID:', id)
    
    // First, let's check what the user looks like before update
    const userBefore = await User.findById(id).lean()
    console.log('[api/users/[id] PATCH] user before update:', userBefore)
    
    // Try using raw MongoDB collection update
    const db = mongoose.connection.db
    const usersCollection = db.collection('users')
    
    const result = await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updates }
    )
    
    console.log('[api/users/[id] PATCH] MongoDB update result:', result)
    
    // Now fetch the updated user
    const user = await User.findById(id)
    if (!user) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 })
    }
    
    // Convert Mongoose document to plain object
    const userObject = user.toObject()
    
    console.log('[api/users/[id] PATCH] user updated successfully, avatarUrl length:', userObject.avatarUrl?.length || 0)
    console.log('[api/users/[id] PATCH] avatarUrl starts with:', userObject.avatarUrl?.substring(0, 50))
    console.log('[api/users/[id] PATCH] full user object keys:', Object.keys(userObject))
    console.log('[api/users/[id] PATCH] full user object:', JSON.stringify(userObject, null, 2))
    return Response.json({ success: true, user: userObject })
  } catch (err) {
    console.error('PATCH /api/users/[id] error', err)
    return Response.json({ success: false, message: 'Failed to update user', error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
  const { id } = (await params) as { id: string }
  const user = await User.findByIdAndDelete(id).lean()
    if (!user) return Response.json({ success: false, message: 'User not found' }, { status: 404 })
    return Response.json({ success: true, message: 'User deleted' })
  } catch (err) {
    console.error('DELETE /api/users/[id] error', err)
    return Response.json({ success: false, message: 'Failed to delete user' }, { status: 500 })
  }
}

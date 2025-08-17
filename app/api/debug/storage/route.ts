import { NextRequest } from 'next/server'
import { getStorageStrategy } from '@/server/config/storage.config'
import { connectToDatabase } from '@/lib/db'
import User from '@/server/models/user.model'

export async function GET(request: NextRequest) {
  try {
    const strategy = getStorageStrategy()
    await connectToDatabase()
    
    // Get a sample user to check their avatar
    const user = await User.findOne().lean()
    
    return Response.json({
      success: true,
      storageStrategy: strategy,
      sampleUser: user ? {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        avatarUrlLength: user.avatarUrl?.length || 0,
        avatarUrlType: user.avatarUrl?.startsWith('data:') ? 'data-url' : 'file-path'
      } : null,
      totalUsers: await User.countDocuments()
    })
  } catch (err) {
    console.error('Debug storage error:', err)
    return Response.json({ 
      success: false, 
      error: err instanceof Error ? err.message : String(err) 
    }, { status: 500 })
  }
}
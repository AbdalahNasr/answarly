import fs from 'fs/promises'
import path from 'path'
import { getStorageStrategy } from '../config/storage.config'

export async function saveBase64Image(base64: string, filename: string): Promise<string> {
  const strategy = getStorageStrategy()
  console.log('[file-store] saveBase64Image called with strategy:', strategy)
  
  if (strategy === 'filesystem') {
    console.log('[file-store] using filesystem storage')
    // Filesystem storage - save to public/uploads/avatars
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    await fs.mkdir(uploadsDir, { recursive: true })

    const safeName = filename.replace(/[^a-z0-9\.\-\_]/gi, '_')
    const uniqueName = `${Date.now()}-${safeName}`
    const filePath = path.join(uploadsDir, uniqueName)

    const buffer = Buffer.from(base64, 'base64')
    await fs.writeFile(filePath, buffer)

    return `/uploads/avatars/${uniqueName}`
  } else {
    console.log('[file-store] using database storage')
    // For avatars, always use filesystem storage to avoid database size limits
    console.log('[file-store] switching to filesystem for avatar')
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    await fs.mkdir(uploadsDir, { recursive: true })

    const safeName = filename.replace(/[^a-z0-9\.\-\_]/gi, '_')
    const uniqueName = `${Date.now()}-${safeName}`
    const filePath = path.join(uploadsDir, uniqueName)

    const buffer = Buffer.from(base64, 'base64')
    await fs.writeFile(filePath, buffer)

    return `/uploads/avatars/${uniqueName}`
  }
}

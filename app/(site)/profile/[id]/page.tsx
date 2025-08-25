"use client"

import React, { useEffect, useState } from 'react'
import Avatar from '@/components/avatar'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
const PencilIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 21v-3.6L14.6 6.8l3.6 3.6L7 21H3zM20.7 7.3l-3.6-3.6 1.9-1.9a1 1 0 011.4 0l1.2 1.2a1 1 0 010 1.4l-1.9 1.9z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const TrashIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18" strokeWidth="1.2" strokeLinecap="round"/><path d="M8 6v14a2 2 0 002 2h4a2 2 0 002-2V6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const CheckIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const XIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const CameraIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 7h3l2-2h6l2 2h3v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="13" r="3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
)

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [history, setHistory] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  // Next.js may pass `params` as a Promise in newer versions — unwrap with React.use if available
  // @ts-ignore
  const _resolvedParams = (React as any).use ? (React as any).use(params) : params
  const id = _resolvedParams?.id
  const router = useRouter()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [editingName, setEditingName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // derive avatar src with cache-bust token when needed (same as navbar)
  const getDisplayAvatar = () => {
    const url = user?.avatarUrl
    if (!url) return null // Let Avatar component handle letters display
    // if url already contains a timestamp token 't=', don't append another
    if (url.includes('t=')) return url
    return `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`
  }

  useEffect(() => {
    if (!id) return
    fetch(`/api/users/${id}?t=${Date.now()}`)
      .then((r) => r.json())
      .then((j) => setUser(j.user || null))
    fetch(`/api/quiz?userId=${id}&action=history`)
      .then((r) => r.json())
      .then((j) => setHistory(j.history || []))
  }, [id])

  // Listen for user updates from other components (like navbar)
  useEffect(() => {
    const onUserUpdated = () => {
      try {
        const raw = localStorage.getItem('answerly-user')
        if (raw) {
          const updatedUser = JSON.parse(raw)
          // Only update if it's the same user
          if (updatedUser.id === id || updatedUser._id === id) {
            setUser(updatedUser)
          }
        }
      } catch (e) {
        // ignore
      }
    }
    
    const onStorage = () => {
      try {
        const raw = localStorage.getItem('answerly-user')
        if (raw) {
          const updatedUser = JSON.parse(raw)
          // Only update if it's the same user
          if (updatedUser.id === id || updatedUser._id === id) {
            setUser(updatedUser)
          }
        }
      } catch (e) {
        // ignore
      }
    }
    
    window.addEventListener('user-updated', onUserUpdated)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('user-updated', onUserUpdated)
      window.removeEventListener('storage', onStorage)
    }
  }, [id])

  useEffect(() => {
    setEditingName(user?.username || '')
  }, [user])

  const saveName = async () => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: editingName }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || data?.message || 'Update failed')
      setUser(data.user)
      try { localStorage.setItem('answerly-user', JSON.stringify(data.user)); window.dispatchEvent(new Event('user-updated')) } catch (e) {}
      setEditing(false)
      toast({ title: 'Updated', description: 'Username updated' })
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message || 'Please try again', variant: 'destructive' })
    }
  }

  const deleteAccount = async () => {
    const ok = confirm('Delete account? This cannot be undone.')
    if (!ok) return
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d?.error || d?.message || 'Delete failed')
      }
      toast({ title: 'Account deleted', description: 'Redirecting to home...' })
      setTimeout(() => router.push('/'), 400)
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message || 'Please try again', variant: 'destructive' })
    }
  }

  return (
    <main className="p-6 bg-gradient-to-b from-indigo-50/30 via-white to-white dark:from-black dark:via-slate-900 min-h-[70vh]">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl bg-white/90 dark:bg-[#0b1220]/80 border border-white/60 dark:border-white/6 shadow-lg p-6 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <label className="relative rounded-full p-1 bg-gradient-to-br from-fuchsia-500 to-indigo-500 cursor-pointer" htmlFor="avatar-input">
                <div className="rounded-full bg-white dark:bg-slate-800 p-0.5">
                    <div className="rounded-full shadow-md overflow-hidden w-[88px] h-[88px] flex items-center justify-center">
                    <Avatar asButton={false} src={avatarPreview ?? getDisplayAvatar()} name={user?.username} size={88} />
                  </div>
                </div>
                <div className="absolute -right-1 -bottom-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow-md">
                  <CameraIcon className="h-4 w-4 text-zinc-700" />
                </div>
                <input id="avatar-input" type="file" accept="image/*" className="sr-only" aria-label="Upload profile picture" onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  
                  // optimistic preview
                  const url = URL.createObjectURL(f)
                  setAvatarPreview(url)
                  const reader = new FileReader()
                  reader.onload = async () => {
                    const base64 = String(reader.result || '')
                    
                    try {
                      const res = await fetch(`/api/users/${id}`, { 
                        method: 'PATCH', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ avatarBase64: base64, avatarFilename: f.name }) 
                      })
                      const data = await res.json()
                      
                      if (!res.ok) throw new Error(data?.error || data?.message || 'Upload failed')
                      setUser(data.user)
                      try { localStorage.setItem('answerly-user', JSON.stringify(data.user)); window.dispatchEvent(new Event('user-updated')) } catch (e) {}
                      setAvatarPreview(null)
                      // Force a small delay to ensure the avatar updates properly
                      setTimeout(() => {
                        window.dispatchEvent(new Event('user-updated'))
                      }, 100)
                      toast({ title: 'Avatar updated' })
                    } catch (err: any) {
                      setAvatarPreview(null)
                      toast({ title: 'Upload failed', description: err.message || 'Try again', variant: 'destructive' })
                    } finally {
                      // revoke object URL after some time
                      setTimeout(() => URL.revokeObjectURL(url), 30000)
                    }
                  }
                  reader.readAsDataURL(f)
                }} />
              </label>

              <div className="text-sm">
                {/* stack name and email vertically */}
                <div className="flex flex-col items-start">
                  {editing ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="!h-9 !p-2 rounded-md border-slate-200" />
                        <button onClick={saveName} aria-label="save" className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-md p-1"><CheckIcon className="h-4 w-4" /></button>
                        <button onClick={() => { setEditing(false); setEditingName(user?.username || '') }} aria-label="cancel" className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-700 rounded-md p-1 ml-1"><XIcon className="h-4 w-4 text-zinc-700 dark:text-zinc-200" /></button>
                      </div>
                      {/* show email while editing as well, below the input row */}
                      {user?.email && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 underline decoration-indigo-400 decoration-2 underline-offset-2">
                          <a href={`mailto:${user.email}`}>{user.email}</a>
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{user?.username ?? 'User'}</h1>
                        {user?.email && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 underline decoration-indigo-400 decoration-2 underline-offset-2">
                            <a href={`mailto:${user.email}`}>{user.email}</a>
                          </p>
                        )}
                      </div>
                      <button onClick={() => setEditing(true)} aria-label="edit name" className="mt-2 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"><PencilIcon className="h-4 w-4" /> <span className="text-xs">Edit name</span></button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
          </div>
          {/* action buttons moved below */}
          <div className="mt-4 flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/my-questions')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0"
            >
              My Questions
            </Button>
            <Dialog open={passwordOpen} onOpenChange={(open) => setPasswordOpen(open)}>
              <DialogTrigger asChild>
                <Button variant="outline">Change password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change password</DialogTitle>
                  <DialogDescription>Enter your current password and pick a new one.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <div className="relative">
                    <Input type={showOldPassword ? 'text' : 'password'} placeholder="Current password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowOldPassword(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-zinc-500">{showOldPassword ? 'Hide' : 'Show'}</button>
                  </div>
                  <div className="relative">
                    <Input type={showNewPassword ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowNewPassword(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-zinc-500">{showNewPassword ? 'Hide' : 'Show'}</button>
                  </div>
                  <div className="relative">
                    <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowConfirmPassword(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-zinc-500">{showConfirmPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <DialogFooter>
                  <div className="flex gap-2 w-full justify-end">
                    <Button variant="secondary" onClick={() => setPasswordOpen(false)}>Cancel</Button>
                    <Button onClick={async () => {
                      if (!oldPassword || !newPassword) return toast({ title: 'Missing fields', description: 'Please fill both fields', variant: 'destructive' })
                      if (newPassword !== confirmPassword) return toast({ title: 'Mismatch', description: 'The new passwords do not match', variant: 'destructive' })
                      try {
                        const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id, oldPassword, newPassword }) })
                        const d = await res.json()
                        if (!res.ok) throw new Error(d?.error || d?.message || 'Change failed')
                        toast({ title: 'Password changed' })
                        setPasswordOpen(false)
                        setOldPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      } catch (err: any) {
                        toast({ title: 'Change failed', description: err.message || 'Try again', variant: 'destructive' })
                      }
                    }}>Save</Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <button onClick={deleteAccount} className="ml-2 inline-flex items-center bg-gradient-to-r from-red-500 to-fuchsia-600 text-white px-4 py-2 rounded-md shadow hover:opacity-95"><TrashIcon className="h-4 w-4 mr-2" /> <span className="text-sm font-medium">Delete account</span></button>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">Progress & History</h2>
          <div className="mt-4 space-y-3">
            {history.length === 0 && <p className="text-zinc-500">No history yet.</p>}
            {history.map((h) => (
              <div key={h._id} className="p-3 border rounded">
                <div className="flex justify-between">
                  <div>Score: {h.score}</div>
                  <div className="text-zinc-500">{new Date(h.completedAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
  </main>
  )
}

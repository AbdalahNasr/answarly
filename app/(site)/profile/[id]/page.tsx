"use client"

import React, { useEffect, useState } from 'react'
import Avatar from '@/components/avatar'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ClientOnly } from '@/components/ui/client-only'

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
              <ClientOnly>
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
                    
                    const formData = new FormData()
                    formData.append('avatar', f)
                    
                    try {
                      const token = localStorage.getItem('answerly-token')
                      const res = await fetch(`/api/users/${id}/avatar`, { 
                        method: 'POST', 
                        headers: {
                          'Authorization': `Bearer ${token}`
                        },
                        body: formData 
                      })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data?.error || data?.message || 'Upload failed')
                      setUser(data.user)
                      try { localStorage.setItem('answerly-user', JSON.stringify(data.user)); window.dispatchEvent(new Event('user-updated')) } catch (e) {}
                      setAvatarPreview(null)
                      toast({ title: 'Avatar updated', description: 'Profile picture updated successfully' })
                    } catch (err: any) {
                      setAvatarPreview(null)
                      toast({ title: 'Upload failed', description: err.message || 'Please try again', variant: 'destructive' })
                    }
                  }} />
                </label>
              </ClientOnly>
              <div className="flex-1">
                <ClientOnly>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 bg-white/50 dark:bg-white/5 border-white/60 dark:border-white/10"
                        placeholder="Enter username"
                      />
                      <Button size="sm" onClick={saveName} className="bg-green-600 hover:bg-green-700">
                        <CheckIcon className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{user?.username || 'Loading...'}</h1>
                      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </ClientOnly>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">{user?.email || 'Loading...'}</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-white/50 dark:bg-white/5 border-white/60 dark:border-white/10">
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Current Password</label>
                      <div className="relative">
                        <Input
                          type={showOldPassword ? "text" : "password"}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="bg-white/50 dark:bg-white/5 border-white/60 dark:border-white/10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                        >
                          {showOldPassword ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">New Password</label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-white/50 dark:bg-white/5 border-white/60 dark:border-white/10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-white/50 dark:bg-white/5 border-white/60 dark:border-white/10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPasswordOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={async () => {
                      if (newPassword !== confirmPassword) {
                        toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' })
                        return
                      }
                      try {
                        const res = await fetch('/api/auth/change-password', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ oldPassword, newPassword })
                        })
                        const data = await res.json()
                        if (!res.ok) throw new Error(data?.error || data?.message || 'Password change failed')
                        toast({ title: 'Password changed', description: 'Your password has been updated successfully' })
                        setPasswordOpen(false)
                        setOldPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      } catch (err: any) {
                        toast({ title: 'Password change failed', description: err.message || 'Please try again', variant: 'destructive' })
                      }
                    }}>
                      Change Password
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30">
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive" onClick={deleteAccount}>
                      Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Quiz History</h2>
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-zinc-600 dark:text-zinc-400">No quiz history yet.</p>
              ) : (
                history.map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-lg border border-white/60 dark:border-white/10">
                    <div>
                      <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{quiz.title || 'Quiz'}</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Score: {quiz.score}/{quiz.total} ({Math.round((quiz.score / quiz.total) * 100)}%)
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        {new Date(quiz.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/quiz/take?quizId=${quiz.quizId}`)}>
                      Retake
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

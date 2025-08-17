"use client"

import React, { useEffect, useState } from 'react'

export default function Avatar({ src, name, size = 40, onClick, asButton = true }: { src?: string | null; name?: string | null; size?: number; onClick?: () => void; asButton?: boolean }) {
  // Compute initials: first letter of up to first two words. If single word, take first two letters.
  const initials = (() => {
    const n = (name || '').trim();
    if (!n) return '?';
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return (parts[0].slice(0, 2)).toUpperCase();
    }
    return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
  })();

  const style = `inline-flex items-center justify-center rounded-full overflow-hidden select-none bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold`;

  const [imgErrored, setImgErrored] = useState(false)

  useEffect(() => {
    // reset error state when src changes
    setImgErrored(false)
  }, [src])

  const content = src && !imgErrored ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name || 'avatar'} style={{ width: size, height: size, objectFit: 'cover' }} className="rounded-full" onError={() => setImgErrored(true)} />
  ) : (
    <div className={style} style={{ width: size, height: size, fontSize: Math.max(12, Math.floor(size / 2.5)) }}>{initials}</div>
  )

  if (asButton) {
    return (
      <button onClick={onClick} aria-label={name ? `${name} profile` : 'Profile'} className="rounded-full" style={{ width: size, height: size }}>
        {content}
      </button>
    )
  }

  return (
    <div aria-label={name ? `${name} profile` : 'Profile'} className="rounded-full" style={{ width: size, height: size }}>
      {content}
    </div>
  )
}

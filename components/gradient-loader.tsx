"use client"

export default function GradientLoader({ size = 20 }: { size?: number }) {
  const s = size
  const stroke = 3
  const r = (s - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      role="status"
      aria-label="Loading"
      className="animate-spin"
      style={{ transformOrigin: "center" }}
    >
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <circle cx={s / 2} cy={s / 2} r={r} stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} fill="none" />
      <circle
        cx={s / 2}
        cy={s / 2}
        r={r}
        stroke="url(#grad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${c * 0.3} ${c}`}
        strokeDashoffset={c * 0.1}
      />
    </svg>
  )
}

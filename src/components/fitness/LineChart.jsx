import { useRef, useState, useEffect } from 'react'

export default function LineChart({ points, color = '#1a1a1a', height = 80 }) {
  const containerRef = useRef(null)
  const [W, setW] = useState(280)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width
      if (w && w > 0) setW(w)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  if (!points || points.length < 2) {
    if (points?.length === 1) {
      return (
        <div ref={containerRef} className="flex items-center justify-center" style={{ height }}>
          <span className="text-xs text-gray-400">{points[0].y}kg — only one session logged</span>
        </div>
      )
    }
    return <div ref={containerRef} style={{ height }} />
  }

  const H = height
  const PAD = { top: 8, right: 40, bottom: 18, left: 28 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom

  const ys = points.map(p => p.y)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const rangeY = maxY - minY || 1

  const toX = (i) => PAD.left + (i / (points.length - 1)) * iW
  const toY = (v) => PAD.top + iH - ((v - minY) / rangeY) * iH

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.y)}`).join(' ')

  const areaD = [
    `M ${toX(0)} ${toY(points[0].y)}`,
    ...points.slice(1).map((p, i) => `L ${toX(i + 1)} ${toY(p.y)}`),
    `L ${toX(points.length - 1)} ${H - PAD.bottom}`,
    `L ${toX(0)} ${H - PAD.bottom}`,
    'Z'
  ].join(' ')

  const last = points[points.length - 1]

  return (
    <div ref={containerRef} style={{ width: '100%', height }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaD} fill={`url(#grad-${color.replace('#','')})`} />

        {/* Y axis labels */}
        {[minY, maxY].map((v, i) => (
          <text key={i} x={PAD.left - 4} y={toY(v) + 3} textAnchor="end" fontSize={8} fill="#aaa">
            {v}
          </text>
        ))}

        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={toX(i)} cy={toY(p.y)} r={i === points.length - 1 ? 3.5 : 2} fill={color} opacity={i === points.length - 1 ? 1 : 0.5} />
        ))}

        {/* Last value label */}
        <text x={toX(points.length - 1) + 5} y={toY(last.y) + 3} fontSize={9} fill={color} fontWeight="600">
          {last.y}kg
        </text>

        {/* X axis dates — first and last */}
        <text x={toX(0)} y={H - 2} fontSize={8} fill="#ccc" textAnchor="middle">{points[0].label}</text>
        <text x={toX(points.length - 1)} y={H - 2} fontSize={8} fill="#ccc" textAnchor="middle">{last.label}</text>
      </svg>
    </div>
  )
}

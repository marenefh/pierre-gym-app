import { useRef, useState } from 'react'

const REVEAL_WIDTH = 72
const SNAP_THRESHOLD = 36

export default function SwipeableSetRow({ children, onDelete, disabled = false }) {
  const [offset, setOffset] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [animating, setAnimating] = useState(false)
  const touch = useRef({ startX: null, startOffset: null })

  const snapTo = (target) => {
    setAnimating(true)
    setOffset(target)
    setIsRevealed(target !== 0)
  }

  const handleTouchStart = (e) => {
    if (disabled) return
    setAnimating(false)
    touch.current = { startX: e.touches[0].clientX, startOffset: offset }
  }

  const handleTouchMove = (e) => {
    if (touch.current.startX === null || disabled) return
    const dx = e.touches[0].clientX - touch.current.startX
    // Only handle horizontal swipes (suppress vertical conflict when dx is dominant)
    const newOffset = Math.max(-REVEAL_WIDTH, Math.min(0, touch.current.startOffset + dx))
    setOffset(newOffset)
  }

  const handleTouchEnd = () => {
    if (touch.current.startX === null || disabled) return
    const dx = offset - touch.current.startOffset
    if (dx < -SNAP_THRESHOLD) snapTo(-REVEAL_WIDTH)
    else if (dx > SNAP_THRESHOLD) snapTo(0)
    else snapTo(isRevealed ? -REVEAL_WIDTH : 0)
    touch.current = { startX: null, startOffset: null }
  }

  const handleDelete = () => {
    snapTo(0)
    onDelete()
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Red delete button revealed behind */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-500"
        style={{ width: REVEAL_WIDTH, borderRadius: 'inherit' }}
      >
        <button
          onClick={handleDelete}
          className="text-white text-xs font-semibold w-full h-full flex items-center justify-center"
        >
          Delete
        </button>
      </div>
      {/* Row content slides left */}
      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: animating ? 'transform 0.18s ease' : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

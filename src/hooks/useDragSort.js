import { useState, useRef, useCallback } from 'react'

export function useDragSort(onReorder) {
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const state = useRef({ dragging: null, dragOver: null })

  const onHandleTouchStart = useCallback((idx) => (e) => {
    e.stopPropagation()
    state.current = { dragging: idx, dragOver: idx }
    setDragging(idx)
    setDragOver(idx)
  }, [])

  const onListTouchMove = useCallback((e) => {
    if (state.current.dragging === null) return
    e.preventDefault()
    const touch = e.touches[0]
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    if (!el) return
    const card = el.closest('[data-drag-idx]')
    if (!card) return
    const idx = parseInt(card.getAttribute('data-drag-idx'))
    if (!isNaN(idx) && idx !== state.current.dragOver) {
      state.current.dragOver = idx
      setDragOver(idx)
    }
  }, [])

  const onListTouchEnd = useCallback(() => {
    const { dragging: from, dragOver: to } = state.current
    if (from !== null && to !== null && from !== to) {
      onReorder(from, to)
    }
    state.current = { dragging: null, dragOver: null }
    setDragging(null)
    setDragOver(null)
  }, [onReorder])

  return { dragging, dragOver, onHandleTouchStart, onListTouchMove, onListTouchEnd }
}

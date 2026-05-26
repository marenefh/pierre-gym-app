import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { Shuffle, PenLine, Plus, X, ImagePlus, Trash2, Check } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAppContext } from '../context/AppContext'
import { STORAGE_KEYS } from '../store/appStore'
import ConfirmModal from '../components/ConfirmModal'

function uid() { return Math.random().toString(36).slice(2) }

const NEW_QUOTES = []

function getGreeting(name) {
  const h = new Date().getHours()
  if (h >= 4 && h < 11) return `Good morning, ${name} ☀️`
  if (h >= 11 && h < 14) return `Good day, ${name} 🌤`
  if (h >= 14 && h < 17) return `Good afternoon, ${name} ⛅`
  if (h >= 17 && h < 20) return `Good evening, ${name} 🌙`
  return `Good night, ${name} 🌙`
}

export default function Dashboard({ onStartWorkout }) {
  const { settings } = useAppContext()
  const today = new Date()

  // ── Text quotes ─────────────────────────────────────────────────────────────
  const [quotes, setQuotes] = useLocalStorage(STORAGE_KEYS.QUOTES, NEW_QUOTES)
  const [quoteIdx, setQuoteIdx] = useLocalStorage(STORAGE_KEYS.QUOTE_INDEX, 0)
  const [quoteVersion, setQuoteVersion] = useLocalStorage('pierre_quote_version', '0')

  useEffect(() => {
    if (quoteVersion !== '3') {
      setQuotes(NEW_QUOTES)
      setQuoteIdx(0)
      setQuoteVersion('3')
    }
  }, []) // eslint-disable-line

  // ── Photos ──────────────────────────────────────────────────────────────────
  const [photos, setPhotos] = useLocalStorage('pierre_photos', [])
  const [photoIdx, setPhotoIdx] = useLocalStorage('pierre_photo_index', 0)

  // ── Quote editor state ───────────────────────────────────────────────────────
  const [showQuoteLibrary, setShowQuoteLibrary] = useState(false)
  const [showAddQuoteModal, setShowAddQuoteModal] = useState(false)
  const [draftQuote, setDraftQuote] = useState({ text: '', author: '' })

  // ── Photo editor state ───────────────────────────────────────────────────────
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false)
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false)
  const [draftPhoto, setDraftPhoto] = useState({ dataUrl: '' })

  // ── Confirm modal ────────────────────────────────────────────────────────────
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null })
  const askConfirm = (message, fn) => setConfirm({ open: true, message, onConfirm: fn })
  const closeConfirm = () => setConfirm({ open: false, message: '', onConfirm: null })

  const fileRef = useRef(null)

  const safeQuoteIdx = Math.min(quoteIdx, Math.max(0, quotes.length - 1))
  const activeQuote = quotes[safeQuoteIdx] || NEW_QUOTES[0]

  const safePhotoIdx = Math.min(photoIdx, Math.max(0, photos.length - 1))
  const activePhoto = photos.length > 0 ? photos[safePhotoIdx] : null

  // ── Quote actions ────────────────────────────────────────────────────────────
  const shuffleQuote = () => {
    if (quotes.length <= 1) return
    let next = safeQuoteIdx
    while (next === safeQuoteIdx) next = Math.floor(Math.random() * quotes.length)
    setQuoteIdx(next)
  }

  const openAddQuoteModal = () => {
    setDraftQuote({ text: '', author: '' })
    setShowAddQuoteModal(true)
  }

  const saveQuote = () => {
    if (!draftQuote.text.trim()) return
    const newQ = { id: uid(), type: 'text', text: draftQuote.text.trim(), author: draftQuote.author.trim() }
    setQuotes(prev => {
      const next = [...prev, newQ]
      setQuoteIdx(next.length - 1)
      return next
    })
    setShowAddQuoteModal(false)
  }

  const deleteQuote = (id) => {
    setQuotes(prev => {
      const next = prev.filter(q => q.id !== id)
      if (next.length === 0) return next
      setQuoteIdx(Math.min(safeQuoteIdx, next.length - 1))
      return next
    })
  }

  // ── Photo actions ────────────────────────────────────────────────────────────
  const shufflePhoto = () => {
    if (photos.length <= 1) return
    let next = safePhotoIdx
    while (next === safePhotoIdx) next = Math.floor(Math.random() * photos.length)
    setPhotoIdx(next)
  }

  const openAddPhotoModal = () => {
    setDraftPhoto({ dataUrl: '' })
    setShowAddPhotoModal(true)
  }

  const savePhoto = () => {
    if (!draftPhoto.dataUrl) return
    const newP = { id: uid(), dataUrl: draftPhoto.dataUrl }
    setPhotos(prev => {
      const next = [...prev, newP]
      setPhotoIdx(next.length - 1)
      return next
    })
    setShowAddPhotoModal(false)
  }

  const deletePhoto = (id) => {
    setPhotos(prev => {
      const next = prev.filter(p => p.id !== id)
      if (next.length === 0) return next
      setPhotoIdx(Math.min(safePhotoIdx, next.length - 1))
      return next
    })
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setDraftPhoto(d => ({ ...d, dataUrl: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const dayName = format(today, 'EEEE')
  const dateStr = format(today, 'd MMMM yyyy')

  return (
    <div className="h-full overflow-y-auto tab-content bg-cream pb-safe">
      <div className="px-8 pb-0 safe-top" style={{ paddingTop: '36px' }}>

        {/* Header */}
        <div className="text-center" style={{ marginBottom: '34px' }}>
          <p className="text-gray-400 font-medium tracking-wide uppercase" style={{ fontSize: '1.1rem' }}>{dayName}</p>
          <h1 className="font-bold text-gray-900 leading-tight" style={{ fontSize: '2.2rem' }}>{dateStr}</h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: '1.1rem' }}>{getGreeting(settings.name)}</p>
        </div>

        {/* Text Quote Card */}
        <div className="bg-white shadow-card rounded-3xl p-4 mb-4">
          <p className="text-gray-700 text-sm font-medium leading-relaxed italic text-center">
            "{activeQuote.text}"
          </p>
          {activeQuote.author && (
            <p className="text-gray-400 text-xs mt-1.5 text-center">— {activeQuote.author}</p>
          )}
          <div className="flex items-center justify-end gap-1 mt-2 text-gray-400">
            <button onClick={shuffleQuote} className="p-1 hover:text-gray-600" title="Shuffle"><Shuffle size={13} /></button>
            <button onClick={() => setShowQuoteLibrary(true)} className="p-1 hover:text-gray-600" title="Edit"><PenLine size={13} /></button>
          </div>
        </div>

        {/* Workout CTA */}
        <button
          onClick={onStartWorkout}
          className="w-full flex items-center justify-center rounded-3xl px-5 py-6 shadow-card active:scale-[0.98] transition-all mb-4"
          style={{ backgroundColor: '#23395d' }}
        >
          <p className="font-semibold text-base leading-tight text-white">Log Today's Session</p>
        </button>

        {/* Photo Card */}
        <div className="rounded-3xl overflow-hidden shadow-card">
          {activePhoto ? (
            <div className="relative">
              <img src={activePhoto.dataUrl} alt="" className="w-full object-cover object-center" style={{ maxHeight: 300 }} />
              {activePhoto.caption && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <p className="absolute bottom-3 left-4 right-4 text-white text-sm font-medium italic">
                    "{activePhoto.caption}"
                  </p>
                </>
              )}
              <div className="absolute top-2 right-3 flex items-center gap-1">
                <button onClick={shufflePhoto} className="p-1 text-white opacity-70 hover:opacity-100"><Shuffle size={13} /></button>
                <button onClick={() => setShowPhotoLibrary(true)} className="p-1 text-white opacity-70 hover:opacity-100"><PenLine size={13} /></button>
              </div>
            </div>
          ) : (
            <div className="bg-white px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-gray-400 italic">No photo yet</p>
              <button onClick={() => setShowPhotoLibrary(true)} className="p-1 text-gray-400 hover:text-gray-600">
                <PenLine size={13} />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── My Quotes Library Modal ─────────────────────────────────────────── */}
      {showQuoteLibrary && (
        <div className="fixed inset-0 z-50"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', overflow: 'hidden' }}
          onClick={e => { if (e.target === e.currentTarget) setShowQuoteLibrary(false) }}>
          <div className="flex items-center justify-center h-full" style={{ paddingBottom: '68px' }}>
          <div className="bg-white mx-6 w-full rounded-3xl flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100dvh - 160px)' }}>
            <div className="px-5 pt-5 pb-3 flex-shrink-0 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">My Quotes</h3>
              <button onClick={() => setShowQuoteLibrary(false)}
                className="p-1.5 rounded-xl hover:bg-cream-dark text-gray-500">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="space-y-2">
                <button
                  onClick={openAddQuoteModal}
                  className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-3 text-sm font-semibold text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Add Quote
                </button>
                {quotes.map((q, i) => (
                  <div key={q.id} className={`flex items-start gap-3 bg-cream-dark rounded-2xl px-4 py-3 ${i === safeQuoteIdx ? 'ring-2 ring-gray-900' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug line-clamp-2 italic">"{q.text}"</p>
                      {q.author && <p className="text-xs text-gray-400 mt-0.5">— {q.author}</p>}
                    </div>
                    <button onClick={() => { setQuoteIdx(i); setShowQuoteLibrary(false) }} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 flex-shrink-0">
                      <Check size={14} />
                    </button>
                    <button onClick={() => askConfirm('Delete this quote?', () => deleteQuote(q.id))} className="p-1.5 rounded-xl text-gray-300 hover:text-red-400 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ── Add Quote Modal (centered) ─────────────────────────────────────── */}
      {showAddQuoteModal && (
        <div className="fixed inset-0"
          style={{ zIndex: 60, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', overflow: 'hidden' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddQuoteModal(false) }}>
          <div className="flex items-center justify-center h-full" style={{ paddingBottom: '68px' }}>
          <div className="bg-white mx-6 w-full rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-base">Add Quote</h3>
              <button onClick={() => setShowAddQuoteModal(false)}
                className="p-1.5 rounded-xl hover:bg-cream-dark text-gray-500">
                <X size={16} />
              </button>
            </div>
            <textarea
              value={draftQuote.text}
              onChange={e => setDraftQuote(d => ({ ...d, text: e.target.value }))}
              rows={3}
              placeholder="Your quote…"
              autoFocus
              className="w-full bg-cream-dark rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none"
            />
            <input
              value={draftQuote.author}
              onChange={e => setDraftQuote(d => ({ ...d, author: e.target.value }))}
              placeholder="Author (optional)"
              className="w-full bg-cream-dark rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={saveQuote}
              disabled={!draftQuote.text.trim()}
              className="w-full py-3 rounded-2xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-40"
            >
              Add Quote
            </button>
          </div>
          </div>
        </div>
      )}

      {/* ── My Photos Library Modal ─────────────────────────────────────────── */}
      {showPhotoLibrary && (
        <div className="fixed inset-0 z-50"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', overflow: 'hidden' }}
          onClick={e => { if (e.target === e.currentTarget) setShowPhotoLibrary(false) }}>
          <div className="flex items-center justify-center h-full" style={{ paddingBottom: '68px' }}>
          <div className="bg-white mx-6 w-full rounded-3xl flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100dvh - 160px)' }}>
            <div className="px-5 pt-5 pb-3 flex-shrink-0 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">My Photos</h3>
              <button onClick={() => setShowPhotoLibrary(false)}
                className="p-1.5 rounded-xl hover:bg-cream-dark text-gray-500">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="space-y-3">
                <button
                  onClick={openAddPhotoModal}
                  className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-3 text-sm font-semibold text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Add Photo
                </button>
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((p, i) => (
                      <div key={p.id} className="relative aspect-square">
                        <img
                          src={p.dataUrl}
                          alt=""
                          onClick={() => { setPhotoIdx(i); setShowPhotoLibrary(false) }}
                          className="w-full h-full object-cover rounded-2xl cursor-pointer"
                        />
                        {i === safePhotoIdx && (
                          <div className="absolute inset-0 rounded-2xl ring-2 ring-gray-900 pointer-events-none" />
                        )}
                        <button
                          onClick={() => askConfirm('Delete this photo?', () => deletePhoto(p.id))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ── Add Photo Modal (centered) ─────────────────────────────────────── */}
      {showAddPhotoModal && (
        <div className="fixed inset-0"
          style={{ zIndex: 60, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', overflow: 'hidden' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddPhotoModal(false) }}>
          <div className="flex items-center justify-center h-full" style={{ paddingBottom: '68px' }}>
          <div className="bg-white mx-6 w-full rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-base">Add Photo</h3>
              <button onClick={() => setShowAddPhotoModal(false)}
                className="p-1.5 rounded-xl hover:bg-cream-dark text-gray-500">
                <X size={16} />
              </button>
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm hover:border-gray-300 transition-colors">
              <ImagePlus size={16} />
              {draftPhoto.dataUrl ? 'Change image' : 'Choose image'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            {draftPhoto.dataUrl && (
              <img src={draftPhoto.dataUrl} alt="Preview" className="w-full h-32 object-cover rounded-2xl" />
            )}
            <button
              onClick={savePhoto}
              disabled={!draftPhoto.dataUrl}
              className="w-full py-3 rounded-2xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-40"
            >
              Add Photo
            </button>
          </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirm.open}
        message={confirm.message}
        onConfirm={() => { confirm.onConfirm?.(); closeConfirm() }}
        onCancel={closeConfirm}
      />
    </div>
  )
}

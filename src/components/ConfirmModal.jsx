export default function ConfirmModal({ open, message, onConfirm, onCancel, confirmLabel = 'Delete' }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', paddingBottom: '68px' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-white mx-6 w-full rounded-3xl p-5 space-y-3" style={{ maxWidth: 360 }}>
        <p className="text-sm font-medium text-gray-800 text-center">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-cream-dark text-gray-600 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-semibold"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

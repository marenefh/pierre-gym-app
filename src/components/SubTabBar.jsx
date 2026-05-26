export default function SubTabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1.5 px-4 pt-5 pb-3 bg-cream safe-top flex-shrink-0">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-150
            ${active === id
              ? 'bg-gray-900 text-white shadow-soft'
              : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

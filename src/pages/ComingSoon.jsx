import { Dumbbell, Leaf, Flower2 } from 'lucide-react'

const iconMap = { dumbbell: Dumbbell, leaf: Leaf, flower: Flower2 }
const colorMap = {
  'pastel-blue':  { bg: 'bg-pastel-blue',  text: 'text-pastel-blue-text',  pill: 'bg-pastel-blue' },
  'pastel-green': { bg: 'bg-pastel-green', text: 'text-pastel-green-text', pill: 'bg-pastel-green' },
  'pastel-pink':  { bg: 'bg-pastel-pink',  text: 'text-pastel-pink-text',  pill: 'bg-pastel-pink' },
}

export default function ComingSoon({ name, color, icon }) {
  const Icon = iconMap[icon] || Dumbbell
  const c = colorMap[color] || colorMap['pastel-blue']

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
      <span className={`flex items-center justify-center w-20 h-20 rounded-3xl ${c.bg}`}>
        <Icon size={36} className={c.text} strokeWidth={1.6} />
      </span>
      <h2 className="text-2xl font-semibold text-gray-900">{name}</h2>
      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${c.bg} ${c.text}`}>
        Coming soon
      </span>
      <p className="text-gray-400 text-sm text-center max-w-xs">
        This tab is being built in Phase 2. Your data structure is already set up and ready.
      </p>
    </div>
  )
}

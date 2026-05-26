import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { AppProvider } from './context/AppContext'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import FitnessRoutines from './components/fitness/FitnessRoutines'
import FitnessProgress from './components/fitness/FitnessProgress'
import FitnessToday from './components/fitness/FitnessToday'

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}

function AppShell() {
  const [activeTab, setActiveTab] = useState('home')
  const [workoutOpen, setWorkoutOpen] = useState(false)

  const renderTab = () => {
    switch (activeTab) {
      case 'home':     return <Dashboard onStartWorkout={() => setWorkoutOpen(true)} />
      case 'routines': return <FitnessRoutines />
      case 'progress': return <FitnessProgress />
      default:         return <Dashboard onStartWorkout={() => setWorkoutOpen(true)} />
    }
  }

  return (
    <div className="flex flex-col bg-cream overflow-hidden" style={{ height: '100dvh' }}>
      <main className="flex-1 min-h-0 overflow-hidden relative">
        {renderTab()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Workout overlay */}
      {workoutOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-cream" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 flex-shrink-0">
            <button
              onClick={() => setWorkoutOpen(false)}
              className="p-2 rounded-xl hover:bg-cream-dark text-gray-500"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Today's Workout</h1>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <FitnessToday />
          </div>
        </div>
      )}
    </div>
  )
}

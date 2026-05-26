import { useState } from 'react'
import SubTabBar from '../components/SubTabBar'
import Habits from '../components/wellbeing/Habits'
import Journal from '../components/wellbeing/Journal'
import Pomodoro from '../components/wellbeing/Pomodoro'

const TABS = [
  { id: 'habits',   label: 'Habits' },
  { id: 'journal',  label: 'Journal' },
  { id: 'pomodoro', label: 'Focus' },
]

export default function WellbeingTab() {
  const [subtab, setSubtab] = useState('habits')
  return (
    <div className="h-full flex flex-col bg-cream">
      <SubTabBar tabs={TABS} active={subtab} onChange={setSubtab} />
      <div className="flex-1 overflow-hidden">
        {subtab === 'habits'   && <Habits />}
        {subtab === 'journal'  && <Journal />}
        {subtab === 'pomodoro' && <Pomodoro />}
      </div>
    </div>
  )
}

import { useState } from 'react'
import SubTabBar from '../components/SubTabBar'
import FitnessRoutines from '../components/fitness/FitnessRoutines'
import FitnessToday from '../components/fitness/FitnessToday'
import FitnessProgress from '../components/fitness/FitnessProgress'

const TABS = [
  { id: 'routines',  label: 'Routines' },
  { id: 'today',     label: 'Today' },
  { id: 'progress',  label: 'Progress' },
]

export default function FitnessTab() {
  const [subtab, setSubtab] = useState('routines')
  return (
    <div className="h-full flex flex-col bg-cream">
      <SubTabBar tabs={TABS} active={subtab} onChange={setSubtab} />
      <div className="flex-1 overflow-hidden">
        {subtab === 'routines'  && <FitnessRoutines />}
        {subtab === 'today'     && <FitnessToday />}
        {subtab === 'progress'  && <FitnessProgress />}
      </div>
    </div>
  )
}

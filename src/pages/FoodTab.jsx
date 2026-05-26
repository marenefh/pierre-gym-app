import { useState } from 'react'
import SubTabBar from '../components/SubTabBar'
import Recipes from '../components/food/Recipes'
import MealPrepPlan from '../components/food/MealPrepPlan'
import GroceryList from '../components/food/GroceryList'
import CalorieTracker from '../components/food/CalorieTracker'

const TABS = [
  { id: 'recipes',   label: 'Recipes' },
  { id: 'mealprep',  label: 'Meal Prep' },
  { id: 'grocery',   label: 'Grocery' },
  { id: 'calories',  label: 'Calories' },
]

export default function FoodTab() {
  const [subtab, setSubtab] = useState('recipes')
  return (
    <div className="h-full flex flex-col bg-cream">
      <SubTabBar tabs={TABS} active={subtab} onChange={setSubtab} />
      <div className="flex-1 overflow-hidden">
        {subtab === 'recipes'  && <Recipes />}
        {subtab === 'mealprep' && <MealPrepPlan />}
        {subtab === 'grocery'  && <GroceryList />}
        {subtab === 'calories' && <CalorieTracker />}
      </div>
    </div>
  )
}

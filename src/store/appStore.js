export const STORAGE_KEYS = {
  // Dashboard
  QUOTE:        'pierre_quote',          // legacy single-quote (replaced by QUOTES)
  QUOTES:       'pierre_quotes',         // [{ id, type:'text'|'image', text, author, dataUrl }]
  QUOTE_INDEX:  'pierre_quote_index',
  TODOS:        'pierre_todos',
  SLEEP_TARGET: 'pierre_sleep_target',

  // Calendar
  EVENTS:          'pierre_events',
  ROUTINES:        'pierre_routines',
  NOTIFICATIONS:   'pierre_notifications',
  SCHOOL_SCHEDULE: 'pierre_school_schedule',

  // Fitness
  WORKOUT_ROUTINES:  'pierre_workout_routines',
  WORKOUT_LOG:       'pierre_workout_log',
  EXERCISE_LIBRARY:  'pierre_exercise_library',

  // Food
  RECIPES:       'pierre_recipes',
  MEAL_PREP_PLAN:'pierre_meal_prep_plan',
  GROCERY_EXTRAS:'pierre_grocery_extras',
  FOOD_LOG:      'pierre_food_log',
  CALORIE_GOAL:  'pierre_calorie_goal',

  // Wellbeing
  HABITS_LOG:    'pierre_habits_log',
  HABITS_CONFIG: 'pierre_habits_config',
  JOURNAL_ENTRIES:'pierre_journal',
  POMODORO_SETTINGS:'pierre_pomodoro',

  // Finances
  TRANSACTIONS:  'pierre_transactions',

  // Weekly Reset
  WEEKLY_GOALS:  'pierre_weekly_goals',   // { 'yyyy-WW': ['goal1', ...] }
  WEEKLY_RESET:  'pierre_weekly_reset',   // { 'yyyy-WW': { done: bool } }

  // Settings
  SETTINGS:      'pierre_settings',

  // PWA
  INSTALL_PROMPTED: 'pierre_install_prompted',
}

export const FINANCE_CATEGORIES = ['Food', 'Shopping', 'Entertainment', 'Salary', 'Other']

export const FINANCE_CATEGORY_COLORS = {
  Food:          '#c4517a',
  Shopping:      '#7c5cbf',
  Entertainment: '#d97706',
  Salary:        '#16a34a',
  Other:         '#888888',
}

export const DEFAULT_SETTINGS = {
  name:          'Pierre',
  calorieGoal:   1800,
  sleepHours:    8,
  waterGoalMl:   2000,
  stepsGoal:     10000,
  darkMode:      false,
}

export const DEFAULT_HABITS_CONFIG = [
  { id: 'isotretinoin', name: 'Isotretinoin', days: [] },
  { id: 'stretching',   name: 'Stretching',   days: [] },
  { id: 'vitaminD',     name: 'Vitamin D',    days: [0] },
]

export const DEFAULT_SLEEP_TARGET = { hour: 22, minute: 30, sleepHours: 8 }

export const DEFAULT_ROUTINES = {
  morningPrepMinutes:     60,
  eveningWindDownMinutes: 30,
  gymTravelMinutes:       20,
  schoolTravelMinutes:    15,
  campusTravelMinutes:    25,
  sleepHours:             8,
  targetSleepTime:        '22:30',
}

export const DEFAULT_NOTIFICATIONS = {
  sleepReminder:   { enabled: true,  time: '22:00' },
  morningReminder: { enabled: true,  time: '07:00' },
  mealReminder:    { enabled: false, time: '12:00' },
  workoutReminder: { enabled: false, time: '17:00' },
}

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Core', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Full Body',
]

export const DEFAULT_WORKOUT_ROUTINES = []

export const RECIPE_TAGS = ['breakfast', 'lunch', 'dinner', 'snack']
export const UNITS = ['g', 'kg', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'handful']

export const JOURNAL_PROMPTS = [
  "What did I do this week that I'm proud of?",
  "Where did I feel most like myself this week?",
  "What would I do differently if I could replay this week?",
  "What drained my energy this week, and what gave it back?",
  "What's one thing I learned about myself this week?",
  "Who made a positive difference in my life this week?",
  "What small moment this week made me smile?",
  "What am I holding onto that I could let go of?",
  "Where did I show up for myself this week?",
  "What does 'rest' mean to me right now?",
  "What am I most looking forward to in the coming week?",
  "What habit am I building, and how is it going?",
  "When did I feel most at peace this week?",
  "What's been on my mind that I haven't talked about?",
  "What does my body need more of right now?",
  "What is something I want to get better at, and why?",
  "Where did I spend my time this week — and was it intentional?",
  "What am I grateful for that I often take for granted?",
  "What fear did I face this week, even in a small way?",
  "If a close friend described my week, what would they say?",
]

export const DEFAULT_POMODORO   = { workMinutes: 25, breakMinutes: 5 }
export const MOOD_LABELS   = ['𓄼', '𖧧', '𖣂', 'ꕤ', '❀']
export const ENERGY_LABELS = ['·', '▲', '✦', '★', '✶']

export const DEFAULT_EXERCISE_LIBRARY = [
  // Back
  { id: 'p_back_01', name: 'Barbell Row',               muscleGroup: 'Back',       custom: false },
  { id: 'p_back_02', name: 'Cable Row',                 muscleGroup: 'Back',       custom: false },
  { id: 'p_back_03', name: 'Deadlift',                  muscleGroup: 'Back',       custom: false },
  { id: 'p_back_04', name: 'Hyperextension',            muscleGroup: 'Back',       custom: false },
  { id: 'p_back_05', name: 'Lat Pulldown',              muscleGroup: 'Back',       custom: false },
  { id: 'p_back_06', name: 'Pull Up',                   muscleGroup: 'Back',       custom: false },
  { id: 'p_back_07', name: 'Rack Pull',                 muscleGroup: 'Back',       custom: false },
  { id: 'p_back_08', name: 'Seated Row',                muscleGroup: 'Back',       custom: false },
  { id: 'p_back_09', name: 'Single-Arm Dumbbell Row',   muscleGroup: 'Back',       custom: false },
  { id: 'p_back_10', name: 'T-Bar Row',                 muscleGroup: 'Back',       custom: false },
  // Biceps
  { id: 'p_bi_01',   name: 'Barbell Curl',              muscleGroup: 'Biceps',     custom: false },
  { id: 'p_bi_02',   name: 'Cable Curl',                muscleGroup: 'Biceps',     custom: false },
  { id: 'p_bi_03',   name: 'Concentration Curl',        muscleGroup: 'Biceps',     custom: false },
  { id: 'p_bi_04',   name: 'Dumbbell Curl',             muscleGroup: 'Biceps',     custom: false },
  { id: 'p_bi_05',   name: 'EZ-Bar Curl',               muscleGroup: 'Biceps',     custom: false },
  { id: 'p_bi_06',   name: 'Hammer Curl',               muscleGroup: 'Biceps',     custom: false },
  { id: 'p_bi_07',   name: 'Incline Bicep Curl',        muscleGroup: 'Biceps',     custom: false },
  { id: 'p_bi_08',   name: 'Preacher Curl',             muscleGroup: 'Biceps',     custom: false },
  // Triceps
  { id: 'p_tri_01',  name: 'Cable Overhead Extension',  muscleGroup: 'Triceps',    custom: false },
  { id: 'p_tri_02',  name: 'Close-Grip Bench Press',    muscleGroup: 'Triceps',    custom: false },
  { id: 'p_tri_03',  name: 'Dip',                       muscleGroup: 'Triceps',    custom: false },
  { id: 'p_tri_04',  name: 'Overhead Tricep Extension', muscleGroup: 'Triceps',    custom: false },
  { id: 'p_tri_05',  name: 'Skull Crusher',             muscleGroup: 'Triceps',    custom: false },
  { id: 'p_tri_06',  name: 'Tricep Kickback',           muscleGroup: 'Triceps',    custom: false },
  { id: 'p_tri_07',  name: 'Tricep Pushdown',           muscleGroup: 'Triceps',    custom: false },
  // Shoulders
  { id: 'p_sh_01',   name: 'Arnold Press',              muscleGroup: 'Shoulders',  custom: false },
  { id: 'p_sh_02',   name: 'Cable Lateral Raise',       muscleGroup: 'Shoulders',  custom: false },
  { id: 'p_sh_03',   name: 'Dumbbell Shoulder Press',   muscleGroup: 'Shoulders',  custom: false },
  { id: 'p_sh_04',   name: 'Face Pull',                 muscleGroup: 'Shoulders',  custom: false },
  { id: 'p_sh_05',   name: 'Front Raise',               muscleGroup: 'Shoulders',  custom: false },
  { id: 'p_sh_06',   name: 'Incline DB Shoulder Press', muscleGroup: 'Shoulders',  custom: false },
  { id: 'p_sh_07',   name: 'Lateral Raise',             muscleGroup: 'Shoulders',  custom: false },
  { id: 'p_sh_08',   name: 'Overhead Press',            muscleGroup: 'Shoulders',  custom: false },
  { id: 'p_sh_09',   name: 'Rear Delt Fly',             muscleGroup: 'Shoulders',  custom: false },
  { id: 'p_sh_10',   name: 'Upright Row',               muscleGroup: 'Shoulders',  custom: false },
  // Chest
  { id: 'p_ch_01',   name: 'Bench Press',               muscleGroup: 'Chest',      custom: false },
  { id: 'p_ch_02',   name: 'Cable Fly',                 muscleGroup: 'Chest',      custom: false },
  { id: 'p_ch_03',   name: 'Decline Bench Press',       muscleGroup: 'Chest',      custom: false },
  { id: 'p_ch_04',   name: 'Dumbbell Fly',              muscleGroup: 'Chest',      custom: false },
  { id: 'p_ch_05',   name: 'Incline Bench Press',       muscleGroup: 'Chest',      custom: false },
  { id: 'p_ch_06',   name: 'Incline Dumbbell Press',    muscleGroup: 'Chest',      custom: false },
  { id: 'p_ch_07',   name: 'Push Up',                   muscleGroup: 'Chest',      custom: false },
  // Core
  { id: 'p_co_01',   name: 'Ab Rollout',                muscleGroup: 'Core',       custom: false },
  { id: 'p_co_02',   name: 'Cable Crunch',              muscleGroup: 'Core',       custom: false },
  { id: 'p_co_03',   name: 'Crunch',                    muscleGroup: 'Core',       custom: false },
  { id: 'p_co_04',   name: 'Dead Bug',                  muscleGroup: 'Core',       custom: false },
  { id: 'p_co_05',   name: 'Hanging Leg Raise',         muscleGroup: 'Core',       custom: false },
  { id: 'p_co_06',   name: 'Leg Raise',                 muscleGroup: 'Core',       custom: false },
  { id: 'p_co_07',   name: 'Mountain Climber',          muscleGroup: 'Core',       custom: false },
  { id: 'p_co_08',   name: 'Plank',                     muscleGroup: 'Core',       custom: false, trackingType: 'time' },
  { id: 'p_co_09',   name: 'Russian Twist',             muscleGroup: 'Core',       custom: false },
  { id: 'p_co_10',   name: 'Side Plank',                muscleGroup: 'Core',       custom: false, trackingType: 'time' },
  // Full Body
  { id: 'p_fb_01',   name: 'Burpee',                    muscleGroup: 'Full Body',  custom: false },
  { id: 'p_fb_02',   name: 'Clean and Press',           muscleGroup: 'Full Body',  custom: false },
  { id: 'p_fb_03',   name: 'Cool-Down',                 muscleGroup: 'Full Body',  custom: false },
  { id: 'p_fb_04',   name: 'Kettlebell Swing',          muscleGroup: 'Full Body',  custom: false },
  { id: 'p_fb_05',   name: 'Thruster',                  muscleGroup: 'Full Body',  custom: false },
  { id: 'p_fb_06',   name: 'Warm-Up',                   muscleGroup: 'Full Body',  custom: false },
  // Glutes
  { id: 'p_gl_01',   name: 'Cable Kickback',            muscleGroup: 'Glutes',     custom: false },
  { id: 'p_gl_02',   name: 'Glute Bridge',              muscleGroup: 'Glutes',     custom: false },
  { id: 'p_gl_03',   name: 'Hip Abductor',              muscleGroup: 'Glutes',     custom: false },
  { id: 'p_gl_04',   name: 'Hip Thrust',                muscleGroup: 'Glutes',     custom: false },
  // Hamstrings
  { id: 'p_hm_01',   name: 'Leg Curl',                  muscleGroup: 'Hamstrings', custom: false },
  { id: 'p_hm_02',   name: 'Nordic Curl',               muscleGroup: 'Hamstrings', custom: false },
  { id: 'p_hm_03',   name: 'Romanian Deadlift',         muscleGroup: 'Hamstrings', custom: false },
  { id: 'p_hm_04',   name: 'Stiff-Leg Deadlift',        muscleGroup: 'Hamstrings', custom: false },
  // Quads
  { id: 'p_qu_01',   name: 'Barbell Squat',             muscleGroup: 'Quads',      custom: false },
  { id: 'p_qu_02',   name: 'Bulgarian Split Squat',     muscleGroup: 'Quads',      custom: false },
  { id: 'p_qu_03',   name: 'Front Squat',               muscleGroup: 'Quads',      custom: false },
  { id: 'p_qu_04',   name: 'Goblet Squat',              muscleGroup: 'Quads',      custom: false },
  { id: 'p_qu_05',   name: 'Hack Squat',                muscleGroup: 'Quads',      custom: false },
  { id: 'p_qu_06',   name: 'Leg Extension',             muscleGroup: 'Quads',      custom: false },
  { id: 'p_qu_07',   name: 'Leg Press',                 muscleGroup: 'Quads',      custom: false },
  { id: 'p_qu_08',   name: 'Lunge',                     muscleGroup: 'Quads',      custom: false },
  { id: 'p_qu_09',   name: 'Smith Machine Squat',       muscleGroup: 'Quads',      custom: false },
  { id: 'p_qu_10',   name: 'Step Up',                   muscleGroup: 'Quads',      custom: false },
  // Calves
  { id: 'p_ca_01',   name: 'Calf Raise',                muscleGroup: 'Calves',     custom: false },
  { id: 'p_ca_02',   name: 'Seated Calf Raise',         muscleGroup: 'Calves',     custom: false },
].map(ex => ({ trackingType: 'sets', ...ex }))

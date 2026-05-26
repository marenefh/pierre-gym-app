export const STORAGE_KEYS = {
  // Dashboard
  QUOTE:        'maren_quote',          // legacy single-quote (replaced by QUOTES)
  QUOTES:       'maren_quotes',         // [{ id, type:'text'|'image', text, author, dataUrl }]
  QUOTE_INDEX:  'maren_quote_index',
  TODOS:        'maren_todos',
  SLEEP_TARGET: 'maren_sleep_target',

  // Calendar
  EVENTS:          'maren_events',
  ROUTINES:        'maren_routines',
  NOTIFICATIONS:   'maren_notifications',
  SCHOOL_SCHEDULE: 'maren_school_schedule',

  // Fitness
  WORKOUT_ROUTINES:  'maren_workout_routines',
  WORKOUT_LOG:       'maren_workout_log',
  EXERCISE_LIBRARY:  'maren_exercise_library',

  // Food
  RECIPES:       'maren_recipes',
  MEAL_PREP_PLAN:'maren_meal_prep_plan',
  GROCERY_EXTRAS:'maren_grocery_extras',
  FOOD_LOG:      'maren_food_log',
  CALORIE_GOAL:  'maren_calorie_goal',

  // Wellbeing
  HABITS_LOG:    'maren_habits_log',
  HABITS_CONFIG: 'maren_habits_config',
  JOURNAL_ENTRIES:'maren_journal',
  POMODORO_SETTINGS:'maren_pomodoro',

  // Finances
  TRANSACTIONS:  'maren_transactions',

  // Weekly Reset
  WEEKLY_GOALS:  'maren_weekly_goals',   // { 'yyyy-WW': ['goal1', ...] }
  WEEKLY_RESET:  'maren_weekly_reset',   // { 'yyyy-WW': { done: bool } }

  // Settings
  SETTINGS:      'maren_settings',

  // PWA
  INSTALL_PROMPTED: 'maren_install_prompted',
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
  'Core', 'Quads', 'Hamstrings', 'Glutes', 'Full Body',
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
  { id: 'lib_back_01', name: 'Deadlift',                muscleGroup: 'Back',      custom: false },
  { id: 'lib_back_02', name: 'Pull Up',                 muscleGroup: 'Back',      custom: false, note: 'Assisted pull-ups (thick purple band)' },
  { id: 'lib_back_03', name: 'Lat Pulldown',            muscleGroup: 'Back',      custom: false },
  { id: 'lib_back_04', name: 'Seated Row',              muscleGroup: 'Back',      custom: false },
  { id: 'lib_back_06', name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back',      custom: false },
  { id: 'lib_back_09', name: 'Face Pull',               muscleGroup: 'Back',      custom: false },
  { id: 'lib_back_11', name: 'Suitcase Fly',           muscleGroup: 'Back',      custom: false, note: 'Leaning forward: pick up suitcase → flys → repeat.' },
  { id: 'lib_back_13', name: 'Hyperextension',          muscleGroup: 'Back',      custom: false },
  // Biceps
  { id: 'lib_bi_09',   name: 'Bicep Curl',              muscleGroup: 'Biceps',    custom: false },
  // Triceps
  { id: 'lib_tri_01',  name: 'Tricep Pushdown',         muscleGroup: 'Triceps',   custom: false },
  { id: 'lib_tri_07',  name: 'Tricep Dip',              muscleGroup: 'Triceps',   custom: false },
  // Shoulders
  { id: 'lib_sh_08',   name: 'Cable Lateral Raise',     muscleGroup: 'Shoulders', custom: false },
  { id: 'lib_sh_10',   name: 'Face Pull',              muscleGroup: 'Shoulders', custom: false },
  { id: 'lib_sh_11',   name: 'Shoulder Press',          muscleGroup: 'Shoulders', custom: false },
  { id: 'lib_sh_12',   name: 'Lat Raise',       muscleGroup: 'Shoulders', custom: false },
  // Chest
  { id: 'lib_ch_01',   name: 'Bench Press',             muscleGroup: 'Chest',     custom: false },
  { id: 'lib_ch_05',   name: 'Chest Fly',               muscleGroup: 'Chest',     custom: false },
  { id: 'lib_ch_06',   name: 'Push Up',                 muscleGroup: 'Chest',     custom: false },
  { id: 'lib_ch_11',   name: 'Chest Press',             muscleGroup: 'Chest',     custom: false, note: 'Neutral grip' },
  // Core
  { id: 'lib_co_01',   name: 'Plank',                   muscleGroup: 'Core',      custom: false },
  { id: 'lib_co_03',   name: 'Leg Raise',               muscleGroup: 'Core',      custom: false },
  { id: 'lib_co_04',   name: 'Russian Twist',           muscleGroup: 'Core',      custom: false },
  { id: 'lib_co_07',   name: 'Hanging Leg Raise',       muscleGroup: 'Core',      custom: false },
  { id: 'lib_co_09',   name: 'Side Plank',              muscleGroup: 'Core',      custom: false },
  { id: 'lib_co_10',   name: 'Dead Bug',                muscleGroup: 'Core',      custom: false },
  { id: 'lib_co_11',   name: 'Mountain Climber',        muscleGroup: 'Core',      custom: false },
  { id: 'lib_co_12',   name: 'Ab Cruncher',             muscleGroup: 'Core',      custom: false },
  // Full Body
  { id: 'lib_fb_01',   name: 'Warm-Up',                 muscleGroup: 'Full Body', custom: false, note: 'Treadmill (10m, 5km/h, 8%), bike, walking lunges, 90/90 knees, pigeon→split, planks, bar stretching, palms/wrists' },
  { id: 'lib_fb_02',   name: 'Burpee',                  muscleGroup: 'Full Body', custom: false },
  { id: 'lib_fb_04',   name: 'Kettlebell Swing',        muscleGroup: 'Full Body', custom: false },
  { id: 'lib_fb_10',   name: 'Cool-Down',               muscleGroup: 'Full Body', custom: false, note: 'stretching, hanging' },
  { id: 'lib_fb_11',   name: 'Yoga',                   muscleGroup: 'Full Body', custom: false },
  { id: 'lib_fb_12',   name: 'Foam Rolling',            muscleGroup: 'Full Body', custom: false },
  { id: 'lib_fb_13',   name: 'Band Stretching',         muscleGroup: 'Full Body', custom: false },
  { id: 'lib_fb_14',   name: 'Splits Stretching',       muscleGroup: 'Full Body', custom: false },
  // Glutes
  { id: 'lib_gl_01',   name: 'Hip Thrust',              muscleGroup: 'Glutes',    custom: false },
  { id: 'lib_gl_03',   name: 'Cable Kickback',          muscleGroup: 'Glutes',    custom: false },
  { id: 'lib_gl_08',   name: 'Hip Abductor',            muscleGroup: 'Glutes',    custom: false },
  // Hamstrings
  { id: 'lib_hm_01',   name: 'Romanian Deadlift',       muscleGroup: 'Hamstrings',custom: false },
  { id: 'lib_hm_02',   name: 'Leg Curl',                muscleGroup: 'Hamstrings',custom: false },
  // Quads
  { id: 'lib_qu_01',   name: 'Squat',                   muscleGroup: 'Quads',     custom: false },
  { id: 'lib_qu_02',   name: 'Leg Press',               muscleGroup: 'Quads',     custom: false },
  { id: 'lib_qu_03',   name: 'Leg Extension',           muscleGroup: 'Quads',     custom: false },
  { id: 'lib_qu_04',   name: 'Lunge',                   muscleGroup: 'Quads',     custom: false },
  { id: 'lib_qu_05',   name: 'Bulgarian Split Squat',   muscleGroup: 'Quads',     custom: false },
  { id: 'lib_qu_06',   name: 'Hack Squat',              muscleGroup: 'Quads',     custom: false },
  { id: 'lib_qu_08',   name: 'Step Up',                 muscleGroup: 'Quads',     custom: false },
  { id: 'lib_qu_09',   name: 'Smith Squat',             muscleGroup: 'Quads',     custom: false },
  { id: 'lib_qu_10',   name: 'Wall Sit',                muscleGroup: 'Quads',     custom: false },
]

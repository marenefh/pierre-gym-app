const MIGRATION_KEY  = 'pierre_migration_v2'
const MIGRATION_KEY3 = 'pierre_migration_v3'
const MIGRATION_KEY4 = 'pierre_migration_v4'
const MIGRATION_KEY5 = 'pierre_migration_v5'
const MIGRATION_KEY6 = 'pierre_migration_v6'
const MIGRATION_KEY7 = 'pierre_migration_v7'
const MIGRATION_KEY8 = 'pierre_migration_v8'
const MIGRATION_KEY9  = 'pierre_migration_v9'
const MIGRATION_KEY10 = 'pierre_migration_v10'
const MIGRATION_KEY11 = 'pierre_migration_v11'
const MIGRATION_KEY12 = 'pierre_migration_v12'
const MIGRATION_KEY13 = 'pierre_migration_v13'
const MIGRATION_KEY14 = 'pierre_migration_v14'
const MIGRATION_KEY15 = 'pierre_migration_v15'
const MIGRATION_KEY16 = 'pierre_migration_v16'
const MIGRATION_KEY17 = 'pierre_migration_v17'
const MIGRATION_KEY18 = 'pierre_migration_v18'
const MIGRATION_KEY19 = 'pierre_migration_v19'
const MIGRATION_KEY20 = 'pierre_migration_v20'

export function runMigrations() {
  runV2()
  runV3()
  runV4()
  runV5()
  runV6()
  runV7()
  runV8()
  runV9()
  runV10()
  runV11()
  runV12()
  runV14()
  runV15()
  runV16()
  runV17()
  runV18()
  runV19()
}

function runV2() {
  if (localStorage.getItem(MIGRATION_KEY)) return

  // Rename exercises in all saved workout sessions
  const logRaw = localStorage.getItem('pierre_workout_log')
  if (logRaw) {
    try {
      const log = JSON.parse(logRaw)
      const RENAMES = {
        'Tricep Pushdowns': 'Tricep Pushdown',
        'Step-Ups':         'Step-Up',
        'Cable Kickbacks':  'Cable Kickback',
      }
      const updated = log.map(session => ({
        ...session,
        exercises: (session.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_log', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // Remove unwanted exercises from library
  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (libRaw) {
    try {
      const lib = JSON.parse(libRaw)
      const TO_DELETE = new Set([
        'Tricep Pushdowns', 'Step-Ups', 'Cable Kickbacks',
        'Bent-Over Row', 'T-Bar Row', 'Cable Row', 'Rack Pull',
        // Biceps — keep only Bicep Curl
        'Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl',
        'Incline Dumbbell Curl', 'Cable Curl', 'Concentration Curl', 'EZ-Bar Curl',
        // Triceps — keep only Tricep Pushdown, Diamond Push-Up, Tricep Dips
        'Skull Crusher', 'Close-Grip Bench Press', 'Overhead Tricep Extension',
        'Cable Overhead Extension', 'Tricep Kickback',
        // Hamstrings
        'Nordic Curl', 'Swiss Ball Leg Curl', 'Seated Leg Curl',
        // Glutes
        'Donkey Kick', 'Clamshell',
        // Full Body
        'Clean and Press',
      ])
      const cleaned = lib.filter(ex => !TO_DELETE.has(ex.name))
      localStorage.setItem('pierre_exercise_library', JSON.stringify(cleaned))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY, '1')
}

function runV3() {
  if (localStorage.getItem(MIGRATION_KEY3)) return

  // Add Cool-Down and Back Extension to exercise library if missing
  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (libRaw) {
    try {
      const lib = JSON.parse(libRaw)
      const names = new Set(lib.map(e => e.name))
      if (!names.has('Cool-Down')) {
        lib.push({ id: 'lib_fb_10', name: 'Cool-Down', muscleGroup: 'Full Body', custom: false })
      }
      if (!names.has('Back Extension')) {
        lib.push({ id: 'lib_back_13', name: 'Back Extension', muscleGroup: 'Back', custom: false })
      }
      localStorage.setItem('pierre_exercise_library', JSON.stringify(lib))
    } catch (e) { /* ignore */ }
  }

  // Replace Finisher → Cool-Down in Legs 1, Legs 2, Push routines
  const routinesRaw = localStorage.getItem('pierre_workout_routines')
  if (routinesRaw) {
    try {
      const routines = JSON.parse(routinesRaw)
      const REPLACE_IN = new Set(['legs1', 'legs2', 'push'])
      const updated = routines.map(r => {
        if (!REPLACE_IN.has(r.id)) return r
        return {
          ...r,
          exercises: (r.exercises || []).map(ex =>
            ex.name === 'Finisher'
              ? { ...ex, name: 'Cool-Down', muscleGroup: 'Full Body' }
              : ex
          ),
        }
      })
      localStorage.setItem('pierre_workout_routines', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY3, '1')
}

function runV4() {
  if (localStorage.getItem(MIGRATION_KEY4)) return

  // Rename "Assisted Pull-Ups" → "Pull-Up" in all logged sessions
  const logRaw = localStorage.getItem('pierre_workout_log')
  if (logRaw) {
    try {
      const log = JSON.parse(logRaw)
      const updated = log.map(session => ({
        ...session,
        exercises: (session.exercises || []).map(ex =>
          ex.name === 'Assisted Pull-Ups' ? { ...ex, name: 'Pull-Up', muscleGroup: 'Back' } : ex
        ),
      }))
      localStorage.setItem('pierre_workout_log', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // Remove "Assisted Pull-Ups" from exercise library
  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (libRaw) {
    try {
      const lib = JSON.parse(libRaw)
      localStorage.setItem('pierre_exercise_library', JSON.stringify(lib.filter(ex => ex.name !== 'Assisted Pull-Ups')))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY4, '1')
}

function runV5() {
  if (localStorage.getItem(MIGRATION_KEY5)) return

  const RENAMES = { 'Back Extension': 'Hyperextension', 'Hyperextensions': 'Hyperextension' }

  // Rename in all logged sessions (preserve sets/reps/weights)
  const logRaw = localStorage.getItem('pierre_workout_log')
  if (logRaw) {
    try {
      const log = JSON.parse(logRaw)
      const updated = log.map(session => ({
        ...session,
        exercises: (session.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName, muscleGroup: 'Back' } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_log', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // Fix library: remove duplicates, ensure only "Hyperextension" (Back) remains
  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (libRaw) {
    try {
      const lib = JSON.parse(libRaw)
      const TO_REMOVE = new Set(['Back Extension', 'Hyperextensions'])
      const hasHyper = lib.some(e => e.name === 'Hyperextension')
      const cleaned = lib.filter(e => !TO_REMOVE.has(e.name))
      if (!hasHyper) {
        cleaned.push({ id: 'lib_back_13', name: 'Hyperextension', muscleGroup: 'Back', custom: false })
      } else {
        // Fix muscleGroup if it was Full Body
        cleaned.forEach(e => { if (e.name === 'Hyperextension') e.muscleGroup = 'Back' })
      }
      localStorage.setItem('pierre_exercise_library', JSON.stringify(cleaned))
    } catch (e) { /* ignore */ }
  }

  // Rename in routines
  const routinesRaw = localStorage.getItem('pierre_workout_routines')
  if (routinesRaw) {
    try {
      const routines = JSON.parse(routinesRaw)
      const updated = routines.map(r => ({
        ...r,
        exercises: (r.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName, muscleGroup: 'Back' } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_routines', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY5, '1')
}

function runV6() {
  if (localStorage.getItem(MIGRATION_KEY6)) return

  const RENAMES = {
    'Machine Shoulder Press': 'Shoulder Press',
    'Hanging Leg Raises':     'Hanging Leg Raise',
    'Abductor Machine':       'Hip Abductor',
  }
  const TO_DELETE = new Set(Object.keys(RENAMES))

  // Rename in all logged sessions (preserve sets/reps/weights)
  const logRaw = localStorage.getItem('pierre_workout_log')
  if (logRaw) {
    try {
      const log = JSON.parse(logRaw)
      const updated = log.map(session => ({
        ...session,
        exercises: (session.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_log', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // Remove deleted exercises from library
  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (libRaw) {
    try {
      const lib = JSON.parse(libRaw)
      localStorage.setItem('pierre_exercise_library', JSON.stringify(lib.filter(ex => !TO_DELETE.has(ex.name))))
    } catch (e) { /* ignore */ }
  }

  // Rename in routines
  const routinesRaw = localStorage.getItem('pierre_workout_routines')
  if (routinesRaw) {
    try {
      const routines = JSON.parse(routinesRaw)
      const updated = routines.map(r => ({
        ...r,
        exercises: (r.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_routines', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY6, '1')
}

function runV7() {
  if (localStorage.getItem(MIGRATION_KEY7)) return

  // Convert routine exercises from flat {sets:n, reps:n, weight:n} to {sets:[{reps,weight}]}
  const routinesRaw = localStorage.getItem('pierre_workout_routines')
  if (routinesRaw) {
    try {
      const routines = JSON.parse(routinesRaw)
      const updated = routines.map(r => ({
        ...r,
        exercises: (r.exercises || []).map(ex => {
          if (Array.isArray(ex.sets)) return ex
          const count  = Number(ex.sets)   || 3
          const reps   = Number(ex.reps)   || 10
          const weight = Number(ex.weight) || 0
          const { sets: _, reps: __, weight: ___, ...rest } = ex
          return { ...rest, sets: Array.from({ length: count }, () => ({ reps, weight })) }
        }),
      }))
      localStorage.setItem('pierre_workout_routines', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY7, '1')
}

function runV8() {
  if (localStorage.getItem(MIGRATION_KEY8)) return

  const NOTES = {
    'Pull-Up':       'Assisted pull-ups (thick purple band)',
    'Suitcase Flys': 'Leaning forward: pick up suitcase → flys → repeat.',
    'Chest Press':   'Neutral grip',
    'Warm-Up':       'Treadmill/bike (10m, 5km/h, 8%), walking lunges, 90/90 knees, pigeon→split',
    'Cool-Down':     'stretching, hanging',
  }

  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (libRaw) {
    try {
      const lib = JSON.parse(libRaw)
      const updated = lib.map(ex => {
        const note = NOTES[ex.name]
        // Only set if not already customised by the user
        return note && !ex.note ? { ...ex, note } : ex
      })
      localStorage.setItem('pierre_exercise_library', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY8, '1')
}

function runV9() {
  if (localStorage.getItem(MIGRATION_KEY9)) return

  // Add new exercises to library if missing
  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (libRaw) {
    try {
      const lib = JSON.parse(libRaw)
      const names = new Set(lib.map(e => e.name))
      const toAdd = [
        { id: 'lib_fb_11', name: 'Yoga',             muscleGroup: 'Full Body', custom: false },
        { id: 'lib_fb_12', name: 'Foam Rolling',      muscleGroup: 'Full Body', custom: false },
        { id: 'lib_fb_13', name: 'Band Stretching',   muscleGroup: 'Full Body', custom: false },
        { id: 'lib_fb_14', name: 'Splits Stretching', muscleGroup: 'Full Body', custom: false },
      ]
      toAdd.forEach(ex => { if (!names.has(ex.name)) lib.push(ex) })
      localStorage.setItem('pierre_exercise_library', JSON.stringify(lib))
    } catch (e) { /* ignore */ }
  }

  // Replace restorative routine exercises
  const routinesRaw = localStorage.getItem('pierre_workout_routines')
  if (routinesRaw) {
    try {
      const routines = JSON.parse(routinesRaw)
      const updated = routines.map(r => {
        if (r.id !== 'restorative') return r
        return {
          ...r,
          exercises: [
            { id: 'sr-yg', name: 'Yoga',             muscleGroup: 'Full Body', sets: [{ reps: 1, weight: 0 }] },
            { id: 'sr-fr', name: 'Foam Rolling',      muscleGroup: 'Full Body', sets: [{ reps: 1, weight: 0 }] },
            { id: 'sr-bs', name: 'Band Stretching',   muscleGroup: 'Full Body', sets: [{ reps: 1, weight: 0 }] },
            { id: 'sr-ss', name: 'Splits Stretching', muscleGroup: 'Full Body', sets: [{ reps: 1, weight: 0 }] },
          ],
        }
      })
      localStorage.setItem('pierre_workout_routines', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY9, '1')
}

function runV10() {
  if (localStorage.getItem(MIGRATION_KEY10)) return

  // Move Hip Abductor to position 2 (after Warm-Up, before Hip Thrust) in Legs 2
  const routinesRaw = localStorage.getItem('pierre_workout_routines')
  if (routinesRaw) {
    try {
      const routines = JSON.parse(routinesRaw)
      const updated = routines.map(r => {
        if (r.id !== 'legs2') return r
        const exercises = r.exercises || []
        const haIdx = exercises.findIndex(ex => ex.name === 'Hip Abductor')
        if (haIdx === -1) return r
        const ha = exercises[haIdx]
        const rest = exercises.filter((_, i) => i !== haIdx)
        const wuIdx = rest.findIndex(ex => ex.name === 'Warm-Up')
        const insertAt = wuIdx === -1 ? 0 : wuIdx + 1
        rest.splice(insertAt, 0, ha)
        return { ...r, exercises: rest }
      })
      localStorage.setItem('pierre_workout_routines', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY10, '1')
}

function runV11() {
  if (localStorage.getItem(MIGRATION_KEY11)) return

  const RENAMES = {
    'Pull-Up':          'Pull Up',
    'Step-Up':          'Step Up',
    'Step-Ups':         'Step Up',
    'Face Pulls':       'Face Pull',
    'Suitcase Flys':    'Suitcase Fly',
    'DB Lateral Raises':'Lat Raise',
  }

  // 1. Rename + clean notes in exercise library
  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (libRaw) {
    try {
      const lib = JSON.parse(libRaw)
      const updated = lib.map(ex => {
        let e = RENAMES[ex.name] ? { ...ex, name: RENAMES[ex.name] } : ex
        if (e.name === 'BSS') e = { ...e, note: '' }
        if (e.name === 'Warm-Up') e = { ...e, note: 'Treadmill (10m, 5km/h, 8%), bike, walking lunges, 90/90 knees, pigeon→split, planks, bar stretching, palms/wrists' }
        return e
      })
      localStorage.setItem('pierre_exercise_library', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // 2. Rename exercises in past sessions (workout log)
  const logRaw = localStorage.getItem('pierre_workout_log')
  if (logRaw) {
    try {
      const log = JSON.parse(logRaw)
      const updated = log.map(session => ({
        ...session,
        exercises: (session.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_log', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // 3. Replace routines with updated structure
  const ss = (c, r, w) => Array.from({ length: c }, () => ({ reps: r, weight: w }))
  const NEW_ROUTINES = [
    {
      id: 'legs1', name: 'Legs 1',
      exercises: [
        { id:'l1-wu',  name:'Warm-Up',        muscleGroup:'Full Body',  sets:ss(1,1,0)   },
        { id:'l1-ht',  name:'Hip Thrust',     muscleGroup:'Glutes',     sets:ss(4,8,60)  },
        { id:'l1-su',  name:'Step Up',        muscleGroup:'Quads',      sets:ss(3,8,7)   },
        { id:'l1-hq',  name:'Hack Squat',     muscleGroup:'Quads',      sets:[{reps:8,weight:40},{reps:8,weight:50},{reps:8,weight:50}] },
        { id:'l1-lc',  name:'Leg Curl',       muscleGroup:'Hamstrings', sets:ss(3,8,23)  },
        { id:'l1-he',  name:'Hyperextension', muscleGroup:'Back',       sets:ss(2,10,0)  },
        { id:'l1-fin', name:'Cool-Down',      muscleGroup:'Full Body',  sets:ss(1,1,0)   },
      ]
    },
    {
      id: 'pull', name: 'Pull',
      exercises: [
        { id:'pu-wu',  name:'Warm-Up',        muscleGroup:'Full Body',  sets:ss(1,1,0)   },
        { id:'pu-lp',  name:'Lat Pulldown',   muscleGroup:'Back',       sets:ss(3,10,29) },
        { id:'pu-sr',  name:'Seated Row',     muscleGroup:'Back',       sets:ss(3,10,18) },
        { id:'pu-fp',  name:'Face Pull',      muscleGroup:'Shoulders',  sets:ss(3,10,18) },
        { id:'pu-ac',  name:'Ab Cruncher',    muscleGroup:'Core',       sets:ss(3,10,29) },
        { id:'pu-bc',  name:'Bicep Curl',     muscleGroup:'Biceps',     sets:ss(3,10,4)  },
        { id:'pu-sf',  name:'Suitcase Fly',   muscleGroup:'Back',       sets:ss(3,10,3)  },
        { id:'pu-pu',  name:'Pull Up',        muscleGroup:'Back',       sets:ss(2,5,0)   },
        { id:'pu-fin', name:'Cool-Down',      muscleGroup:'Full Body',  sets:ss(1,1,0)   },
      ]
    },
    {
      id: 'legs2', name: 'Legs 2',
      exercises: [
        { id:'l2-wu',  name:'Warm-Up',        muscleGroup:'Full Body',  sets:ss(1,1,0)   },
        { id:'l2-ha',  name:'Hip Abductor',   muscleGroup:'Glutes',     sets:[{reps:8,weight:57},{reps:8,weight:57},{reps:8,weight:63}] },
        { id:'l2-ht',  name:'Hip Thrust',     muscleGroup:'Glutes',     sets:ss(4,8,60)  },
        { id:'l2-rd',  name:'Smith RDL',      muscleGroup:'Hamstrings', sets:ss(3,8,30)  },
        { id:'l2-bs',  name:'BSS',            muscleGroup:'Quads',      sets:ss(3,8,10)  },
        { id:'l2-ck',  name:'Cable Kickback', muscleGroup:'Glutes',     sets:ss(3,8,9)   },
        { id:'l2-fin', name:'Cool-Down',      muscleGroup:'Full Body',  sets:ss(1,1,0)   },
      ]
    },
    {
      id: 'push', name: 'Push',
      exercises: [
        { id:'ps-wu',  name:'Warm-Up',          muscleGroup:'Full Body',  sets:ss(1,1,0)    },
        { id:'ps-cp',  name:'Chest Press',      muscleGroup:'Chest',      sets:ss(3,10,18)  },
        { id:'ps-sp',  name:'Shoulder Press',   muscleGroup:'Shoulders',  sets:[{reps:10,weight:9},{reps:10,weight:14},{reps:10,weight:14}] },
        { id:'ps-tp',  name:'Tricep Pushdown',  muscleGroup:'Triceps',    sets:ss(3,10,36)  },
        { id:'ps-lr',  name:'Lat Raise',        muscleGroup:'Shoulders',  sets:ss(3,10,4)   },
        { id:'ps-hl',  name:'Hanging Leg Raise',muscleGroup:'Core',       sets:ss(3,10,0)   },
        { id:'ps-fin', name:'Cool-Down',        muscleGroup:'Full Body',  sets:ss(1,1,0)    },
      ]
    },
    {
      id: 'restorative', name: 'Sunday Restorative',
      exercises: [
        { id:'sr-yg', name:'Yoga',              muscleGroup:'Full Body', sets:ss(1,1,0) },
        { id:'sr-fr', name:'Foam Rolling',      muscleGroup:'Full Body', sets:ss(1,1,0) },
        { id:'sr-bs', name:'Band Stretching',   muscleGroup:'Full Body', sets:ss(1,1,0) },
        { id:'sr-ss', name:'Splits Stretching', muscleGroup:'Full Body', sets:ss(1,1,0) },
      ]
    },
  ]

  try {
    const existing = localStorage.getItem('pierre_workout_routines')
    if (existing) {
      const parsed = JSON.parse(existing)
      // Preserve any user-created routines not in the standard set
      const standardIds = new Set(['legs1','pull','legs2','push','restorative'])
      const custom = parsed.filter(r => !standardIds.has(r.id))
      localStorage.setItem('pierre_workout_routines', JSON.stringify([...NEW_ROUTINES, ...custom]))
    }
  } catch (e) { /* ignore */ }

  localStorage.setItem(MIGRATION_KEY11, '1')
}

function runV12() {
  if (localStorage.getItem(MIGRATION_KEY12)) return

  // Fix rounded weights in past sessions:
  //   Face Pull 18.1 kg → 18 kg
  //   Cable Kickback 9.1 kg → 9 kg
  const logRaw = localStorage.getItem('pierre_workout_log')
  if (logRaw) {
    try {
      const log = JSON.parse(logRaw)
      const updated = log.map(session => ({
        ...session,
        exercises: (session.exercises || []).map(ex => {
          if (ex.name !== 'Face Pull' && ex.name !== 'Cable Kickback') return ex
          return {
            ...ex,
            sets: (ex.sets || []).map(s => {
              const w = s.weight
              if (ex.name === 'Face Pull'      && w === 18.1) return { ...s, weight: 18 }
              if (ex.name === 'Cable Kickback' && w === 9.1)  return { ...s, weight: 9  }
              return s
            }),
          }
        }),
      }))
      localStorage.setItem('pierre_workout_log', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY12, '1')
}



function runV14() {
  if (localStorage.getItem(MIGRATION_KEY14)) return

  const RENAMES = {
    'Hack Squats':  'Hack Squat',
    'Step-Up':      'Step Up',
    'Goblet Squats':'Goblet Squat',
  }

  // Rename in all logged sessions
  const logRaw = localStorage.getItem('pierre_workout_log')
  if (logRaw) {
    try {
      const log = JSON.parse(logRaw)
      const updated = log.map(session => ({
        ...session,
        exercises: (session.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_log', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // Fix library: rename old entries; remove duplicates that may result
  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (libRaw) {
    try {
      const lib = JSON.parse(libRaw)
      const seen = new Set()
      const updated = lib
        .map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        })
        .filter(ex => {
          // If renaming created a duplicate (canonical name already existed), keep only the first occurrence
          if (seen.has(ex.name)) return false
          seen.add(ex.name)
          return true
        })
      localStorage.setItem('pierre_exercise_library', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // Rename in routines too (in case any routine still uses the old names)
  const routinesRaw = localStorage.getItem('pierre_workout_routines')
  if (routinesRaw) {
    try {
      const routines = JSON.parse(routinesRaw)
      const updated = routines.map(r => ({
        ...r,
        exercises: (r.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_routines', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY14, '1')
}

function runV15() {
  if (localStorage.getItem(MIGRATION_KEY15)) return

  // ── Renames (log, library, routines) ──────────────────────────────────────
  const RENAMES = {
    'BSS':           'Bulgarian Split Squat',
    'Smith RDL':     'Romanian Deadlift',
    'Lat Raises':    'Lat Raise',
    'Suitcase Flys': 'Suitcase Fly',
    'Pull-Up':       'Pull Up',
    'Tricep Dips':   'Tricep Dip',
  }

  // Names that should be removed from library entirely (duplicates / unwanted)
  const TO_DELETE = new Set([
    // duplicates made redundant by renames above
    'BSS', 'Smith RDL', 'Lat Raises', 'Suitcase Flys', 'Pull-Up',
    // the old "Lateral Raise" entry (kept as "Lat Raise")
    'Lateral Raise',
    // exercises the user wants gone
    'Treadmill', 'Finisher', 'Thruster', 'Turkish Get-Up',
    'Ab Rollout', 'Chest Dip', 'Pec Deck',
    'Dumbbell Bench Press', 'Incline Dumbbell Press',
    'Incline Bench Press', 'Decline Bench Press',
    'Front Raise', 'Rear Delt Fly', 'Arnold Press', 'Upright Row',
  ])

  // 1. Rename in workout log
  const logRaw = localStorage.getItem('pierre_workout_log')
  if (logRaw) {
    try {
      const log = JSON.parse(logRaw)
      const updated = log.map(session => ({
        ...session,
        exercises: (session.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_log', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // 2. Fix library: rename entries, then remove deleted/duplicate names
  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (libRaw) {
    try {
      const lib = JSON.parse(libRaw)
      const seen = new Set()
      const updated = lib
        .map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        })
        .filter(ex => {
          if (TO_DELETE.has(ex.name)) return false
          // remove duplicate canonical names (keep first occurrence)
          if (seen.has(ex.name)) return false
          seen.add(ex.name)
          return true
        })
      localStorage.setItem('pierre_exercise_library', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // 3. Rename in routines
  const routinesRaw = localStorage.getItem('pierre_workout_routines')
  if (routinesRaw) {
    try {
      const routines = JSON.parse(routinesRaw)
      const updated = routines.map(r => ({
        ...r,
        exercises: (r.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_routines', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY15, '1')
}

function runV16() {
  if (localStorage.getItem(MIGRATION_KEY16)) return

  const RENAMES = {
    'DB Lateral Raises': 'Lat Raise',
    'Face Pulls':        'Face Pull',
    'Push-ups':          'Push Up',
    'Push-Ups':          'Push Up',
    'Smith Squats':      'Smith Squat',
  }

  // Also rename "Push-Up" (with hyphen) → "Push Up" if somehow still present
  // and keep "Push Up" in the library (renamed from "Push-Up" in V15 wasn't in the list,
  // so add it here for safety)
  RENAMES['Push-Up'] = 'Push Up'

  // 1. Rename in workout log
  const logRaw = localStorage.getItem('pierre_workout_log')
  if (logRaw) {
    try {
      const log = JSON.parse(logRaw)
      const updated = log.map(session => ({
        ...session,
        exercises: (session.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_log', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // 2. Fix library: rename old entries, remove duplicates
  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (libRaw) {
    try {
      const lib = JSON.parse(libRaw)
      const seen = new Set()
      const updated = lib
        .map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        })
        .filter(ex => {
          if (seen.has(ex.name)) return false
          seen.add(ex.name)
          return true
        })
      localStorage.setItem('pierre_exercise_library', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // 3. Rename in routines
  const routinesRaw = localStorage.getItem('pierre_workout_routines')
  if (routinesRaw) {
    try {
      const routines = JSON.parse(routinesRaw)
      const updated = routines.map(r => ({
        ...r,
        exercises: (r.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_routines', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY16, '1')
}

function runV17() {
  if (localStorage.getItem(MIGRATION_KEY17)) return

  const TO_DELETE = new Set([
    'Chest-Supported Row',
    'Diamond Push Up', 'Diamond Push-Up',   // catch both spellings
    'Overhead Press',
    'Dumbbell Shoulder Press',
    'Dumbbell Fly',
    'Front Squat',
    'Stiff-Leg Deadlift',
    'Sumo Deadlift',
    'Glute Bridge',
    'Cable Crunch',
    'Crunch',
  ])

  const RENAMES = { 'Cable Fly': 'Chest Fly' }

  // 1. Fix library: delete unwanted entries, rename Cable Fly → Chest Fly
  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (libRaw) {
    try {
      const lib = JSON.parse(libRaw)
      const seen = new Set()
      const updated = lib
        .map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        })
        .filter(ex => {
          if (TO_DELETE.has(ex.name)) return false
          if (seen.has(ex.name)) return false
          seen.add(ex.name)
          return true
        })
      localStorage.setItem('pierre_exercise_library', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // 2. Rename Cable Fly → Chest Fly in workout log (in case any session used it)
  const logRaw = localStorage.getItem('pierre_workout_log')
  if (logRaw) {
    try {
      const log = JSON.parse(logRaw)
      const updated = log.map(session => ({
        ...session,
        exercises: (session.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_log', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  // 3. Rename Cable Fly → Chest Fly in routines too
  const routinesRaw = localStorage.getItem('pierre_workout_routines')
  if (routinesRaw) {
    try {
      const routines = JSON.parse(routinesRaw)
      const updated = routines.map(r => ({
        ...r,
        exercises: (r.exercises || []).map(ex => {
          const newName = RENAMES[ex.name]
          return newName ? { ...ex, name: newName } : ex
        }),
      }))
      localStorage.setItem('pierre_workout_routines', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY17, '1')
}

function runV18() {
  if (localStorage.getItem(MIGRATION_KEY18)) return

  // Scan the workout log and add any exercise that is missing from the library.
  // Uses the muscleGroup stored on the logged exercise so no guessing is needed.
  const logRaw = localStorage.getItem('pierre_workout_log')
  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (!logRaw || !libRaw) {
    localStorage.setItem(MIGRATION_KEY18, '1')
    return
  }

  try {
    const log = JSON.parse(logRaw)
    const lib = JSON.parse(libRaw)

    // Build a set of names already in the library
    const libNames = new Set(lib.map(e => e.name))

    // Collect the first occurrence of each missing exercise from the log
    // (preserving the muscleGroup recorded at log time)
    const toAdd = {}
    log.forEach(session => {
      (session.exercises || []).forEach(ex => {
        if (!libNames.has(ex.name) && !toAdd[ex.name]) {
          toAdd[ex.name] = ex.muscleGroup || 'Full Body'
        }
      })
    })

    const missing = Object.entries(toAdd)
    if (missing.length > 0) {
      const newEntries = missing.map(([name, muscleGroup], i) => ({
        id: `lib_auto_${Date.now()}_${i}`,
        name,
        muscleGroup,
        custom: false,
      }))
      localStorage.setItem('pierre_exercise_library', JSON.stringify([...lib, ...newEntries]))
    }
  } catch (e) { /* ignore */ }

  localStorage.setItem(MIGRATION_KEY18, '1')
}

function runV19() {
  if (localStorage.getItem(MIGRATION_KEY19)) return

  // ── 1. Force-replace the 4 standard routines with updated spec ──────────────
  const ss = (c, r, w) => Array.from({ length: c }, () => ({ reps: r, weight: w }))

  const NEW_ROUTINES = [
    {
      id: 'legs1', name: 'Legs 1',
      exercises: [
        { id:'l1-wu',  name:'Warm-Up',        muscleGroup:'Full Body',  sets:[{reps:1,weight:0}]                                                },
        { id:'l1-su',  name:'Step Up',        muscleGroup:'Quads',      sets:[{reps:8,weight:7},{reps:8,weight:7},{reps:8,weight:7}]            },
        { id:'l1-ht',  name:'Hip Thrust',     muscleGroup:'Glutes',     sets:[{reps:8,weight:60},{reps:8,weight:60},{reps:8,weight:60},{reps:8,weight:60}] },
        { id:'l1-hq',  name:'Hack Squat',     muscleGroup:'Quads',      sets:[{reps:8,weight:40},{reps:8,weight:50},{reps:8,weight:50}]         },
        { id:'l1-lc',  name:'Leg Curl',       muscleGroup:'Hamstrings', sets:[{reps:8,weight:29},{reps:8,weight:29},{reps:8,weight:50}]         },
        { id:'l1-he',  name:'Hyperextension', muscleGroup:'Back',       sets:[{reps:10,weight:0},{reps:10,weight:0}]                           },
        { id:'l1-fin', name:'Cool-Down',      muscleGroup:'Full Body',  sets:[{reps:1,weight:0}]                                               },
      ]
    },
    {
      id: 'pull', name: 'Pull',
      exercises: [
        { id:'pu-wu',  name:'Warm-Up',      muscleGroup:'Full Body',  sets:[{reps:1,weight:0}]                                               },
        { id:'pu-lp',  name:'Lat Pulldown', muscleGroup:'Back',       sets:[{reps:10,weight:29},{reps:10,weight:29},{reps:10,weight:29}]      },
        { id:'pu-sr',  name:'Seated Row',   muscleGroup:'Back',       sets:[{reps:10,weight:18},{reps:10,weight:18},{reps:10,weight:18}]      },
        { id:'pu-fp',  name:'Face Pull',    muscleGroup:'Shoulders',  sets:[{reps:10,weight:18},{reps:10,weight:18},{reps:10,weight:18}]      },
        { id:'pu-bc',  name:'Bicep Curl',   muscleGroup:'Biceps',     sets:[{reps:10,weight:4},{reps:10,weight:4}]                           },
        { id:'pu-sf',  name:'Suitcase Fly', muscleGroup:'Back',       sets:[{reps:10,weight:3},{reps:10,weight:3}]                           },
        { id:'pu-ac',  name:'Ab Cruncher',  muscleGroup:'Core',       sets:[{reps:10,weight:29},{reps:10,weight:29},{reps:10,weight:29}]      },
        { id:'pu-fin', name:'Cool-Down',    muscleGroup:'Full Body',  sets:[{reps:1,weight:0}]                                               },
      ]
    },
    {
      id: 'legs2', name: 'Legs 2',
      exercises: [
        { id:'l2-wu',  name:'Warm-Up',              muscleGroup:'Full Body',  sets:[{reps:1,weight:0}]                                         },
        { id:'l2-ha',  name:'Hip Abductor',          muscleGroup:'Glutes',     sets:[{reps:8,weight:57},{reps:8,weight:57},{reps:8,weight:63}]  },
        { id:'l2-ht',  name:'Hip Thrust',            muscleGroup:'Glutes',     sets:[{reps:8,weight:60},{reps:8,weight:60},{reps:8,weight:60},{reps:8,weight:60}] },
        { id:'l2-rd',  name:'Romanian Deadlift',     muscleGroup:'Hamstrings', sets:[{reps:8,weight:30},{reps:8,weight:30},{reps:8,weight:30}]  },
        { id:'l2-bs',  name:'Bulgarian Split Squat', muscleGroup:'Quads',      sets:[{reps:8,weight:10},{reps:8,weight:10},{reps:8,weight:10}]  },
        { id:'l2-ck',  name:'Cable Kickback',        muscleGroup:'Glutes',     sets:[{reps:8,weight:9},{reps:8,weight:9},{reps:8,weight:9}]     },
        { id:'l2-fin', name:'Cool-Down',             muscleGroup:'Full Body',  sets:[{reps:1,weight:0}]                                         },
      ]
    },
    {
      id: 'push', name: 'Push',
      exercises: [
        { id:'ps-wu',  name:'Warm-Up',          muscleGroup:'Full Body',  sets:[{reps:1,weight:0}]                                             },
        { id:'ps-cp',  name:'Chest Press',      muscleGroup:'Chest',      sets:[{reps:10,weight:18},{reps:10,weight:18},{reps:10,weight:18}]    },
        { id:'ps-sp',  name:'Shoulder Press',   muscleGroup:'Shoulders',  sets:[{reps:10,weight:9},{reps:10,weight:14},{reps:10,weight:14}]     },
        { id:'ps-tp',  name:'Tricep Pushdown',  muscleGroup:'Triceps',    sets:[{reps:10,weight:29},{reps:10,weight:29},{reps:10,weight:29}]    },
        { id:'ps-lr',  name:'Lat Raise',        muscleGroup:'Shoulders',  sets:[{reps:10,weight:3},{reps:10,weight:3},{reps:10,weight:3}]       },
        { id:'ps-hl',  name:'Hanging Leg Raise',muscleGroup:'Core',       sets:[{reps:10,weight:0},{reps:10,weight:0},{reps:10,weight:0}]       },
        { id:'ps-fin', name:'Cool-Down',        muscleGroup:'Full Body',  sets:[{reps:1,weight:0}]                                             },
      ]
    },
  ]

  try {
    const routinesRaw = localStorage.getItem('pierre_workout_routines')
    if (routinesRaw) {
      const parsed = JSON.parse(routinesRaw)
      const standardIds = new Set(['legs1', 'pull', 'legs2', 'push'])
      // Preserve restorative + any user-created custom routines
      const others = parsed.filter(r => !standardIds.has(r.id))
      localStorage.setItem('pierre_workout_routines', JSON.stringify([...NEW_ROUTINES, ...others]))
    }
  } catch (e) { /* ignore */ }

  // ── 2. Update library notes ──────────────────────────────────────────────────
  const NOTES = {
    'Cable Kickback': 'optional',
    'Lat Pulldown':   'replace with pull up asap',
  }

  const libRaw = localStorage.getItem('pierre_exercise_library')
  if (libRaw) {
    try {
      const lib = JSON.parse(libRaw)
      const updated = lib.map(ex => {
        const note = NOTES[ex.name]
        return note !== undefined ? { ...ex, note } : ex
      })
      localStorage.setItem('pierre_exercise_library', JSON.stringify(updated))
    } catch (e) { /* ignore */ }
  }

  localStorage.setItem(MIGRATION_KEY19, '1')
}


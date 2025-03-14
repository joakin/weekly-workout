type performedSet = {
  reps: int,
  weight: float,
  startTime: float,
  endTime: float,
}

type exerciseProgress = {
  exercise: Exercise.t,
  completedSets: array<performedSet>,
}

type t = {
  startTime: float,
  endTime: float,
  workout: Workout.t,
  exercises: array<exerciseProgress>,
}

let make = (workout: Workout.t) => {
  startTime: 0.0,
  endTime: 0.0,
  workout,
  exercises: workout.exercises->Array.map(e => {
    exercise: e,
    completedSets: [],
  }),
}

/**
 * Complete the set for the exercise at the given index.
 */
let completeSet = (workout: t, set: performedSet, exerciseIndex: int) => {
  {
    ...workout,
    exercises: Array.mapWithIndex(workout.exercises, (e, i) => {
      i == exerciseIndex ? {...e, completedSets: [...e.completedSets, set]} : e
    }),
  }
}

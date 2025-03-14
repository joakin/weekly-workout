%%raw("import './daily-workout.css'")

module ActiveWorkout = {
  type currentSetStatus =
    | NotStarted
    | InProgress

  type state = {
    workout: PerformedWorkout.t,
    currentExerciseIndex: int,
    currentSet: PerformedWorkout.performedSet,
    currentSetStatus: currentSetStatus,
  }

  let currentExercise = (state: state) =>
    state.workout.exercises->Array.getUnsafe(state.currentExerciseIndex)

  /**
   * Reset the current set by setting the reps to the ones in the current
   * exercise and maintaining the weight from whatever we did before.
   */
  let resetCurrentSet = (state: state) => {
    let currentExercise = currentExercise(state)
    {
      ...state,
      currentSet: {
        ...state.currentSet,
        startTime: 0.,
        endTime: 0.,
        reps: currentExercise.exercise.reps.min,
      },
      currentSetStatus: NotStarted,
    }
  }

  type action =
    | StartSet
    | EndSet
    | NextExercise
    | PreviousExercise
    | WeightChanged(float)
    | RepsChanged(int)

  let update = (state: state, action: action) => {
    switch action {
    | StartSet => {
        ...state,
        currentSet: {
          ...state.currentSet,
          startTime: Date.now(),
          endTime: 0.,
        },
        currentSetStatus: InProgress,
      }

    | EndSet =>
      let set = {
        ...state.currentSet,
        endTime: Date.now(),
      }
      {
        ...state,
        currentSet: set,
        currentSetStatus: NotStarted,
        workout: PerformedWorkout.completeSet(state.workout, set, state.currentExerciseIndex),
      }

    | NextExercise =>
      if state.currentExerciseIndex >= state.workout.exercises->Array.length - 1 {
        state
      } else {
        {
          ...state,
          currentExerciseIndex: state.currentExerciseIndex + 1,
        }->resetCurrentSet
      }

    | PreviousExercise =>
      if state.currentExerciseIndex <= 0 {
        state
      } else {
        {
          ...state,
          currentExerciseIndex: state.currentExerciseIndex - 1,
        }->resetCurrentSet
      }

    | WeightChanged(weight) => {
        ...state,
        currentSet: {...state.currentSet, weight},
      }

    | RepsChanged(reps) => {
        ...state,
        currentSet: {...state.currentSet, reps},
      }
    }
  }

  @react.component
  let make = (~workout: Workout.t) => {
    let (state, send) = React.useReducer(
      update,
      {
        workout: PerformedWorkout.make(workout),
        currentExerciseIndex: 0,
        currentSetStatus: NotStarted,
        currentSet: {startTime: 0.0, endTime: 0.0, weight: 0.0, reps: 0},
      },
    )
    let currentExercise = state.workout.exercises[state.currentExerciseIndex]

    switch currentExercise {
    | Some(exercise) =>
      let sets = NumberRange.formatRange(exercise.exercise.sets)
      let reps = NumberRange.formatRange(exercise.exercise.reps)

      <div className="exercise-container active-exercise">
        <div className="active-exercise-header">
          <h3 className="active-exercise-title"> {React.string(exercise.exercise.name)} </h3>
          <div className="exercise-progress">
            {
              let set = (exercise.completedSets->Array.length + 1)->Int.toString
              React.string(`Set ${set} of ${sets}`)
            }
          </div>
        </div>
        <div className="active-exercise-info">
          <p className="target-reps"> {React.string(`Target: ${reps} reps`)} </p>
          {switch exercise.exercise.notes {
          | Some(notes) =>
            <p className="active-exercise-notes">
              {React.string("ℹ ")}
              <span> {React.string(notes)} </span>
            </p>
          | None => React.null
          }}
        </div>
        <form className="set-completion-form">
          <div className="form-group">
            <label htmlFor="reps-completed"> {React.string("Reps")} </label>
            <input
              type_="number"
              id="reps-completed"
              name="reps"
              min="1"
              required=true
              placeholder="Number of reps"
              value={state.currentSet.reps->Int.toString}
              onInput={e =>
                JsxEvent.Form.target(e)["value"]
                ->Int.fromString
                ->Option.forEach(i => send(RepsChanged(i)))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="weight-used"> {React.string("Weight (kg)")} </label>
            <input
              type_="number"
              id="weight-used"
              name="weight"
              min="0"
              step=0.5
              required=true
              placeholder="Weight (kg)"
              value={state.currentSet.weight->Float.toFixed(~digits=1)}
              onInput={e =>
                JsxEvent.Form.target(e)["value"]
                ->Float.fromString
                ->Option.forEach(f => send(WeightChanged(f)))}
            />
          </div>
          <div className="set-buttons">
            <button
              type_="button"
              id="start-set"
              disabled={state.currentSetStatus == InProgress}
              onClick={_ => send(StartSet)}>
              {React.string("Start Set")}
            </button>
            <button
              type_="submit"
              id="complete-set"
              disabled={state.currentSetStatus == NotStarted}
              onClick={_ => send(EndSet)}>
              {React.string("Complete Set")}
            </button>
          </div>
        </form>
        <div className="completed-sets">
          <h4 className="sets-title"> {React.string("Completed Sets")} </h4>
          <ul className="sets-list">
            {React.array(
              exercise.completedSets->Array.mapWithIndex((set, index) => {
                let duration = ((set.endTime -. set.startTime) /. 1000.)->Float.toFixed(~digits=1)
                let num = (index + 1)->Int.toString
                let reps = set.reps->Int.toString
                let weight = set.weight->Float.toFixed(~digits=1)
                let text = `Set ${num}: ${reps} reps @ ${weight}kg (${duration}s)`
                <li className="set-item" key={num}> {React.string(text)} </li>
              }),
            )}
          </ul>
        </div>
        <div className="exercise-controls">
          <button
            type_="button"
            className="prev-exercise"
            disabled={state.currentExerciseIndex == 0}
            onClick={_ => send(PreviousExercise)}>
            {React.string("Previous Exercise")}
          </button>
          <button
            type_="button"
            className="next-exercise"
            disabled={state.currentExerciseIndex == workout.exercises->Array.length - 1}
            onClick={_ => send(NextExercise)}>
            {React.string("Next Exercise")}
          </button>
        </div>
      </div>

    | None =>
      <div className="error-state">
        <p> {React.string("Exercise not found.")} </p>
      </div>
    }
  }
}

type state =
  | PreWorkout
  | ActiveExercise(Workout.t)

type action = StartWorkout(Workout.t)

let update = (_state: state, action: action) => {
  switch action {
  | StartWorkout(workout) => ActiveExercise(workout)
  }
}

@react.component
let make = (~day: WeeklyPlan.Day.t, ~workouts: array<Workout.t>, ~weeklyPlan: WeeklyPlan.t) => {
  let workoutName = WeeklyPlan.get(weeklyPlan, day)
  let workout = Option.flatMap(workoutName, workoutName =>
    Array.find(workouts, w => w.name == workoutName)
  )

  let (state, send) = React.useReducer(update, PreWorkout)

  <div className="" id="exercise" ariaLive=#polite>
    {switch workout {
    | Some(workout) =>
      <>
        <div className="today-header">
          <h2> {React.string(`${day->WeeklyPlan.Day.toString}'s Workout`)} </h2>
          <div className="today-workout-info">
            <p className="workout-name"> {React.string(workout.name)} </p>
          </div>
        </div>
        {switch state {
        | PreWorkout =>
          <div className="pre-workout-view">
            <button className="start-workout-button" onClick={_ => send(StartWorkout(workout))}>
              {React.string("Start Workout")}
            </button>
            <div className="workout-preview">
              <WorkoutSection workout />
            </div>
            <button className="start-workout-button" onClick={_ => send(StartWorkout(workout))}>
              {React.string("Start Workout")}
            </button>
          </div>

        | ActiveExercise(workout) => <ActiveWorkout workout />
        }}
      </>

    | None =>
      <div className="error-state">
        <p> {React.string("No workout scheduled for today.")} </p>
      </div>
    }}
  </div>
}

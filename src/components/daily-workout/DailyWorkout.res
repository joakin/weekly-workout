type styles = {
  view: string,
  pre_workout_view: string,
  workout_preview: string,
  start_workout_button: string,
  today_header: string,
  workout_info: string,
  active_exercise: string,
  active_exercise_header: string,
  active_exercise_title: string,
  exercise_progress: string,
  active_exercise_info: string,
  target_reps: string,
  active_exercise_notes: string,
  set_completion_form: string,
  form_group: string,
  set_buttons: string,
  completed_sets: string,
  sets_title: string,
  sets_list: string,
  set_item: string,
  exercise_controls: string,
  prev_exercise: string,
  next_exercise: string,
  error_state: string,
  nav_button_prev: string,
  nav_button_next: string,
}
@module external styles: styles = "./daily-workout.module.css"

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
      }->resetCurrentSet,
    )
    let currentExercise = state.workout.exercises[state.currentExerciseIndex]

    switch currentExercise {
    | Some(exercise) =>
      let sets = NumberRange.formatRange(exercise.exercise.sets)
      let reps = NumberRange.formatRange(exercise.exercise.reps)

      <div className=styles.active_exercise>
        <div className=styles.active_exercise_header>
          <h3 className=styles.active_exercise_title> {React.string(exercise.exercise.name)} </h3>
          <div className=styles.exercise_progress>
            {
              let set = (exercise.completedSets->Array.length + 1)->Int.toString
              React.string(`Set ${set} of ${sets}`)
            }
          </div>
        </div>
        <div className=styles.active_exercise_info>
          <p className=styles.target_reps> {React.string(`Target: ${reps} reps`)} </p>
          {switch exercise.exercise.notes {
          | Some(notes) =>
            <p className=styles.active_exercise_notes>
              {React.string("ℹ ")}
              <span> {React.string(notes)} </span>
            </p>
          | None => React.null
          }}
        </div>
        <form
          className=styles.set_completion_form
          onSubmit={e => {
            JsxEvent.Form.preventDefault(e)
            switch state.currentSetStatus {
            | NotStarted => send(StartSet)
            | InProgress => send(EndSet)
            }
          }}>
          <div className=styles.form_group>
            <label htmlFor="reps-completed"> {React.string("Reps")} </label>
            <input
              type_="number"
              id="reps-completed"
              name="reps"
              min="0"
              required=true
              placeholder="Number of reps"
              value={state.currentSet.reps->Int.toString}
              onInput={e =>
                JsxEvent.Form.target(e)["value"]
                ->Int.fromString
                ->Option.forEach(i => send(RepsChanged(i)))}
            />
          </div>
          <div className=styles.form_group>
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
          <div className=styles.set_buttons>
            {switch state.currentSetStatus {
            | NotStarted =>
              <Button type_=Submit variant=Success fullWidth=true>
                {React.string("Start Set")}
              </Button>
            | InProgress =>
              <Button type_=Submit variant=Primary fullWidth=true>
                {React.string("Complete Set")}
              </Button>
            }}
          </div>
        </form>
        <div className=styles.completed_sets>
          <h4 className=styles.sets_title> {React.string("Completed Sets")} </h4>
          <ul className=styles.sets_list>
            {React.array(
              exercise.completedSets->Array.mapWithIndex((set, index) => {
                let duration = ((set.endTime -. set.startTime) /. 1000.)->Float.toFixed(~digits=1)
                let num = (index + 1)->Int.toString
                let reps = set.reps->Int.toString
                let weight = set.weight->Float.toFixed(~digits=1)
                let text = `Set ${num}: ${reps} reps @ ${weight}kg (${duration}s)`
                <li className=styles.set_item key={num}> {React.string(text)} </li>
              }),
            )}
          </ul>
        </div>
        <div className=styles.exercise_controls>
          <Button
            variant=Secondary
            disabled={state.currentExerciseIndex == 0}
            onClick={_ => send(PreviousExercise)}>
            {React.string("Previous Exercise")}
          </Button>
          <Button
            variant=Secondary
            disabled={state.currentExerciseIndex == workout.exercises->Array.length - 1}
            onClick={_ => send(NextExercise)}>
            {React.string("Next Exercise")}
          </Button>
        </div>
      </div>

    | None =>
      <div className=styles.error_state>
        <p> {React.string("Exercise not found.")} </p>
      </div>
    }
  }
}

type screen =
  | PreWorkout
  | ActiveExercise(Workout.t)

type state = {
  day: WeeklyPlan.Day.t,
  weeklyPlan: WeeklyPlan.t,
  screen: screen,
}

type action =
  | StartWorkout(Workout.t)
  | PrevWorkout
  | NextWorkout

let update = (state: state, action: action) => {
  switch action {
  | StartWorkout(workout) => {...state, screen: ActiveExercise(workout)}
  | PrevWorkout =>
    switch state.screen {
    | PreWorkout => {...state, day: WeeklyPlan.prev(state.weeklyPlan, state.day)}
    | _ => state
    }
  | NextWorkout =>
    switch state.screen {
    | PreWorkout => {...state, day: WeeklyPlan.next(state.weeklyPlan, state.day)}
    | _ => state
    }
  }
}

@react.component
let make = (~today: WeeklyPlan.Day.t, ~workouts: array<Workout.t>, ~weeklyPlan: WeeklyPlan.t) => {
  let (state, send) = React.useReducer(
    update,
    {
      day: today,
      weeklyPlan,
      screen: PreWorkout,
    },
  )

  let workoutName = WeeklyPlan.get(weeklyPlan, state.day)
  let workout = Option.flatMap(workoutName, workoutName =>
    Array.find(workouts, w => w.name == workoutName)
  )

  <div className=styles.view ariaLive=#polite>
    {<>
      <div className=styles.today_header>
        <h2> {React.string(`${state.day->WeeklyPlan.Day.toString}'s Workout`)} </h2>
        <p className=styles.workout_info> {React.string(workoutName->Option.getOr("Rest day"))} </p>
        <Button
          variant=Secondary className={styles.nav_button_prev} onClick={_ => send(PrevWorkout)}>
          {React.string("<")}
        </Button>
        <Button
          variant=Secondary className={styles.nav_button_next} onClick={_ => send(NextWorkout)}>
          {React.string(">")}
        </Button>
      </div>
      {switch state.screen {
      | PreWorkout =>
        <div className=styles.pre_workout_view>
          {switch workout {
          | Some(workout) =>
            <>
              <Button variant=Primary onClick={_ => send(StartWorkout(workout))}>
                {React.string("Start Workout")}
              </Button>
              <div className=styles.workout_preview>
                <WorkoutSection workout />
              </div>
              <Button variant=Primary onClick={_ => send(StartWorkout(workout))}>
                {React.string("Start Workout")}
              </Button>
            </>
          | None =>
            <div className=styles.error_state>
              <p>
                {React.string(`No workout scheduled for ${state.day->WeeklyPlan.Day.toString}.`)}
              </p>
            </div>
          }}
        </div>

      | ActiveExercise(workout) => <ActiveWorkout workout />
      }}
    </>}
  </div>
}

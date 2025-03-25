type styles = {
  day_workout: string,
  header: string,
  title: string,
  back_button: string,
}
@module external styles: styles = "./day-workout.module.css"

@react.component
let make = (~day: WeeklyPlan.Day.t, ~workoutName: string, ~workouts: array<Workout.t>) => {
  let workout = workouts->Array.find(w => w.name == workoutName)

  <div className=styles.day_workout>
    <div className=styles.header>
      <div className=styles.title>
        <h2> {day->WeeklyPlan.Day.toString->React.string} </h2>
        <p> {React.string(workoutName)} </p>
      </div>
      <a className=styles.back_button ariaLabel="Back to weekly plan" href="#/weekly-plan">
        {React.string("← Back to Week")}
      </a>
    </div>
    <div>
      {switch workout {
      | Some(workout) => <WorkoutSection workout />
      | None => <p> {React.string("Workout not found.")} </p>
      }}
    </div>
  </div>
}

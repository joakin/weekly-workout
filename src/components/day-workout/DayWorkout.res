// Import CSS
%%raw("import './day-workout.css';")

@react.component
let make = (~day: WeeklyPlan.Day.t, ~workoutName: string, ~workouts: array<Workout.t>) => {
  let workout = workouts->Array.find(w => w.name == workoutName)

  <div className="day-workout">
    <div className="day-header">
      <div className="day-title">
        <h2> {day->WeeklyPlan.Day.toString->React.string} </h2>
        <p> {React.string(workoutName)} </p>
      </div>
      <a className="back-button" ariaLabel="Back to weekly plan" href="#/weekly-plan">
        {React.string("← Back to Week")}
      </a>
    </div>
    <div className="workout-container">
      {switch workout {
      | Some(workout) => <WorkoutSection workout />
      | None => <p> {React.string("Workout not found.")} </p>
      }}
    </div>
  </div>
}

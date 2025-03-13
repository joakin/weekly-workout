%%raw("import './workouts.css';")

@react.component
let make = (~workouts: array<Workout.t>) => {
  <div className="workouts-grid">
    {Array.map(workouts, workout => {
      <WorkoutSection key={workout.name} workout />
    })->React.array}
  </div>
}

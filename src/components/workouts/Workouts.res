type styles = {workouts: string}
@module external styles: styles = "./workouts.module.css"

@react.component
let make = (~workouts: array<Workout.t>) => {
  <div className=styles.workouts>
    {Array.map(workouts, workout => {
      <WorkoutSection key={workout.name} workout />
    })->React.array}
  </div>
}

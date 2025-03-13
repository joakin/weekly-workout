%%raw("import './workout-section.css';")

@react.component
let make = (~workout: Workout.t) => {
  <section className="workout-section">
    <h2> {React.string(workout.name)} </h2>
    <ExerciseList exercises={workout.exercises} />
  </section>
}

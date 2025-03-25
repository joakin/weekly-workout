type styles = {section: string, header: string}
@module external styles: styles = "./workout-section.module.css"

@react.component
let make = (~workout: Workout.t) => {
  <section className={styles.section}>
    <h2 className={styles.header}> {React.string(workout.name)} </h2>
    <ExerciseList exercises={workout.exercises} />
  </section>
}

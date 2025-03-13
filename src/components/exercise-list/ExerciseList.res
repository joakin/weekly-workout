%%raw("import './exercise-list.css';")

module ExerciseElement = {
  @react.component
  let rec make = (~exercise: Exercise.t, ~isSuperset: bool=false) => {
    let name = isSuperset ? "Superset: " ++ exercise.name : exercise.name
    let sets = NumberRange.formatRange(exercise.sets)->React.string
    let reps = NumberRange.formatRange(exercise.reps)->React.string

    <li className={"exercise-item" ++ (isSuperset ? " superset" : "")}>
      <div className="exercise-name"> {React.string(name)} </div>
      <div className="exercise-sets">
        sets
        {React.string(" sets × ")}
        reps
      </div>
      {switch exercise.notes {
      | Some(notes) =>
        <div className="exercise-notes">
          <span> {React.string({isSuperset ? "★" : "ℹ"} ++ " " ++ notes)} </span>
        </div>
      | None => React.null
      }}
      {switch exercise.superset {
      | Some(superset) => React.createElement(make, {exercise: superset, isSuperset: true})
      | None => React.null
      }}
    </li>
  }
}

@react.component
let make = (~exercises: array<Exercise.t>) => {
  <ul className="exercise-list">
    {exercises
    ->Array.map(exercise => <ExerciseElement key={exercise.name} exercise />)
    ->React.array}
  </ul>
}

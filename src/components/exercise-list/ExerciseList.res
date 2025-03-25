type styles = {
  list: string,
  item: string,
  name: string,
  sets: string,
  notes: string,
}
@module external styles: styles = "./exercise-list.module.css"

module ExerciseContainer = {
  @react.component
  let make = (~isSuperset: bool, ~children: React.element) => {
    let className = styles.item ++ (isSuperset ? " superset" : "")
    if isSuperset {
      <li className> {children} </li>
    } else {
      <div className> {children} </div>
    }
  }
}

module ExerciseElement = {
  @react.component
  let rec make = (~exercise: Exercise.t, ~isSuperset: bool=false) => {
    let name = isSuperset ? "Superset: " ++ exercise.name : exercise.name
    let sets = NumberRange.formatRange(exercise.sets)->React.string
    let reps = NumberRange.formatRange(exercise.reps)->React.string

    <ExerciseContainer isSuperset>
      <div className=styles.name> {React.string(name)} </div>
      <div className=styles.sets>
        sets
        {React.string(" sets × ")}
        reps
      </div>
      {switch exercise.notes {
      | Some(notes) =>
        <div className=styles.notes>
          <span> {React.string({isSuperset ? "★" : "ℹ"} ++ " " ++ notes)} </span>
        </div>
      | None => React.null
      }}
      {switch exercise.superset {
      | Some(superset) => React.createElement(make, {exercise: superset, isSuperset: true})
      | None => React.null
      }}
    </ExerciseContainer>
  }
}

@react.component
let make = (~exercises: array<Exercise.t>) => {
  <ul className=styles.list>
    {exercises
    ->Array.map(exercise => <ExerciseElement key={exercise.name} exercise />)
    ->React.array}
  </ul>
}

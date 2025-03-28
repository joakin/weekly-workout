type t = {
  name: string,
  exercises: array<Exercise.t>,
}

let fromJson = (json: JSON.t) => {
  let error = () => Error(
    `Parse error: Wanted Workout.t, got:\n\n${json->JSON.stringify(~space=2)}`,
  )
  switch json {
  | Object(workoutDict) =>
    switch (Dict.get(workoutDict, "name"), Dict.get(workoutDict, "exercises")) {
    | (Some(String(name)), Some(Array(exercisesJson))) =>
      switch exercisesJson
      ->Array.map(Exercise.fromJson)
      ->ResultExtra.combine {
      | Ok(exercises) => Ok({name, exercises})
      | Error(errs) => Error(`Parse error: Exercise.exercises\n\n${errs->Array.join("\n")}`)
      }
    | _ => error()
    }
  | _ => error()
  }
}

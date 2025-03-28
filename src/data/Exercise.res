type rec t = {
  name: string,
  sets: NumberRange.t,
  reps: NumberRange.t,
  notes?: string,
  superset?: t,
}

let rec fromJson: JSON.t => result<t, string> = json => {
  let error: unit => result<t, string> = () => Error(
    `Parse error: Wanted Exercise.t, got:\n\n${json->JSON.stringify(~space=2)}`,
  )
  switch json {
  | Object(exerciseDict) =>
    switch (
      Dict.get(exerciseDict, "name"),
      Dict.get(exerciseDict, "sets"),
      Dict.get(exerciseDict, "reps"),
      Dict.get(exerciseDict, "notes"),
      Dict.get(exerciseDict, "superset"),
    ) {
    | (Some(String(name)), Some(sets), Some(reps), maybeNotes, maybeSuperset) =>
      let notesResult = switch maybeNotes {
      | Some(String(notes)) => Ok(Some(notes))
      | None => Ok(None)
      | Some(_) => Error("Parse error: Exercise.notes")
      }

      let supersetResult = switch maybeSuperset {
      | Some(superset) => fromJson(superset)->Result.map(s => Some(s))
      | None => Ok(None)
      }

      switch (NumberRange.fromJson(sets), NumberRange.fromJson(reps), notesResult, supersetResult) {
      | (Ok(sets), Ok(reps), Ok(notes), Ok(superset)) => Ok({name, sets, reps, ?notes, ?superset})
      | (Error(err), _, _, _) => Error(`Parse error: Exercise.sets\n\n${err}`)
      | (_, Error(err), _, _) => Error(`Parse error: Exercise.reps\n\n${err}`)
      | (_, _, Error(err), _) => Error(`Parse error: Exercise.notes\n\n${err}`)
      | (_, _, _, Error(err)) => Error(`Parse error: Exercise.superset\n\n${err}`)
      }
    | _ => error()
    }
  | _ => error()
  }
}

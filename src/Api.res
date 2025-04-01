module Workouts = {
  let get = async () => {
    open Fetch
    try {
      let response = await fetch(
        "./workouts.json",
        {
          method: #GET,
          headers: Headers.fromObject({
            "Content-type": "application/json",
          }),
        },
      )
      let json = await response->Response.json

      // Parse the JSON
      let error = () => Error(
        `Parse error: Api.Workouts.get, got:\n\n${json->JSON.stringify(~space=2)}`,
      )
      switch json {
      | Object(obj) =>
        switch Dict.get(obj, "workouts") {
        | Some(Array(workoutsJson)) =>
          switch workoutsJson->Array.map(Workout.fromJson)->ResultExtra.combine {
          | Ok(workouts) => Ok(workouts)
          | Error(errs) => Error(`Parse error: workouts\n\n${errs->Array.join("\n")}`)
          }
        | _ => error()
        }
      | _ => error()
      }
    } catch {
    | Exn.Error(e) => Error(Exn.message(e)->Option.getOr("Error fetching workouts"))
    }
  }
}

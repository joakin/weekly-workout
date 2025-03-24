type t =
  | WeeklyPlan
  | WeeklyPlanDay(WeeklyPlan.Day.t)
  | Workouts
  | Exercise
  | NotFound(string)

let defaultRoute = Exercise

let fromHash = (hash: string): t => {
  if hash->String.startsWith("#/") {
    // Remove the `#`
    let pathStr = hash->String.sliceToEnd(~start=1)
    // Remove the leading `/` and split
    let path = pathStr->String.sliceToEnd(~start=1)->String.split("/")
    switch path {
    | [] | [""] => defaultRoute
    | ["weekly-plan"] => WeeklyPlan
    | ["weekly-plan", day] =>
      switch WeeklyPlan.Day.fromString(day) {
      | Some(day) => WeeklyPlanDay(day)
      | None => NotFound(pathStr)
      }
    | ["workouts"] => Workouts
    | ["exercise"] => Exercise
    | _ => NotFound(pathStr)
    }
  } else {
    defaultRoute
  }
}

let toString = (route: t): string => {
  "/" ++
  switch route {
  | WeeklyPlan => "weekly-plan"
  | WeeklyPlanDay(day) => "weekly-plan/" ++ WeeklyPlan.Day.toString(day)
  | Workouts => "workouts"
  | Exercise => "exercise"
  | NotFound(path) => path
  }
}

let toHash = (route: t): string => "#" ++ toString(route)

/**
 * Checks if the `route` is *active* based on the full `activeRoute`.
 *
 * Useful for highlighting navigation items for example.
 */
let isActive = (~route: t, ~activeRoute: t): bool =>
  switch (route, activeRoute) {
  | (WeeklyPlan, WeeklyPlan | WeeklyPlanDay(_)) => true

  | (Workouts, Workouts) => true

  | (Exercise, Exercise) => true

  | (
      WeeklyPlan
      | WeeklyPlanDay(_)
      | Workouts
      | Exercise
      | NotFound(_),
      _,
    ) => false
  }

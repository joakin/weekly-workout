%%raw("import './weekly-plan.css';")

module DayCard = {
  @react.component
  let make = (~day: WeeklyPlan.day, ~workout: option<string>) => {
    let dayName = switch day {
    | Monday => "Monday"
    | Tuesday => "Tuesday"
    | Wednesday => "Wednesday"
    | Thursday => "Thursday"
    | Friday => "Friday"
    | Saturday => "Saturday"
    | Sunday => "Sunday"
    }

    let dayPath = switch day {
    | Monday => "monday"
    | Tuesday => "tuesday"
    | Wednesday => "wednesday"
    | Thursday => "thursday"
    | Friday => "friday"
    | Saturday => "saturday"
    | Sunday => "sunday"
    }

    let workoutName = switch workout {
    | Some(name) => name
    | None => "Rest Day"
    }

    let href = "#/weekly-plan/" ++ dayPath

    <div className={"day-card" ++ (workout == None ? " rest" : "")}>
      <a href className="day-card-link" />
      <h2> {React.string(dayName)} </h2>
      <p> {React.string(workoutName)} </p>
    </div>
  }
}

@react.component
let make = (~weeklyPlan: WeeklyPlan.t) => {
  <div className="weekly-plan">
    <DayCard day=Monday workout={weeklyPlan.monday} />
    <DayCard day=Tuesday workout={weeklyPlan.tuesday} />
    <DayCard day=Wednesday workout={weeklyPlan.wednesday} />
    <DayCard day=Thursday workout={weeklyPlan.thursday} />
    <DayCard day=Friday workout={weeklyPlan.friday} />
    <DayCard day=Saturday workout={weeklyPlan.saturday} />
    <DayCard day=Sunday workout={weeklyPlan.sunday} />
  </div>
}

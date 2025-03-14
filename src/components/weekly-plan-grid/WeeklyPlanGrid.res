%%raw("import './weekly-plan.css';")

module DayCard = {
  @react.component
  let make = (~day: WeeklyPlan.Day.t, ~workout: option<string>) => {
    let dayName = day->WeeklyPlan.Day.toString
    let dayPath = dayName->String.toLowerCase

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

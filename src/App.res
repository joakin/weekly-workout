%%raw("import './App.css'")

@react.component
let make = (~workouts: array<Workout.t>) => {
  let (hash, setHash) = Hooks.useHash()
  let activeRoute = Route.fromHash(hash)

  let today = WeeklyPlan.Day.today()
  let weeklyPlan: WeeklyPlan.t = {
    monday: Some("Push 1"),
    tuesday: Some("Pull 1"),
    wednesday: Some("Legs"),
    thursday: Some("Push 2"),
    friday: Some("Pull 2"),
    saturday: None,
    sunday: None,
  }

  let (menuActive, setMenuActive) = React.useState(_ => false)
  let toggleMenu = () => {
    setMenuActive(menuActive => !menuActive)
  }

  let menuItems =
    [("Weekly Plan", Route.WeeklyPlan), ("Workouts", Route.Workouts), ("Exercise", Route.Exercise)]
    ->Array.map(((label, route)) => {
      let isActive = route === activeRoute
      let className = isActive ? "active" : ""
      let href = Route.toHash(route)

      <li role="none" key=href>
        <a href className={"nav-link " ++ className} role="menuitem" onClick={_ => toggleMenu()}>
          {React.string(label)}
        </a>
      </li>
    })
    ->React.array

  <>
    <header>
      <h1 onClick={_ => setHash("/")}> {React.string("Weekly Workout")} </h1>
      <nav ariaLabel="Main navigation">
        <button
          id="menu-toggle"
          ariaLabel="Toggle menu"
          ariaExpanded=false
          ariaControls="nav-menu"
          className={menuActive ? "active" : ""}
          onClick={_ => toggleMenu()}>
          <span className="menu-icon" />
        </button>
        <ul id="nav-menu" className={menuActive ? "active" : ""} role="menubar"> {menuItems} </ul>
      </nav>
    </header>
    <main>
      {switch activeRoute {
      | Route.WeeklyPlan => <WeeklyPlanGrid weeklyPlan />
      | Route.WeeklyPlanDay(day) =>
        switch WeeklyPlan.get(weeklyPlan, day) {
        | Some(workoutName) => <DayWorkout day workoutName workouts />
        | None =>
          <p> {React.string("No workout scheduled for " ++ day->WeeklyPlan.Day.toString)} </p>
        }
      | Route.Workouts => <Workouts workouts />
      | Route.Exercise => <DailyWorkout day=today workouts weeklyPlan />
      | Route.NotFound(path) => <p> {React.string("Page not found: " ++ path)} </p>
      }}
    </main>
  </>
}

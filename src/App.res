type styles = {
  header: string,
  nav: string,
  menu_toggle: string,
  menu_icon: string,
  nav_menu: string,
  nav_link: string,
}
@module external styles: styles = "./App.module.css"

module Loaded = {
  @react.component
  let make = (~workouts: array<Workout.t>) => {
    let activeRoute = Hooks.useRoute()

    let today = WeeklyPlan.Day.today()
    let weeklyPlan: WeeklyPlan.t = {
      monday: "Push 1",
      tuesday: "Pull 1",
      wednesday: "Legs",
      thursday: "Push 2",
      friday: "Pull 2",
    }

    let (menuActive, setMenuActive) = React.useState(_ => false)
    let toggleMenu = () => {
      setMenuActive(menuActive => !menuActive)
    }

    let menuItems =
      [
        ("Weekly Plan", Route.WeeklyPlan),
        ("Workouts", Route.Workouts),
        ("Exercise", Route.Exercise),
      ]
      ->Array.map(((label, route)) => {
        let isActive = Route.isActive(~route, ~activeRoute)
        let className = isActive ? "active" : ""
        let href = Route.toHash(route)

        <li role="none" key=href>
          <a
            href
            className={styles.nav_link ++ " " ++ className}
            role="menuitem"
            onClick={_ => toggleMenu()}>
            {React.string(label)}
          </a>
        </li>
      })
      ->React.array

    <>
      <header className={styles.header}>
        <h1 onClick={_ => Route.navigate(Route.defaultRoute)}>
          {React.string("Weekly Workout")}
        </h1>
        <nav className=styles.nav ariaLabel="Main navigation">
          <button
            className={styles.menu_toggle ++ (menuActive ? " active" : "")}
            ariaLabel="Toggle menu"
            ariaExpanded=false
            ariaControls="nav-menu"
            onClick={_ => toggleMenu()}>
            <span className=styles.menu_icon />
          </button>
          <ul
            id="nav-menu"
            className={styles.nav_menu ++ (menuActive ? " active" : "")}
            role="menubar">
            {menuItems}
          </ul>
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
}

@react.component
let make = () => {
  let state = State.useState(state => state)

  switch state {
  | State.Loading => React.null
  | State.Loaded(workouts) => <Loaded workouts />
  | State.Failed => <p> {React.string("Failed to load workouts")} </p>
  }
}

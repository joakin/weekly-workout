let fetchWorkouts: unit => Promise.t<array<Workout.t>> = %raw(`
  async function fetchWorkouts() {
      try {
          const response = await fetch("workouts.json");
          if (!response.ok) throw new Error("Failed to fetch workouts");
          const data = await response.json();
          return data.workouts;
      } catch (error) {
          console.error("Error fetching workouts:", error);
          throw error;
      }
  }
`)

let _ = (
  async () => {
    let workouts = await fetchWorkouts()
    switch ReactDOM.querySelector("#root") {
    | Some(domElement) =>
      ReactDOM.Client.createRoot(domElement)->ReactDOM.Client.Root.render(
        <React.StrictMode>
          <App workouts />
        </React.StrictMode>,
      )
    | None => ()
    }
  }
)()

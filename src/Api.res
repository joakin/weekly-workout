module Workouts = {
  let get: unit => Promise.t<array<Workout.t>> = %raw(`
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
}

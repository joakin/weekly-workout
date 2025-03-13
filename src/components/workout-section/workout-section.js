import "./workout-section.css";
import { createExerciseList } from "../exercise-list/exercise-list.js";

/**
 * @param {import("../../data/workout.js").Workout} workout
 * @returns {HTMLElement}
 */
export function createWorkoutSection(workout) {
    const section = document.createElement("section");
    section.className = "workout-section";

    const title = document.createElement("h2");
    title.textContent = workout.name;

    const exerciseList = createExerciseList(workout.exercises);

    section.append(title, exerciseList);
    return section;
}

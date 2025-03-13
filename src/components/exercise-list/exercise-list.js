import { createRoot } from "react-dom/client";
import { make as ExerciseList } from "./ExerciseList.res.mjs";

/**
 * @param {import("../../data/exercise.js").Exercise[]} exercises
 * @returns {HTMLElement}
 */
export function createExerciseList(exercises) {
    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(<ExerciseList exercises={exercises} />);
    return container;
}

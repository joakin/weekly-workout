import { formatRange } from "../../data/number-range.js";

/**
 * @param {import("../../data/exercise.js").Exercise} exercise
 * @param {boolean} [isSuperset]
 * @returns {HTMLElement}
 */
function createExerciseElement(exercise, isSuperset = false) {
    const li = document.createElement("li");
    li.className = `exercise-item${isSuperset ? " superset" : ""}`;

    const nameDiv = document.createElement("div");
    nameDiv.className = "exercise-name";
    nameDiv.textContent = isSuperset
        ? `Superset: ${exercise.name}`
        : exercise.name;

    const setsDiv = document.createElement("div");
    setsDiv.className = "exercise-sets";
    setsDiv.textContent = `${formatRange(exercise.sets)} sets × ${formatRange(
        exercise.reps
    )}`;

    li.append(nameDiv, setsDiv);

    if (exercise.notes) {
        const notesDiv = document.createElement("div");
        notesDiv.className = "exercise-notes";
        notesDiv.innerHTML = `${isSuperset ? "★" : "ℹ"} <span>${
            exercise.notes
        }</span>`;
        li.appendChild(notesDiv);
    }

    if (exercise.superset) {
        li.appendChild(createExerciseElement(exercise.superset, true));
    }

    return li;
}

/**
 * @param {import("../../data/exercise.js").Exercise[]} exercises
 * @returns {HTMLElement}
 */
export function createExerciseList(exercises) {
    const ul = document.createElement("ul");
    ul.className = "exercise-list";

    exercises.forEach((exercise) => {
        ul.appendChild(createExerciseElement(exercise));
    });

    return ul;
}

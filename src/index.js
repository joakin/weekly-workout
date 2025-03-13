import "./index.res.mjs";
import { createRoot } from "react-dom/client";
import { make as WorkoutSection } from "./components/workout-section/WorkoutSection.res.mjs";
import * as JsxRuntime from "react/jsx-runtime";
import { make as Workouts } from "./components/workouts/Workouts.res.mjs";
import { make as WeeklyPlan } from "./components/weekly-plan-grid/WeeklyPlanGrid.res.mjs";

if (process.env.NODE_ENV === "development") {
    // Add live reload for development
    // This will automatically reload the page when files are changed
    new EventSource("/esbuild").addEventListener("change", () =>
        location.reload()
    );
}

import "./style.css";
import { formatRange } from "./data/number-range.js";

/**
 * @typedef {'workouts' | 'weekly-plan' | 'exercise'} ViewType
 */

/**
 * @typedef {Object} PerformedSet
 * @property {number} reps
 * @property {number} weight
 * @property {number} startTime
 * @property {number} endTime
 */

/**
 * @typedef {Object} ExerciseProgress
 * @property {import("./data/exercise.js").Exercise} exercise
 * @property {PerformedSet[]} completedSets
 */

/**
 * @typedef {Object} WorkoutProgress
 * @property {number} startTime
 * @property {number} endTime
 * @property {import("./data/workout.js").Workout} workout
 * @property {ExerciseProgress[]} exercises
 * @property {number} currentExerciseIndex
 */

/**
 * @typedef {Object} Routes
 * @property {string} WEEKLY_PLAN
 * @property {string} WORKOUTS
 * @property {string} EXERCISE
 * @property {(day: string) => string} WEEKLY_DAY
 */

/**
 * @typedef {Object} DOMElements
 * @property {HTMLElement} menuToggle
 * @property {HTMLElement} navMenu
 * @property {NodeListOf<HTMLAnchorElement>} navLinks
 * @property {NodeListOf<HTMLElement>} views
 * @property {NodeListOf<HTMLElement>} weeklyPlanDayCards
 * @property {HTMLElement} dayWorkoutView
 * @property {HTMLElement} backButton
 * @property {HTMLElement} workoutContainer
 * @property {HTMLElement} weeklyPlanGrid
 * @property {HTMLElement} workoutsContainer
 * @property {HTMLElement} exerciseView
 * @property {HTMLElement} exerciseTitle
 * @property {HTMLElement} exerciseProgress
 * @property {HTMLElement} exerciseTargetReps
 * @property {HTMLElement} exerciseNotes
 * @property {HTMLFormElement} exerciseForm
 * @property {HTMLInputElement} exerciseWeightInput
 * @property {HTMLInputElement} exerciseRepsInput
 * @property {HTMLButtonElement} exerciseStartButton
 * @property {HTMLButtonElement} exerciseCompleteButton
 * @property {HTMLElement} exerciseSetsList
 * @property {HTMLButtonElement} exercisePrevButton
 * @property {HTMLButtonElement} exerciseNextButton
 * @property {HTMLElement} exercisePreWorkoutView
 * @property {HTMLElement} exerciseActiveView
 * @property {HTMLElement} exerciseWorkoutPreview
 * @property {HTMLElement} exerciseErrorState
 * @property {HTMLElement} exerciseHeaderTitle
 * @property {HTMLElement} exerciseWorkoutName
 * @property {NodeListOf<HTMLButtonElement>} exerciseStartWorkoutButtons
 * @property {HTMLElement} dayWorkoutTitle
 * @property {HTMLElement} dayWorkoutType
 * @property {HTMLTemplateElement} weeklyPlanDayCardTemplate
 */

// Constants
/** @type {Record<'WORKOUTS' | 'WEEKLY_PLAN' | 'EXERCISE', ViewType>} */
const VIEWS = {
    WORKOUTS: "workouts",
    WEEKLY_PLAN: "weekly-plan",
    EXERCISE: "exercise",
};

/** @type {ViewType} */
const DEFAULT_VIEW = VIEWS.WEEKLY_PLAN;

/** @type {Routes} */
const ROUTES = {
    WEEKLY_PLAN: `/${VIEWS.WEEKLY_PLAN}`,
    WORKOUTS: `/${VIEWS.WORKOUTS}`,
    EXERCISE: `/${VIEWS.EXERCISE}`,
    WEEKLY_DAY: (day) => `/${VIEWS.WEEKLY_PLAN}/${day}`,
};

// Cache
/** @type {import("./data/workout.js").Workout[] | null} */
let workoutsCache = null;

/** @type {WorkoutProgress | null} */
let activeWorkout = null;

/** @type {import("./components/weekly-plan/weekly-plan.js").WeeklyPlan} */
const weeklyPlan = {
    monday: "Push 1",
    tuesday: "Pull 1",
    wednesday: "Legs",
    thursday: "Push 2",
    friday: "Pull 2",
    saturday: null,
    sunday: null,
};

// Ensure all DOM elements exist before creating the elements object
const menuToggle = /** @type {HTMLElement} */ (
    document.getElementById("menu-toggle")
);
const navMenu = /** @type {HTMLElement} */ (
    document.getElementById("nav-menu")
);
const dayWorkoutView = /** @type {HTMLElement} */ (
    document.getElementById("day-workout")
);
const backButton = /** @type {HTMLElement} */ (
    document.querySelector(".back-button")
);
const workoutContainer = /** @type {HTMLElement} */ (
    document.querySelector(".workout-container")
);
const weeklyPlanGrid = /** @type {HTMLElement} */ (
    document.querySelector("#weekly-plan")
);
const workoutsContainer = /** @type {HTMLElement} */ (
    document.querySelector("#workouts")
);
const exerciseView = /** @type {HTMLElement} */ (
    document.getElementById("exercise")
);

if (
    !menuToggle ||
    !navMenu ||
    !dayWorkoutView ||
    !backButton ||
    !workoutContainer ||
    !weeklyPlanGrid ||
    !workoutsContainer ||
    !exerciseView
) {
    throw new Error("Required DOM elements not found");
}

// Exercise view elements
const exerciseTitle = /** @type {HTMLElement} */ (
    exerciseView.querySelector(".active-exercise-title")
);
const exerciseProgress = /** @type {HTMLElement} */ (
    exerciseView.querySelector(".exercise-progress")
);
const exerciseTargetReps = /** @type {HTMLElement} */ (
    exerciseView.querySelector(".target-reps")
);
const exerciseNotes = /** @type {HTMLElement} */ (
    exerciseView.querySelector(".active-exercise-notes")
);
const exerciseForm = /** @type {HTMLFormElement} */ (
    exerciseView.querySelector(".set-completion-form")
);
const exerciseWeightInput = /** @type {HTMLInputElement} */ (
    exerciseForm?.querySelector("#weight-used")
);
const exerciseRepsInput = /** @type {HTMLInputElement} */ (
    exerciseForm?.querySelector("#reps-completed")
);
const exerciseStartButton = /** @type {HTMLButtonElement} */ (
    exerciseForm?.querySelector("#start-set")
);
const exerciseCompleteButton = /** @type {HTMLButtonElement} */ (
    exerciseForm?.querySelector("#complete-set")
);
const exerciseSetsList = /** @type {HTMLElement} */ (
    exerciseView.querySelector(".sets-list")
);
const exercisePrevButton = /** @type {HTMLButtonElement} */ (
    exerciseView.querySelector(".prev-exercise")
);
const exerciseNextButton = /** @type {HTMLButtonElement} */ (
    exerciseView.querySelector(".next-exercise")
);
const exercisePreWorkoutView = /** @type {HTMLElement} */ (
    exerciseView.querySelector(".pre-workout-view")
);
const exerciseActiveView = /** @type {HTMLElement} */ (
    exerciseView.querySelector(".exercise-container")
);
const exerciseWorkoutPreview = /** @type {HTMLElement} */ (
    exercisePreWorkoutView?.querySelector(".workout-preview")
);
const exerciseErrorState = /** @type {HTMLElement} */ (
    exerciseView.querySelector(".error-state")
);
const exerciseHeaderTitle = /** @type {HTMLElement} */ (
    exerciseView.querySelector(".today-header h2")
);
const exerciseWorkoutName = /** @type {HTMLElement} */ (
    exerciseView.querySelector(".workout-name")
);
const exerciseStartWorkoutButtons =
    /** @type {NodeListOf<HTMLButtonElement>} */ (
        exerciseView.querySelectorAll(".start-workout-button")
    );

// Day workout elements
const dayWorkoutTitle = /** @type {HTMLElement} */ (
    dayWorkoutView.querySelector(".day-title h2")
);
const dayWorkoutType = /** @type {HTMLElement} */ (
    dayWorkoutView.querySelector(".day-title p")
);
const weeklyPlanDayCardTemplate = /** @type {HTMLTemplateElement} */ (
    document.getElementById("weekly-plan-day-card-template")
);

if (
    !exerciseTitle ||
    !exerciseProgress ||
    !exerciseTargetReps ||
    !exerciseNotes ||
    !exerciseForm ||
    !exerciseWeightInput ||
    !exerciseRepsInput ||
    !exerciseStartButton ||
    !exerciseCompleteButton ||
    !exerciseSetsList ||
    !exercisePrevButton ||
    !exerciseNextButton ||
    !exercisePreWorkoutView ||
    !exerciseActiveView ||
    !exerciseWorkoutPreview ||
    !exerciseErrorState ||
    !exerciseHeaderTitle ||
    !exerciseWorkoutName ||
    !dayWorkoutTitle ||
    !dayWorkoutType ||
    !weeklyPlanDayCardTemplate
) {
    throw new Error("Required exercise view elements not found");
}

/** @type {DOMElements} */
const elements = {
    menuToggle,
    navMenu,
    navLinks: /** @type {NodeListOf<HTMLAnchorElement>} */ (
        document.querySelectorAll(".nav-link")
    ),
    views: /** @type {NodeListOf<HTMLElement>} */ (
        document.querySelectorAll(".view")
    ),
    weeklyPlanDayCards: /** @type {NodeListOf<HTMLElement>} */ (
        document.querySelectorAll(".weekly-plan .day-card")
    ),
    dayWorkoutView,
    backButton,
    workoutContainer,
    weeklyPlanGrid,
    workoutsContainer,
    exerciseView,
    exerciseTitle,
    exerciseProgress,
    exerciseTargetReps,
    exerciseNotes,
    exerciseForm,
    exerciseWeightInput,
    exerciseRepsInput,
    exerciseStartButton,
    exerciseCompleteButton,
    exerciseSetsList,
    exercisePrevButton,
    exerciseNextButton,
    exercisePreWorkoutView,
    exerciseActiveView,
    exerciseWorkoutPreview,
    exerciseErrorState,
    exerciseHeaderTitle,
    exerciseWorkoutName,
    exerciseStartWorkoutButtons,
    dayWorkoutTitle,
    dayWorkoutType,
    weeklyPlanDayCardTemplate,
};

// Utility functions
const utils = {
    /** @type {(string: string) => string} */
    capitalizeFirstLetter: (string) =>
        string.charAt(0).toUpperCase() + string.slice(1),

    /** @type {(tag: string, className?: string) => HTMLElement} */
    createElementWithClass: (tag, className) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        return element;
    },

    /** @type {(element: HTMLElement, text: string) => void} */
    setElementText: (element, text) => {
        element.textContent = text;
    },

    /** @type {(element: HTMLElement, show: boolean) => void} */
    toggleVisibility: (element, show) => {
        // Using dataset to store the default display value
        element.style.display = show
            ? element.dataset["defaultDisplay"] || "block"
            : "none";
    },

    /** @type {() => boolean} */
    isMobileMenuVisible: () => {
        return window.getComputedStyle(elements.menuToggle).display !== "none";
    },
};

// Navigation handling
/** @type {(path: string) => void} */
function showView(path) {
    assertDefined(workoutsCache, "workoutsCache");

    // Remove leading slash if present
    path = path.startsWith("/") ? path.substring(1) : path;
    const [section, param] = path.split("/");

    elements.views.forEach((view) => view.classList.remove("active"));

    // Map route to view ID
    const viewId =
        section === VIEWS.WORKOUTS
            ? VIEWS.WORKOUTS
            : section === VIEWS.WEEKLY_PLAN
            ? VIEWS.WEEKLY_PLAN
            : section === VIEWS.EXERCISE
            ? VIEWS.EXERCISE
            : DEFAULT_VIEW;

    const viewElement = document.getElementById(viewId);
    if (viewElement) {
        viewElement.classList.add("active");
        if (viewId === VIEWS.WORKOUTS) {
            // NOOP
        } else if (viewId === VIEWS.EXERCISE) {
            showExerciseView(workoutsCache);
        } else if (viewId === VIEWS.WEEKLY_PLAN) {
            if (param) {
                // Type guard to ensure param is a valid day
                if (isValidDay(param) && weeklyPlan[param]) {
                    showDayWorkout(param, workoutsCache);
                } else {
                    console.error(`Invalid day: ${param}`);
                }
            } else showWeekView();
        }
    } else {
        console.error(`Could not find view: ${viewId}`);
    }

    elements.navLinks.forEach((link) => {
        link.classList.remove("active");
        const href = link.getAttribute("href");
        if (href) {
            const linkPath = href.substring(2); // Remove #/ prefix
            const linkSection = linkPath.split("/")[0];
            if (linkSection === section) {
                link.classList.add("active");
            }
        }
    });
}

/** @type {() => void} */
function toggleMenu() {
    elements.menuToggle.classList.toggle("active");
    elements.navMenu.classList.toggle("active");
}

// Weekly plan handling
/** @type {(day: string) => day is keyof import("./components/weekly-plan/weekly-plan.js").WeeklyPlan} */
function isValidDay(day) {
    return day in weeklyPlan;
}

/** @type {(day: keyof import("./components/weekly-plan/weekly-plan.js").WeeklyPlan, workouts: import("./data/workout.js").Workout[]) => void} */
function showDayWorkout(day, workouts) {
    const workoutName = weeklyPlan[day];
    if (!workoutName) return;

    utils.toggleVisibility(elements.weeklyPlanGrid, false);
    elements.dayWorkoutView.classList.remove("hidden");

    const dayTitle = /** @type {HTMLElement | null} */ (
        elements.dayWorkoutView.querySelector(".day-title h2")
    );
    const workoutType = /** @type {HTMLElement | null} */ (
        elements.dayWorkoutView.querySelector(".day-title p")
    );
    if (dayTitle && workoutType) {
        utils.setElementText(dayTitle, utils.capitalizeFirstLetter(day));
        utils.setElementText(workoutType, workoutName);
    }

    loadWorkout(workoutName, workouts);
}

/** @type {() => void} */
function showWeekView() {
    utils.toggleVisibility(elements.weeklyPlanGrid, true);
    elements.dayWorkoutView.classList.add("hidden");
}

/** @type {(workoutName: string, workouts: import("./data/workout.js").Workout[]) => void} */
function loadWorkout(workoutName, workouts) {
    const workout = workouts.find((w) => w.name === workoutName);
    if (workout) {
        elements.workoutContainer.innerHTML = "";
        elements.workoutContainer.appendChild(createWorkoutSection(workout));
    } else {
        elements.workoutContainer.innerHTML = "<p>Workout not found.</p>";
    }
}

/** @type {() => void} */
function populateWeeklyView() {
    const root = createRoot(elements.weeklyPlanGrid);
    root.render(
        JsxRuntime.jsx(WeeklyPlan, {
            weeklyPlan,
        })
    );
}

/**
 * @param {import("./data/workout.js").Workout} workout
 */
function initializeWorkout(workout) {
    activeWorkout = {
        startTime: Date.now(),
        endTime: 0, // Will be set when workout is completed
        workout: workout,
        exercises: workout.exercises.map((exercise) => ({
            exercise,
            completedSets: [],
        })),
        currentExerciseIndex: 0,
    };
    renderActiveWorkout();
}

/** @type {number | null} */
let currentSetStartTime = null;

function renderActiveWorkout() {
    if (!activeWorkout) return alert("No active workout");

    const currentExercise =
        activeWorkout.exercises[activeWorkout.currentExerciseIndex];
    if (!currentExercise)
        return alert(
            `Invalid index ${activeWorkout.currentExerciseIndex}. ${activeWorkout.exercises.length} exercises available`
        );

    // Update exercise title and progress
    elements.exerciseTitle.textContent = currentExercise.exercise.name;

    const setRange = formatRange(currentExercise.exercise.sets);
    elements.exerciseProgress.textContent = `Set ${
        currentExercise.completedSets.length + 1
    } of ${setRange}`;

    // Update exercise info
    elements.exerciseTargetReps.textContent = `Target: ${formatRange(
        currentExercise.exercise.reps
    )} reps`;

    if (currentExercise.exercise.notes) {
        elements.exerciseNotes.innerHTML = `ℹ <span>${currentExercise.exercise.notes}</span>`;
        elements.exerciseNotes.classList.remove("hidden");
    } else {
        elements.exerciseNotes.classList.add("hidden");
    }

    // Reset form and buttons
    // Store the current weight before resetting
    const currentWeight = elements.exerciseWeightInput.value;
    elements.exerciseForm.reset();

    // Restore the weight value after reset
    elements.exerciseWeightInput.value = currentWeight;
    elements.exerciseRepsInput.value =
        currentExercise.exercise.reps.min.toString();

    elements.exerciseStartButton.disabled = false;
    elements.exerciseCompleteButton.disabled = true;

    // Update completed sets
    elements.exerciseSetsList.innerHTML = "";

    currentExercise.completedSets.forEach((set, index) => {
        const li = document.createElement("li");
        li.className = "set-item";
        const duration = ((set.endTime - set.startTime) / 1000).toFixed(1);
        li.textContent = `Set ${index + 1}: ${set.reps} reps @ ${
            set.weight
        }kg (${duration}s)`;
        elements.exerciseSetsList.appendChild(li);
    });

    // Update navigation buttons
    elements.exercisePrevButton.disabled =
        activeWorkout.currentExerciseIndex === 0;
    elements.exerciseNextButton.disabled =
        activeWorkout.currentExerciseIndex ===
        activeWorkout.exercises.length - 1;
}

function handleStartSet() {
    currentSetStartTime = Date.now();
    elements.exerciseStartButton.disabled = true;
    elements.exerciseCompleteButton.disabled = false;
}

/**
 * @param {SubmitEvent} event
 */
function handleSetCompletion(event) {
    event.preventDefault();

    assertDefined(activeWorkout, "activeWorkout");
    assertDefined(currentSetStartTime, "currentSetStartTime");

    const currentExercise =
        activeWorkout.exercises[activeWorkout.currentExerciseIndex];
    assertDefined(currentExercise, "currentExercise");

    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const repsInput = form.querySelector("#reps-completed");
    assertDefined(repsInput, "repsInput");
    if (!(repsInput instanceof HTMLInputElement)) return;

    const weightInput = form.querySelector("#weight-used");
    assertDefined(weightInput, "weightInput");
    if (!(weightInput instanceof HTMLInputElement)) return;

    const reps = parseInt(repsInput.value);
    const weight = parseFloat(weightInput.value);
    const endTime = Date.now();

    currentExercise.completedSets.push({
        reps,
        weight,
        startTime: currentSetStartTime,
        endTime,
    });

    currentSetStartTime = null;
    renderActiveWorkout();
}

/**
 * @param {number} direction
 */
function navigateExercise(direction) {
    if (!activeWorkout) return;
    const newIndex = activeWorkout.currentExerciseIndex + direction;
    if (newIndex >= 0 && newIndex < activeWorkout.exercises.length) {
        activeWorkout.currentExerciseIndex = newIndex;
        renderActiveWorkout();
    }
}

/**
 * @param {import("./data/workout.js").Workout[]} workouts
 */
function showExerciseView(workouts) {
    const dayOfWeek = new Date().toLocaleDateString("en-US", {
        weekday: "long",
    });
    const lowerDayOfWeek = dayOfWeek.toLowerCase();
    if (!isValidDay(lowerDayOfWeek)) {
        throw new Error(`Invalid day: ${lowerDayOfWeek}`);
    }

    const workout = workouts.find((w) => w.name === weeklyPlan[lowerDayOfWeek]);
    if (!workout) {
        elements.exerciseErrorState.classList.remove("hidden");
        return;
    }

    elements.exerciseHeaderTitle.textContent = `${dayOfWeek}'s Workout`;
    elements.exerciseWorkoutName.textContent = workout.name;
    elements.exerciseErrorState.classList.add("hidden");

    // Show pre-workout view with workout details
    elements.exercisePreWorkoutView.classList.remove("hidden");
    elements.exerciseActiveView.classList.add("hidden");

    // Populate workout preview
    elements.exerciseWorkoutPreview.innerHTML = "";
    elements.exerciseWorkoutPreview.appendChild(createWorkoutSection(workout));
}

// Event listeners setup
/** @type {() => void} */
function setupEventListeners() {
    elements.menuToggle.addEventListener("click", toggleMenu);

    elements.navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (utils.isMobileMenuVisible()) {
                toggleMenu();
            }
        });
    });

    elements.backButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = ROUTES.WEEKLY_PLAN;
    });

    // Listen for route changes
    window.addEventListener("hashchange", () => {
        const hash = window.location.hash.substring(1) || DEFAULT_VIEW;
        showView(hash);
    });

    // Bind start workout buttons
    elements.exerciseStartWorkoutButtons.forEach((button) => {
        button.addEventListener("click", () => {
            elements.exercisePreWorkoutView.classList.add("hidden");
            elements.exerciseActiveView.classList.remove("hidden");

            // Get current workout
            const dayOfWeek = new Date().toLocaleDateString("en-US", {
                weekday: "long",
            });
            const lowerDayOfWeek =
                /** @type {keyof import("./components/weekly-plan/weekly-plan.js").WeeklyPlan} */ (
                    dayOfWeek.toLowerCase()
                );
            assertDefined(workoutsCache, "workoutsCache");
            const workout = workoutsCache.find(
                (w) => w.name === weeklyPlan[lowerDayOfWeek]
            );
            assertDefined(workout, "workout");

            initializeWorkout(workout);
        });
    });

    // Bind active workout form and navigation
    elements.exerciseForm.addEventListener("submit", handleSetCompletion);
    elements.exerciseStartButton.addEventListener("click", handleStartSet);
    elements.exercisePrevButton.addEventListener("click", () =>
        navigateExercise(-1)
    );
    elements.exerciseNextButton.addEventListener("click", () =>
        navigateExercise(1)
    );
}

// Fetch workouts data
/** @type {() => Promise<import("./data/workout.js").Workout[]>} */
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

/** @type {(workouts: import("./data/workout.js").Workout[]) => void} */
function renderWorkouts(workouts) {
    const root = createRoot(elements.workoutsContainer);
    root.render(JsxRuntime.jsx(Workouts, { workouts }));
}

// Initialize the app
/** @type {() => Promise<void>} */
async function initializeApp() {
    try {
        // Fetch and cache workouts first
        workoutsCache = await fetchWorkouts();

        // Render initial views
        renderWorkouts(workoutsCache);
        setupEventListeners();
        populateWeeklyView();

        // Show initial view based on current URL
        const hash = window.location.hash.substring(1) || DEFAULT_VIEW;
        if (!window.location.hash) {
            window.location.hash = ROUTES.WEEKLY_PLAN;
        } else {
            showView(hash);
        }
    } catch (error) {
        console.error("Failed to initialize app:", error);
    }
}

// Start the app
initializeApp();

// UTILS

/** @type {<T>(value: T | null | undefined, name?: string) => asserts value is T} */
function assertDefined(value, name) {
    if (value === undefined || value === null) {
        throw new Error(`${name || "Value"} is not defined`);
    }
}

/**
 * @param {import("./data/workout.js").Workout} workout
 * @returns {HTMLElement}
 */
function createWorkoutSection(workout) {
    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(JsxRuntime.jsx(WorkoutSection, { workout }));
    return container;
}

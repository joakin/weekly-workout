// @ts-check

/**
 * @typedef {'workouts' | 'weekly-plan' | 'exercise'} ViewType
 */

/**
 * @typedef {{min: number, max?: number}} NumberRange
 */

/**
 * @typedef {Object} Exercise
 * @property {string} name
 * @property {NumberRange} sets
 * @property {NumberRange} reps
 * @property {string} [notes]
 * @property {Exercise} [superset]
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
 * @property {Exercise} exercise
 * @property {PerformedSet[]} completedSets
 */

/**
 * @typedef {Object} WorkoutProgress
 * @property {number} startTime
 * @property {number} endTime
 * @property {Workout} workout
 * @property {ExerciseProgress[]} exercises
 * @property {number} currentExerciseIndex
 */

/**
 * @typedef {Object} Workout
 * @property {string} name
 * @property {Exercise[]} exercises
 */

/**
 * @typedef {{[K in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: string | null}} WeeklyPlan */

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
 * @property {NodeListOf<HTMLElement>} dayCards
 * @property {HTMLElement} dayWorkoutView
 * @property {HTMLElement} backButton
 * @property {HTMLElement} workoutContainer
 * @property {HTMLElement} daysGrid
 * @property {HTMLElement} workoutsContainer
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
/** @type {Workout[] | null} */
let workoutsCache = null;

/** @type {WorkoutProgress | null} */
let activeWorkout = null;

/** @type {WeeklyPlan} */
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
const daysGrid = /** @type {HTMLElement} */ (
    document.querySelector(".days-grid")
);
const workoutsContainer = /** @type {HTMLElement} */ (
    document.querySelector(".workouts-grid")
);

if (
    !menuToggle ||
    !navMenu ||
    !dayWorkoutView ||
    !backButton ||
    !workoutContainer ||
    !daysGrid ||
    !workoutsContainer
) {
    throw new Error("Required DOM elements not found");
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
    dayCards: /** @type {NodeListOf<HTMLElement>} */ (
        document.querySelectorAll(".day-card")
    ),
    dayWorkoutView,
    backButton,
    workoutContainer,
    daysGrid,
    workoutsContainer,
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
/** @type {(day: string) => day is keyof WeeklyPlan} */
function isValidDay(day) {
    return day in weeklyPlan;
}

/** @type {(day: keyof WeeklyPlan, workouts: Workout[]) => void} */
function showDayWorkout(day, workouts) {
    const workoutName = weeklyPlan[day];
    if (!workoutName) return;

    utils.toggleVisibility(elements.daysGrid, false);
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
    utils.toggleVisibility(elements.daysGrid, true);
    elements.dayWorkoutView.classList.add("hidden");
}

/** @type {(workoutName: string, workouts: Workout[]) => void} */
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
    const template = /** @type {HTMLTemplateElement | null} */ (
        document.getElementById("day-card-template")
    );
    if (!template) return;

    const daysGrid = elements.daysGrid;

    Object.entries(weeklyPlan).forEach(([day, workout]) => {
        const content = template.content.cloneNode(true);
        const card = /** @type {HTMLElement | null} */ (
            content instanceof DocumentFragment
                ? content.querySelector(".day-card")
                : null
        );
        if (!card) return;

        card.dataset["day"] = day;
        if (!workout) card.classList.add("rest");

        const title = card.querySelector("h2");
        const text = card.querySelector("p");

        if (title && text) {
            utils.setElementText(
                /** @type {HTMLElement} */ (title),
                utils.capitalizeFirstLetter(day)
            );
            utils.setElementText(
                /** @type {HTMLElement} */ (text),
                workout || "Rest Day"
            );
        }

        if (workout) {
            card.addEventListener("click", () => {
                window.location.hash = `#${ROUTES.WEEKLY_DAY(day)}`;
            });
        }

        daysGrid.appendChild(card);
    });
}

/**
 * @param {Workout} workout
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

function bindActiveWorkoutEvents() {
    const exerciseView = document.getElementById("exercise");
    assertDefined(exerciseView, "exerciseView");

    // Bind form submission
    const form = exerciseView.querySelector(".set-completion-form");
    assertDefined(form, "form");
    if (form instanceof HTMLFormElement) {
        form.addEventListener("submit", handleSetCompletion);
    }

    // Bind start button
    const startButton = exerciseView.querySelector("#start-set");
    assertDefined(startButton, "startButton");
    if (startButton instanceof HTMLButtonElement) {
        startButton.addEventListener("click", handleStartSet);
    }

    // Bind navigation buttons
    const prevButton = exerciseView.querySelector(".prev-exercise");
    const nextButton = exerciseView.querySelector(".next-exercise");
    assertDefined(prevButton, "prevButton");
    assertDefined(nextButton, "nextButton");

    if (prevButton instanceof HTMLButtonElement) {
        prevButton.addEventListener("click", () => navigateExercise(-1));
    }

    if (nextButton instanceof HTMLButtonElement) {
        nextButton.addEventListener("click", () => navigateExercise(1));
    }
}

function renderActiveWorkout() {
    if (!activeWorkout) return alert("No active workout");

    const currentExercise =
        activeWorkout.exercises[activeWorkout.currentExerciseIndex];
    if (!currentExercise)
        return alert(
            `Invalid index ${activeWorkout.currentExerciseIndex}. ${activeWorkout.exercises.length} exercises available`
        );

    const exerciseView = document.getElementById("exercise");
    assertDefined(exerciseView, "exerciseView");

    // Update exercise title and progress
    const title = exerciseView.querySelector(".active-exercise-title");
    assertDefined(title, "title");
    title.textContent = currentExercise.exercise.name;

    const progress = exerciseView.querySelector(".exercise-progress");
    assertDefined(progress, "progress");
    const setRange = formatRange(currentExercise.exercise.sets);
    progress.textContent = `Set ${
        currentExercise.completedSets.length + 1
    } of ${setRange}`;

    // Update exercise info
    const targetReps = exerciseView.querySelector(".target-reps");
    assertDefined(targetReps, "targetReps");
    targetReps.textContent = `Target: ${formatRange(
        currentExercise.exercise.reps
    )} reps`;

    const notes = exerciseView.querySelector(".active-exercise-notes");
    assertDefined(notes, "notes");
    if (!(notes instanceof HTMLElement)) return;

    if (currentExercise.exercise.notes) {
        notes.innerHTML = `ℹ <span>${currentExercise.exercise.notes}</span>`;
        notes.classList.remove("hidden");
    } else {
        notes.classList.add("hidden");
    }

    // Reset form and buttons
    const form = exerciseView.querySelector(".set-completion-form");
    assertDefined(form, "form");
    if (!(form instanceof HTMLFormElement)) return;

    // Store the current weight before resetting
    const weightInput = form.querySelector("#weight-used");
    assertDefined(weightInput, "weightInput");
    const currentWeight =
        weightInput instanceof HTMLInputElement ? weightInput.value : "";

    form.reset();

    // Restore the weight value after reset
    if (weightInput instanceof HTMLInputElement) {
        weightInput.value = currentWeight;
    }

    const repsInput = form.querySelector("#reps-completed");
    assertDefined(repsInput, "repsInput");
    if (repsInput instanceof HTMLInputElement) {
        repsInput.value = currentExercise.exercise.reps.min.toString();
    }

    const startButton = form.querySelector("#start-set");
    const completeButton = form.querySelector("#complete-set");
    assertDefined(startButton, "startButton");
    assertDefined(completeButton, "completeButton");
    if (
        !(startButton instanceof HTMLButtonElement) ||
        !(completeButton instanceof HTMLButtonElement)
    )
        return;

    startButton.disabled = false;
    completeButton.disabled = true;

    // Update completed sets
    const setsList = exerciseView.querySelector(".sets-list");
    assertDefined(setsList, "setsList");
    setsList.innerHTML = "";

    currentExercise.completedSets.forEach((set, index) => {
        const li = document.createElement("li");
        li.className = "set-item";
        const duration = ((set.endTime - set.startTime) / 1000).toFixed(1);
        li.textContent = `Set ${index + 1}: ${set.reps} reps @ ${
            set.weight
        }kg (${duration}s)`;
        setsList.appendChild(li);
    });

    // Update navigation buttons
    const prevButton = exerciseView.querySelector(".prev-exercise");
    assertDefined(prevButton, "prevButton");
    const nextButton = exerciseView.querySelector(".next-exercise");
    assertDefined(nextButton, "nextButton");

    if (prevButton instanceof HTMLButtonElement) {
        prevButton.disabled = activeWorkout.currentExerciseIndex === 0;
    }

    if (nextButton instanceof HTMLButtonElement) {
        nextButton.disabled =
            activeWorkout.currentExerciseIndex ===
            activeWorkout.exercises.length - 1;
    }
}

function handleStartSet() {
    const exerciseView = document.getElementById("exercise");
    assertDefined(exerciseView, "exerciseView");

    const startButton = exerciseView.querySelector("#start-set");
    const completeButton = exerciseView.querySelector("#complete-set");
    assertDefined(startButton, "startButton");
    assertDefined(completeButton, "completeButton");
    if (
        !(startButton instanceof HTMLButtonElement) ||
        !(completeButton instanceof HTMLButtonElement)
    )
        return;

    currentSetStartTime = Date.now();
    startButton.disabled = true;
    completeButton.disabled = false;
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
 * @param {Workout[]} workouts
 */
function showExerciseView(workouts) {
    const dayOfWeek = new Date().toLocaleDateString("en-US", {
        weekday: "long",
    });
    const lowerDayOfWeek = /** @type {keyof WeeklyPlan} */ (
        dayOfWeek.toLowerCase()
    );

    const workout = workouts.find((w) => w.name === weeklyPlan[lowerDayOfWeek]);
    if (!workout) {
        const errorState = document.querySelector(".error-state");
        assertDefined(errorState, "errorState");
        errorState.classList.remove("hidden");
        return;
    }

    const exerciseView = document.getElementById("exercise");
    assertDefined(exerciseView, "exerciseView");

    const headerTitle = exerciseView.querySelector(".today-header h2");
    assertDefined(headerTitle, "headerTitle");
    headerTitle.textContent = `${dayOfWeek}'s Workout`;

    const workoutName = exerciseView.querySelector(".workout-name");
    assertDefined(workoutName, "workoutName");
    workoutName.textContent = workout.name;

    const errorState = exerciseView.querySelector(".error-state");
    assertDefined(errorState, "errorState");
    errorState.classList.add("hidden");

    // Show pre-workout view with workout details
    const preWorkoutView = exerciseView.querySelector(".pre-workout-view");
    const activeExerciseView = exerciseView.querySelector(
        ".exercise-container"
    );
    assertDefined(preWorkoutView, "preWorkoutView");
    assertDefined(activeExerciseView, "activeExerciseView");

    preWorkoutView.classList.remove("hidden");
    activeExerciseView.classList.add("hidden");

    // Populate workout preview
    const workoutPreview = preWorkoutView.querySelector(".workout-preview");
    assertDefined(workoutPreview, "workoutPreview");
    workoutPreview.innerHTML = "";
    workoutPreview.appendChild(createWorkoutSection(workout));
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

    // Bind exercise view event listeners
    const exerciseView = document.getElementById("exercise");
    assertDefined(exerciseView, "exerciseView");

    // Bind start workout buttons
    const startButtons = exerciseView.querySelectorAll(".start-workout-button");
    startButtons.forEach((button) => {
        if (button instanceof HTMLButtonElement) {
            button.addEventListener("click", () => {
                const preWorkoutView =
                    exerciseView.querySelector(".pre-workout-view");
                const activeExerciseView = exerciseView.querySelector(
                    ".exercise-container"
                );
                assertDefined(preWorkoutView, "preWorkoutView");
                assertDefined(activeExerciseView, "activeExerciseView");

                preWorkoutView.classList.add("hidden");
                activeExerciseView.classList.remove("hidden");

                // Get current workout
                const dayOfWeek = new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                });
                const lowerDayOfWeek = /** @type {keyof WeeklyPlan} */ (
                    dayOfWeek.toLowerCase()
                );
                assertDefined(workoutsCache, "workoutsCache");
                const workout = workoutsCache.find(
                    (w) => w.name === weeklyPlan[lowerDayOfWeek]
                );
                assertDefined(workout, "workout");

                initializeWorkout(workout);
            });
        }
    });

    // Bind active workout form and navigation
    const form = exerciseView.querySelector(".set-completion-form");
    assertDefined(form, "form");
    if (form instanceof HTMLFormElement) {
        form.addEventListener("submit", handleSetCompletion);
    }

    const startButton = exerciseView.querySelector("#start-set");
    assertDefined(startButton, "startButton");
    if (startButton instanceof HTMLButtonElement) {
        startButton.addEventListener("click", handleStartSet);
    }

    const prevButton = exerciseView.querySelector(".prev-exercise");
    const nextButton = exerciseView.querySelector(".next-exercise");
    assertDefined(prevButton, "prevButton");
    assertDefined(nextButton, "nextButton");

    if (prevButton instanceof HTMLButtonElement) {
        prevButton.addEventListener("click", () => navigateExercise(-1));
    }

    if (nextButton instanceof HTMLButtonElement) {
        nextButton.addEventListener("click", () => navigateExercise(1));
    }
}

// Fetch workouts data
/** @type {() => Promise<Workout[]>} */
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

/** @type {(exercise: Exercise, isSuperset?: boolean) => HTMLElement} */
function createExerciseElement(exercise, isSuperset = false) {
    const li = utils.createElementWithClass(
        "li",
        `exercise-item${isSuperset ? " superset" : ""}`
    );
    const nameDiv = utils.createElementWithClass("div", "exercise-name");
    const setsDiv = utils.createElementWithClass("div", "exercise-sets");

    utils.setElementText(
        nameDiv,
        isSuperset ? `Superset: ${exercise.name}` : exercise.name
    );
    utils.setElementText(
        setsDiv,
        `${formatRange(exercise.sets)} sets × ${formatRange(exercise.reps)}`
    );

    li.append(nameDiv, setsDiv);

    if (exercise.notes) {
        const notesDiv = utils.createElementWithClass("div", "exercise-notes");
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

/** @type {(range: NumberRange) => string} */
function formatRange(range) {
    return range.max ? `${range.min}-${range.max}` : `${range.min}`;
}

/** @type {(workout: Workout) => HTMLElement} */
function createWorkoutSection(workout) {
    const section = utils.createElementWithClass("section", "workout-section");
    const title = utils.createElementWithClass("h2");
    const exerciseList = utils.createElementWithClass("ul", "exercise-list");

    utils.setElementText(title, workout.name);
    workout.exercises.forEach((exercise) => {
        exerciseList.appendChild(createExerciseElement(exercise));
    });

    section.append(title, exerciseList);
    return section;
}

/** @type {(workouts: Workout[]) => void} */
function renderWorkouts(workouts) {
    elements.workoutsContainer.innerHTML = "";
    try {
        workouts.forEach((workout) => {
            elements.workoutsContainer.appendChild(
                createWorkoutSection(workout)
            );
        });
    } catch (error) {
        console.error("Failed to render workouts:", error);
        elements.workoutsContainer.innerHTML =
            "<p>Failed to load workouts. Please try refreshing the page.</p>";
    }
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

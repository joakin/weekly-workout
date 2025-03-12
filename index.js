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
    assertDefined(workoutsCache);

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

/** @type {(workouts: Workout[]) => void} */
function showExerciseView(workouts) {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });

    // Type guard to ensure dayOfWeek is a valid day
    const lowerDayOfWeek = dayOfWeek.toLowerCase();
    if (!isValidDay(lowerDayOfWeek)) {
        console.error(`Invalid day of week: ${lowerDayOfWeek}`);
        return;
    }

    const workoutName = weeklyPlan[lowerDayOfWeek];
    const workout = workouts.find((w) => w.name === workoutName);

    const exerciseView = document.getElementById(VIEWS.EXERCISE);
    if (!exerciseView) return;

    const headerTitle = exerciseView.querySelector(".today-header h2");
    const workoutNameElement = exerciseView.querySelector(".workout-name");
    const exerciseContainer = exerciseView.querySelector(".exercise-container");
    const errorState = exerciseView.querySelector(".error-state");

    if (
        !headerTitle ||
        !workoutNameElement ||
        !exerciseContainer ||
        !errorState
    )
        return;

    headerTitle.textContent = `${dayOfWeek}'s Workout`;

    if (workout) {
        workoutNameElement.textContent = workout.name;
        errorState.classList.add("hidden");
        exerciseContainer.classList.remove("hidden");
        exerciseContainer.innerHTML = "";
        exerciseContainer.appendChild(createWorkoutSection(workout));
    } else {
        workoutNameElement.textContent = "Rest Day";
        errorState.classList.remove("hidden");
        exerciseContainer.classList.add("hidden");
    }
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

/** @type {<T>(value: T | null | undefined) => asserts value is T} */
function assertDefined(value) {
    if (value === undefined || value === null) {
        throw new Error("Value is undefined or null");
    }
}

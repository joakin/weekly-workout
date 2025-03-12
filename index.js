// @ts-check

/**
 * @typedef {'workouts' | 'weekly-plan'} ViewType
 */

/**
 * @typedef {Object} Exercise
 * @property {string} name
 * @property {number} sets
 * @property {number} reps
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
/** @type {Record<'WORKOUTS' | 'WEEKLY_PLAN', ViewType>} */
const VIEWS = {
    WORKOUTS: 'workouts',
    WEEKLY_PLAN: 'weekly-plan'
};

/** @type {ViewType} */
const DEFAULT_VIEW = VIEWS.WEEKLY_PLAN;

/** @type {Routes} */
const ROUTES = {
    WEEKLY_PLAN: `/${VIEWS.WEEKLY_PLAN}`,
    WORKOUTS: `/${VIEWS.WORKOUTS}`,
    WEEKLY_DAY: (day) => `/${VIEWS.WEEKLY_PLAN}/${day}`
};

// Cache
/** @type {Workout[] | null} */
let workoutsCache = null;

/** @type {WeeklyPlan} */
const weeklyPlan = {
    monday: 'Push 1',
    tuesday: 'Pull 1',
    wednesday: 'Legs',
    thursday: 'Push 2',
    friday: 'Pull 2',
    saturday: null,
    sunday: null
};

// Ensure all DOM elements exist before creating the elements object
const menuToggle = /** @type {HTMLElement} */ (document.getElementById('menu-toggle'));
const navMenu = /** @type {HTMLElement} */ (document.getElementById('nav-menu'));
const dayWorkoutView = /** @type {HTMLElement} */ (document.getElementById('day-workout'));
const backButton = /** @type {HTMLElement} */ (document.querySelector('.back-button'));
const workoutContainer = /** @type {HTMLElement} */ (document.querySelector('.workout-container'));
const daysGrid = /** @type {HTMLElement} */ (document.querySelector('.days-grid'));
const workoutsContainer = /** @type {HTMLElement} */ (document.querySelector('.workouts-grid'));

if (!menuToggle || !navMenu || !dayWorkoutView || !backButton || 
    !workoutContainer || !daysGrid || !workoutsContainer) {
    throw new Error('Required DOM elements not found');
}

/** @type {DOMElements} */
const elements = {
    menuToggle,
    navMenu,
    navLinks: /** @type {NodeListOf<HTMLAnchorElement>} */ (document.querySelectorAll('.nav-link')),
    views: /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.view')),
    dayCards: /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.day-card')),
    dayWorkoutView,
    backButton,
    workoutContainer,
    daysGrid,
    workoutsContainer
};

// Utility functions
const utils = {
    /** @type {(string: string) => string} */
    capitalizeFirstLetter: (string) => string.charAt(0).toUpperCase() + string.slice(1),
    
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
        element.style.display = show ? (element.dataset['defaultDisplay'] || 'block') : 'none';
    },

    /** @type {() => boolean} */
    isMobileMenuVisible: () => {
        return window.getComputedStyle(elements.menuToggle).display !== 'none';
    }
};

// Navigation handling
/** @type {(path: string) => void} */
function showView(path) {
    // Remove leading slash if present
    path = path.startsWith('/') ? path.substring(1) : path;
    const [section, param] = path.split('/');
    
    if (section === VIEWS.WEEKLY_PLAN && param) {
        // Type guard to ensure param is a valid day
        if (isValidDay(param) && weeklyPlan[param]) {
            showDayWorkout(param);
            return;
        } else {
            console.error(`Invalid day: ${param}`);
        }
    }

    elements.views.forEach(view => view.classList.remove('active'));
    
    // Map route to view ID
    const viewId = section === VIEWS.WORKOUTS ? VIEWS.WORKOUTS : 
                  section === VIEWS.WEEKLY_PLAN ? VIEWS.WEEKLY_PLAN : 
                  DEFAULT_VIEW;
                  
    const viewElement = document.getElementById(viewId);
    if (viewElement) {
        viewElement.classList.add('active');
    } else {
        console.error(`Could not find view: ${viewId}`);
    }

    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href) {
            const linkPath = href.substring(2); // Remove #/ prefix
            const linkSection = linkPath.split('/')[0];
            if (linkSection === section) {
                link.classList.add('active');
            }
        }
    });

    if (viewId === VIEWS.WEEKLY_PLAN) {
        showWeekView();
    }
}

/** @type {() => void} */
function toggleMenu() {
    elements.menuToggle.classList.toggle('active');
    elements.navMenu.classList.toggle('active');
}

// Weekly plan handling
/** @type {(day: string) => day is keyof WeeklyPlan} */
function isValidDay(day) {
    return day in weeklyPlan;
}

/** @type {(day: keyof WeeklyPlan) => void} */
function showDayWorkout(day) {
    const workoutName = weeklyPlan[day];
    if (!workoutName) return;

    utils.toggleVisibility(elements.daysGrid, false);
    elements.dayWorkoutView.classList.remove('hidden');

    const dayTitle = /** @type {HTMLElement | null} */ (elements.dayWorkoutView.querySelector('.day-title h2'));
    const workoutType = /** @type {HTMLElement | null} */ (elements.dayWorkoutView.querySelector('.day-title p'));
    if (dayTitle && workoutType) {
        utils.setElementText(dayTitle, utils.capitalizeFirstLetter(day));
        utils.setElementText(workoutType, workoutName);
    }

    if (workoutsCache) {
        loadWorkout(workoutName, workoutsCache);
    }
}

/** @type {() => void} */
function showWeekView() {
    utils.toggleVisibility(elements.daysGrid, true);
    elements.dayWorkoutView.classList.add('hidden');
}

/** @type {(workoutName: string, workouts: Workout[]) => void} */
function loadWorkout(workoutName, workouts) {
    const workout = workouts.find(w => w.name === workoutName);
    if (workout) {
        elements.workoutContainer.innerHTML = '';
        elements.workoutContainer.appendChild(createWorkoutSection(workout));
    } else {
        elements.workoutContainer.innerHTML = '<p>Workout not found.</p>';
    }
}

/** @type {() => void} */
function populateWeeklyView() {
    const template = /** @type {HTMLTemplateElement | null} */ (document.getElementById('day-card-template'));
    if (!template) return;
    
    const daysGrid = elements.daysGrid;
    
    Object.entries(weeklyPlan).forEach(([day, workout]) => {
        const content = template.content.cloneNode(true);
        const card = /** @type {HTMLElement | null} */ (content instanceof DocumentFragment ? content.querySelector('.day-card') : null);
        if (!card) return;
        
        card.dataset['day'] = day;
        if (!workout) card.classList.add('rest');
        
        const title = card.querySelector('h2');
        const text = card.querySelector('p');
        
        if (title && text) {
            utils.setElementText(/** @type {HTMLElement} */ (title), utils.capitalizeFirstLetter(day));
            utils.setElementText(/** @type {HTMLElement} */ (text), workout || 'Rest Day');
        }
        
        if (workout) {
            card.addEventListener('click', () => {
                window.location.hash = `#${ROUTES.WEEKLY_DAY(day)}`;
            });
        }
        
        daysGrid.appendChild(card);
    });
}

// Event listeners setup
/** @type {() => void} */
function setupEventListeners() {
    elements.menuToggle.addEventListener('click', toggleMenu);

    elements.navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (utils.isMobileMenuVisible()) {
                toggleMenu();
            }
        });
    });

    elements.backButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = ROUTES.WEEKLY_PLAN;
    });

    // Listen for route changes
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1) || DEFAULT_VIEW;
        showView(hash);
    });
}

// Fetch workouts data
/** @type {() => Promise<Workout[]>} */
async function fetchWorkouts() {
    try {
        const response = await fetch('workouts.json');
        if (!response.ok) throw new Error('Failed to fetch workouts');
        const data = await response.json();
        return data.workouts;
    } catch (error) {
        console.error('Error fetching workouts:', error);
        throw error;
    }
}

/** @type {(exercise: Exercise, isSuperset?: boolean) => HTMLElement} */
function createExerciseElement(exercise, isSuperset = false) {
    const li = utils.createElementWithClass('li', `exercise-item${isSuperset ? ' superset' : ''}`);
    const nameDiv = utils.createElementWithClass('div', 'exercise-name');
    const setsDiv = utils.createElementWithClass('div', 'exercise-sets');

    utils.setElementText(nameDiv, isSuperset ? `Superset: ${exercise.name}` : exercise.name);
    utils.setElementText(setsDiv, `${exercise.sets} sets × ${exercise.reps}`);

    li.append(nameDiv, setsDiv);

    if (exercise.notes) {
        const notesDiv = utils.createElementWithClass('div', 'exercise-notes');
        notesDiv.innerHTML = `${isSuperset ? '★' : 'ℹ'} <span>${exercise.notes}</span>`;
        li.appendChild(notesDiv);
    }

    if (exercise.superset) {
        li.appendChild(createExerciseElement(exercise.superset, true));
    }

    return li;
}

/** @type {(workout: Workout) => HTMLElement} */
function createWorkoutSection(workout) {
    const section = utils.createElementWithClass('section', 'workout-section');
    const title = utils.createElementWithClass('h2');
    const exerciseList = utils.createElementWithClass('ul', 'exercise-list');

    utils.setElementText(title, workout.name);
    workout.exercises.forEach(exercise => {
        exerciseList.appendChild(createExerciseElement(exercise));
    });

    section.append(title, exerciseList);
    return section;
}

/** @type {(workouts: Workout[]) => void} */
function renderWorkouts(workouts) {
    elements.workoutsContainer.innerHTML = '';
    try {
        workouts.forEach(workout => {
            elements.workoutsContainer.appendChild(createWorkoutSection(workout));
        });
    } catch (error) {
        console.error('Failed to render workouts:', error);
        elements.workoutsContainer.innerHTML = '<p>Failed to load workouts. Please try refreshing the page.</p>';
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
        console.error('Failed to initialize app:', error);
    }
}

// Start the app
initializeApp(); 
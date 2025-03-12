// Constants
const VIEWS = {
    WORKOUTS: 'workouts',
    WEEKLY_PLAN: 'weekly-plan'
};
const DEFAULT_VIEW = VIEWS.WEEKLY_PLAN;

const ROUTES = {
    WEEKLY_PLAN: `/${VIEWS.WEEKLY_PLAN}`,
    WORKOUTS: `/${VIEWS.WORKOUTS}`,
    WEEKLY_DAY: (day) => `/${VIEWS.WEEKLY_PLAN}/${day}`
};

// Cache
let workoutsCache = null;

// Weekly plan data
const weeklyPlan = {
    monday: 'Push 1',
    tuesday: 'Pull 1',
    wednesday: 'Legs',
    thursday: 'Push 2',
    friday: 'Pull 2',
    saturday: null,
    sunday: null
};

// Cache DOM elements
const elements = {
    menuToggle: document.getElementById('menu-toggle'),
    navMenu: document.getElementById('nav-menu'),
    navLinks: document.querySelectorAll('.nav-link'),
    views: document.querySelectorAll('.view'),
    dayCards: document.querySelectorAll('.day-card'),
    dayWorkoutView: document.getElementById('day-workout'),
    backButton: document.querySelector('.back-button'),
    workoutContainer: document.querySelector('.workout-container'),
    daysGrid: document.querySelector('.days-grid'),
    workoutsContainer: document.querySelector('.workouts-grid')
};

// Utility functions
const utils = {
    capitalizeFirstLetter: (string) => string.charAt(0).toUpperCase() + string.slice(1),
    
    createElementWithClass: (tag, className) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        return element;
    },
    
    setElementText: (element, text) => {
        element.textContent = text;
    },
    
    toggleVisibility: (element, show) => {
        element.style.display = show ? (element.dataset.defaultDisplay || 'block') : 'none';
    },

    isMobileMenuVisible: () => {
        return window.getComputedStyle(elements.menuToggle).display !== 'none';
    }
};

// Navigation handling
function showView(path) {
    // Remove leading slash if present
    path = path.startsWith('/') ? path.substring(1) : path;
    const [section, param] = path.split('/');
    
    if (section === VIEWS.WEEKLY_PLAN && param) {
        if (weeklyPlan[param]) {
            showDayWorkout(param);
            return;
        }
    }

    elements.views.forEach(view => view.classList.remove('active'));
    
    // Map route to view ID
    const viewId = section === VIEWS.WORKOUTS ? VIEWS.WORKOUTS : 
                  section === VIEWS.WEEKLY_PLAN ? VIEWS.WEEKLY_PLAN : 
                  DEFAULT_VIEW;
                  
    document.getElementById(viewId).classList.add('active');

    // Update active state of nav links based on section
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href').substring(2); // Remove #/ prefix
        const linkSection = linkPath.split('/')[0];
        if (linkSection === section) {
            link.classList.add('active');
        }
    });

    if (viewId === VIEWS.WEEKLY_PLAN) {
        showWeekView();
    }
}

function toggleMenu() {
    elements.menuToggle.classList.toggle('active');
    elements.navMenu.classList.toggle('active');
}

// Weekly plan handling
function showDayWorkout(day) {
    const workoutName = weeklyPlan[day];
    if (!workoutName) return;

    utils.toggleVisibility(elements.daysGrid, false);
    elements.dayWorkoutView.classList.remove('hidden');

    const dayTitle = elements.dayWorkoutView.querySelector('.day-title h2');
    const workoutType = elements.dayWorkoutView.querySelector('.day-title p');
    utils.setElementText(dayTitle, utils.capitalizeFirstLetter(day));
    utils.setElementText(workoutType, workoutName);

    loadWorkout(workoutName, workoutsCache);
}

function showWeekView() {
    utils.toggleVisibility(elements.daysGrid, true);
    elements.dayWorkoutView.classList.add('hidden');
}

function loadWorkout(workoutName, workouts) {
    const workout = workouts.find(w => w.name === workoutName);
    if (workout) {
        elements.workoutContainer.innerHTML = '';
        elements.workoutContainer.appendChild(createWorkoutSection(workout));
    } else {
        elements.workoutContainer.innerHTML = '<p>Workout not found.</p>';
    }
}

function populateWeeklyView() {
    const template = document.getElementById('day-card-template');
    const daysGrid = elements.daysGrid;
    
    Object.entries(weeklyPlan).forEach(([day, workout]) => {
        const card = template.content.cloneNode(true).querySelector('.day-card');
        card.dataset.day = day;
        if (!workout) card.classList.add('rest');
        
        const title = card.querySelector('h2');
        const text = card.querySelector('p');
        
        utils.setElementText(title, utils.capitalizeFirstLetter(day));
        utils.setElementText(text, workout || 'Rest Day');
        
        if (workout) {
            card.addEventListener('click', () => {
                window.location.hash = `#${ROUTES.WEEKLY_DAY(day)}`;
            });
        }
        
        daysGrid.appendChild(card);
    });
}

// Event listeners setup
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

function createExerciseElement(exercise) {
    const li = utils.createElementWithClass('li', 'exercise-item');
    const nameDiv = utils.createElementWithClass('div', 'exercise-name');
    const setsDiv = utils.createElementWithClass('div', 'exercise-sets');

    utils.setElementText(nameDiv, exercise.name);
    utils.setElementText(setsDiv, `${exercise.sets} sets × ${exercise.reps}`);

    li.append(nameDiv, setsDiv);

    if (exercise.notes) {
        const notesDiv = utils.createElementWithClass('div', 'exercise-notes');
        notesDiv.innerHTML = `ℹ <span>${exercise.notes}</span>`;
        li.appendChild(notesDiv);
    }

    if (exercise.superset) {
        li.appendChild(createSupersetElement(exercise.superset));
    }

    return li;
}

function createSupersetElement(superset) {
    const supersetDiv = utils.createElementWithClass('div', 'exercise-item superset');
    const nameDiv = utils.createElementWithClass('div', 'exercise-name');
    const setsDiv = utils.createElementWithClass('div', 'exercise-sets');

    utils.setElementText(nameDiv, `Superset: ${superset.name}`);
    utils.setElementText(setsDiv, `${superset.sets} sets × ${superset.reps}`);

    supersetDiv.append(nameDiv, setsDiv);

    if (superset.notes) {
        const notesDiv = utils.createElementWithClass('div', 'exercise-notes');
        notesDiv.innerHTML = `★ ${superset.notes}`;
        supersetDiv.appendChild(notesDiv);
    }

    return supersetDiv;
}

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
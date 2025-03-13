/**
 * @typedef {Object} WeeklyPlan
 * @property {string | null} monday
 * @property {string | null} tuesday
 * @property {string | null} wednesday
 * @property {string | null} thursday
 * @property {string | null} friday
 * @property {string | null} saturday
 * @property {string | null} sunday
 */

const template = /** @type {HTMLTemplateElement} */ (
    document.getElementById("weekly-plan-day-card-template")
);
if (!template) throw new Error("Weekly plan day card template not found");

/**
 * Creates a weekly plan component
 * @param {WeeklyPlan} weeklyPlan - The weekly plan data
 * @param {string} routePrefix - The route prefix for navigation
 * @returns {HTMLElement} The weekly plan component
 */
export function createWeeklyPlan(weeklyPlan, routePrefix) {
    const daysGrid = document.createElement("div");
    daysGrid.className = "weekly-plan";

    Object.entries(weeklyPlan).forEach(([day, workout]) => {
        const content = /** @type {DocumentFragment} */ (
            template.content.cloneNode(true)
        );
        const card = content.querySelector(".day-card");
        if (!card || !(card instanceof HTMLElement))
            throw new Error("Weekly plan day card template is invalid");

        card.dataset["day"] = day;
        if (!workout) card.classList.add("rest");

        const title = card.querySelector("h2");
        const text = card.querySelector("p");

        if (title && text) {
            title.textContent = day.charAt(0).toUpperCase() + day.slice(1);
            text.textContent = workout || "Rest Day";
        }

        if (workout) {
            card.addEventListener("click", () => {
                window.location.hash = `${routePrefix}/${day}`;
            });
        }

        daysGrid.appendChild(card);
    });

    return daysGrid;
}

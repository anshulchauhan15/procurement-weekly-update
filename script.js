/* =========================================================
   PROCUREMENT WEEKLY UPDATE
   Data is loaded automatically from dashboard-data.json
========================================================= */

let projects = [];
let currentProjectIndex = 0;


/* =========================================================
   LOAD DATA FROM SHAREPOINT
========================================================= */

async function loadDashboardData() {

    try {

        /*
         * dashboard-data.json should be stored in the
         * same folder as this HTML file.
         *
         * The timestamp prevents the browser from using
         * an old cached version.
         */

        const response = await fetch(
            "./dashboard-data.json?v=" + Date.now(),
            {
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Could not load dashboard-data.json. HTTP status: " +
                response.status
            );

        }


        const data = await response.json();


        /* ---------- Store projects ---------- */

        projects = data.projects || [];


        /* ---------- Global information ---------- */

        updateGlobalInformation(data);


        /* ---------- Create project tabs ---------- */

        createProjectTabs();


        /* ---------- Show first project ---------- */

        if (projects.length > 0) {

            showProject(0);

        } else {

            showNoProjectsMessage();

        }


    } catch (error) {

        console.error("Dashboard loading error:", error);

        showErrorMessage(error);

    }

}


/* =========================================================
   GLOBAL INFORMATION
========================================================= */

function updateGlobalInformation(data) {

    /*
     * These selectors support the IDs used in the
     * current webpage.
     */

    const dashboardTitle =
        document.getElementById("dashboard-title");

    const manager =
        document.getElementById("manager");

    const lastUpdated =
        document.getElementById("last-updated");


    if (dashboardTitle && data.dashboardTitle) {

        dashboardTitle.textContent =
            data.dashboardTitle;

    }


    if (manager && data.manager) {

        manager.textContent =
            data.manager;

    }


    if (lastUpdated && data.lastUpdated) {

        lastUpdated.textContent =
            data.lastUpdated;

    }

}


/* =========================================================
   CREATE PROJECT TABS
========================================================= */

function createProjectTabs() {

    /*
     * Find the existing project tab container.
     *
     * If your HTML already has .project-tab elements,
     * we use their parent container.
     */

    let tabContainer =
        document.querySelector(".project-tabs");


    if (!tabContainer) {

        const firstTab =
            document.querySelector(".project-tab");

        if (firstTab) {

            tabContainer =
                firstTab.parentElement;

        }

    }


    if (!tabContainer) {

        console.error(
            "Project tab container could not be found."
        );

        return;

    }


    /* Remove existing tabs */

    tabContainer.innerHTML = "";


    /* Create new tab for every Excel project */

    projects.forEach((project, index) => {

        const tab =
            document.createElement("button");

        tab.className = "project-tab";

        tab.textContent = project.name;


        tab.addEventListener("click", () => {

            showProject(index);

        });


        tabContainer.appendChild(tab);

    });

}


/* =========================================================
   LOAD PROJECT
========================================================= */

function showProject(index) {

    if (!projects[index]) {
        return;
    }


    currentProjectIndex = index;


    const project =
        projects[index];


    /* ---------- Project name ---------- */

    const projectName =
        document.getElementById("project-name");


    if (projectName) {

        projectName.textContent =
            project.name;

    }


    /* ---------- Stakeholders ---------- */

    const stakeholderContainer =
        document.getElementById("stakeholders");


    if (stakeholderContainer) {

        stakeholderContainer.innerHTML = "";


        const stakeholders =
            project.stakeholders || [];


        if (stakeholders.length === 0) {

            const empty =
                document.createElement("div");

            empty.className = "stakeholder";

            empty.textContent = "—";

            stakeholderContainer.appendChild(empty);

        } else {

            stakeholders.forEach(name => {

                const stakeholder =
                    document.createElement("div");

                stakeholder.className =
                    "stakeholder";

                stakeholder.textContent =
                    name;

                stakeholderContainer.appendChild(
                    stakeholder
                );

            });

        }

    }


    /* ---------- Committed Spend ---------- */

    const committedSpend =
        document.getElementById("committed-spend");


    if (committedSpend) {

        committedSpend.textContent =
            project.committedSpend || "—";

    }


    /* ---------- Remarks ---------- */

    const projectRemarks =
        document.getElementById("project-remarks");


    if (projectRemarks) {

        projectRemarks.textContent =
            project.remarks || "—";

    }


    /* ---------- Timeline ---------- */

    const timelineBody =
        document.getElementById("timeline-body");


    if (timelineBody) {

        timelineBody.innerHTML = "";


        const timeline =
            project.timeline || [];


        timeline.forEach(item => {

            const row =
                document.createElement("tr");


            /* Activity */

            const activityCell =
                document.createElement("td");

            activityCell.textContent =
                item.activity || "—";


            /* Target */

            const targetCell =
                document.createElement("td");

            targetCell.textContent =
                item.target || "—";


            /* Actual */

            const actualCell =
                document.createElement("td");

            actualCell.textContent =
                item.actual || "—";


            /* Status */

            const statusCell =
                document.createElement("td");


            const status =
                document.createElement("span");


            status.className =
                "status " +
                getStatusClass(item.status);


            status.textContent =
                item.status || "—";


            statusCell.appendChild(status);


            /* Remarks */

            const remarksCell =
                document.createElement("td");

            remarksCell.textContent =
                item.remarks || "—";


            /* Add cells to row */

            row.appendChild(activityCell);
            row.appendChild(targetCell);
            row.appendChild(actualCell);
            row.appendChild(statusCell);
            row.appendChild(remarksCell);


            timelineBody.appendChild(row);

        });


        /* No timeline data */

        if (timeline.length === 0) {

            const row =
                document.createElement("tr");


            const cell =
                document.createElement("td");


            cell.colSpan = 5;

            cell.textContent =
                "No timeline information available.";


            row.appendChild(cell);

            timelineBody.appendChild(row);

        }

    }


    /* ---------- Active tab ---------- */

    document
        .querySelectorAll(".project-tab")
        .forEach((tab, tabIndex) => {

            tab.classList.toggle(
                "active",
                tabIndex === index
            );

        });

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(status) {

    const value =
        String(status || "")
            .trim()
            .toLowerCase();


    if (value === "completed") {

        return "status-completed";

    }


    if (value === "in progress") {

        return "status-progress";

    }


    if (value === "upcoming") {

        return "status-upcoming";

    }


    if (value === "delayed") {

        return "status-delayed";

    }


    return "";

}


/* =========================================================
   ERROR MESSAGE
========================================================= */

function showErrorMessage(error) {

    const projectName =
        document.getElementById("project-name");


    if (projectName) {

        projectName.textContent =
            "Unable to load project data";

    }


    const timelineBody =
        document.getElementById("timeline-body");


    if (timelineBody) {

        timelineBody.innerHTML = "";


        const row =
            document.createElement("tr");


        const cell =
            document.createElement("td");


        cell.colSpan = 5;

        cell.textContent =
            "Please refresh the page or contact the dashboard owner.";


        row.appendChild(cell);

        timelineBody.appendChild(row);

    }


    console.error(error);

}


/* =========================================================
   NO PROJECTS MESSAGE
========================================================= */

function showNoProjectsMessage() {

    const projectName =
        document.getElementById("project-name");


    if (projectName) {

        projectName.textContent =
            "No projects available";

    }

}


/* =========================================================
   START DASHBOARD
========================================================= */

loadDashboardData();
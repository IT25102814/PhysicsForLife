async function showInstitutes() {

    const content = document.getElementById("content");

    content.innerHTML = "<p>Loading institutes...</p>";

    try {

        const response = await fetch("http://localhost:8080/api/institutes");

        if (!response.ok) {
            throw new Error("Failed to load institutes");
        }

        const institutes = await response.json();

        let html = `
            <button onclick="showDashboard()">← Dashboard</button>
            <h2>Institutes</h2>
        `;

        if (institutes.length === 0) {

            html += "<p>No institutes found.</p>";

        } else {

            html += "<div class='institute-list'>";

            institutes.forEach(institute => {

                html += `
                    <div class="institute-card">

                        <h3>${institute.name}</h3>

                        <p>
                            <strong>Institute ID:</strong>
                            ${institute.instituteId}
                        </p>

                        <button onclick="showEditInstituteForm(${institute.instituteId})">
                            Edit
                        </button>

                        <button onclick="deleteInstitute(${institute.instituteId})">
                            Delete
                        </button>

                    </div>
                `;

            });

            html += "</div>";
        }

        content.innerHTML = html;

    } catch (error) {

        console.error(error);

        content.innerHTML =
            "<p>Unable to load institutes. Make sure the Spring Boot backend is running.</p>";
    }
}


function showEditInstituteForm(instituteId) {

    const content = document.getElementById("content");

    content.innerHTML = `
        <h2>Edit Institute</h2>

        <div class="form-card">

            <label for="editInstituteName">Institute Name</label>

            <input
                type="text"
                id="editInstituteName"
                placeholder="Enter new institute name"
            >

            <button onclick="updateInstitute(${instituteId})">
                Save Changes
            </button>

            <button onclick="showInstitutes()">
                Cancel
            </button>

        </div>
    `;
}


async function updateInstitute(instituteId) {

    const name = document.getElementById("editInstituteName").value.trim();

    if (name === "") {
        alert("Please enter an institute name.");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:8080/api/institutes/${instituteId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update institute");
        }

        alert("Institute updated successfully!");

        showInstitutes();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update institute. " +
            "Make sure the Spring Boot backend is running."
        );
    }
}


async function showCurricula() {

    const content = document.getElementById("content");

    content.innerHTML = "<p>Loading curricula...</p>";

    try {

        const response = await fetch(
            "http://localhost:8080/api/curricula"
        );

        if (!response.ok) {
            throw new Error("Failed to load curricula");
        }

        const curricula = await response.json();

        let html = `
            <button onclick="showDashboard()">← Dashboard</button>
            <h2>Curricula</h2>
        `;

        if (curricula.length === 0) {

            html += "<p>No curricula found.</p>";

        } else {

            html += "<div class='curriculum-list'>";

            curricula.forEach(curriculum => {

                html += `
                    <div class="curriculum-card">

                        <h3>${curriculum.name}</h3>

                        <p>
                            <strong>Curriculum ID:</strong>
                            ${curriculum.curriculumId}
                        </p>

                        <button onclick="showEditCurriculumForm(${curriculum.curriculumId})">
                            Edit
                        </button>

                        <button onclick="deleteCurriculum(${curriculum.curriculumId})">
                            Delete
                        </button>

                    </div>
                `;

            });

            html += "</div>";
        }

        content.innerHTML = html;

    } catch (error) {

        console.error(error);

        content.innerHTML =
            "<p>Unable to load curricula. Make sure the Spring Boot backend is running.</p>";
    }
}

async function deleteCurriculum(curriculumId) {

    const confirmed = confirm(
        "Are you sure you want to delete this curriculum?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:8080/api/curricula/${curriculumId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete curriculum");
        }

        alert("Curriculum deleted successfully!");

        showCurricula();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete curriculum. " +
            "This curriculum may be used by an existing batch."
        );
    }
}

function showEditCurriculumForm(curriculumId) {

    const content = document.getElementById("content");

    content.innerHTML = `
        <h2>Edit Curriculum</h2>

        <div class="form-card">

            <label for="editCurriculumName">
                Curriculum Name
            </label>

            <input
                type="text"
                id="editCurriculumName"
                placeholder="Enter new curriculum name"
            >

            <button onclick="updateCurriculum(${curriculumId})">
                Save Changes
            </button>

            <button onclick="showCurricula()">
                Cancel
            </button>

        </div>
    `;
}

async function updateCurriculum(curriculumId) {

    const name =
        document.getElementById("editCurriculumName").value.trim();

    if (name === "") {
        alert("Please enter a curriculum name.");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:8080/api/curricula/${curriculumId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update curriculum");
        }

        alert("Curriculum updated successfully!");

        showCurricula();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update curriculum. " +
            "Make sure the Spring Boot backend is running."
        );
    }
}


async function showBatches() {

    const content = document.getElementById("content");

    content.innerHTML = "<p>Loading batches...</p>";

    try {

        const response = await fetch(
            "http://localhost:8080/api/batches"
        );

        if (!response.ok) {
            throw new Error("Failed to load batches");
        }

        const batches = await response.json();

        let html = `
            <button onclick="showDashboard()">← Dashboard</button>
            <h2>Batches</h2>
        `;

        if (batches.length === 0) {

            html += "<p>No batches found.</p>";

        } else {

            html += "<div class='batch-list'>";

            batches.forEach(batch => {

                html += `
                    <div class="batch-card">

                        <h3>${batch.batchName}</h3>

                        <p>
                            <strong>Institute:</strong>
                            ${batch.institute.name}
                        </p>

                        <p>
                            <strong>Curriculum:</strong>
                            ${batch.curriculum.name}
                        </p>

                        <p>
                            <strong>Monthly Fee:</strong>
                            Rs. ${batch.monthlyFee}
                        </p>

                        <p>
                            <strong>Status:</strong>
                            ${batch.active ? "Active" : "Inactive"}
                        </p>

                        <button onclick="showEditBatchForm(${batch.batchId})">
                            Edit
                        </button>

                        <button onclick="deleteBatch(${batch.batchId})">
                            Delete
                        </button>

                    </div>
                `;

            });

            html += "</div>";
        }

        content.innerHTML = html;

    } catch (error) {

        console.error(error);

        content.innerHTML =
            "<p>Unable to load batches. Make sure the Spring Boot backend is running.</p>";
    }
}

async function deleteBatch(batchId) {

    const confirmed = confirm(
        "Are you sure you want to delete this batch?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:8080/api/batches/${batchId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete batch");
        }

        alert("Batch deleted successfully!");

        showBatches();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete batch. " +
            "This batch may be used by existing learning materials."
        );
    }
}

async function showEditBatchForm(batchId) {

    const content = document.getElementById("content");

    content.innerHTML = "<p>Loading batch...</p>";

    try {

        const [batchResponse, institutesResponse, curriculaResponse] =
            await Promise.all([
                fetch(`http://localhost:8080/api/batches/${batchId}`),
                fetch("http://localhost:8080/api/institutes"),
                fetch("http://localhost:8080/api/curricula")
            ]);

        if (
            !batchResponse.ok ||
            !institutesResponse.ok ||
            !curriculaResponse.ok
        ) {
            throw new Error("Failed to load batch information");
        }

        const batch = await batchResponse.json();
        const institutes = await institutesResponse.json();
        const curricula = await curriculaResponse.json();

        let instituteOptions = "";

        institutes.forEach(institute => {

            instituteOptions += `
                <option
                    value="${institute.instituteId}"
                    ${institute.instituteId === batch.institute.instituteId ? "selected" : ""}
                >
                    ${institute.name}
                </option>
            `;

        });

        let curriculumOptions = "";

        curricula.forEach(curriculum => {

            curriculumOptions += `
                <option
                    value="${curriculum.curriculumId}"
                    ${curriculum.curriculumId === batch.curriculum.curriculumId ? "selected" : ""}
                >
                    ${curriculum.name}
                </option>
            `;

        });

        content.innerHTML = `
            <h2>Edit Batch</h2>

            <div class="form-card">

                <label for="editBatchInstitute">
                    Institute
                </label>

                <select id="editBatchInstitute">
                    ${instituteOptions}
                </select>

                <label for="editBatchCurriculum">
                    Curriculum
                </label>

                <select id="editBatchCurriculum">
                    ${curriculumOptions}
                </select>

                <label for="editBatchName">
                    Batch Name
                </label>

                <input
                    type="text"
                    id="editBatchName"
                    value="${batch.batchName}"
                >

                <label for="editMonthlyFee">
                    Monthly Fee
                </label>

                <input
                    type="number"
                    id="editMonthlyFee"
                    value="${batch.monthlyFee}"
                >

                <label for="editBatchActive">
                    Status
                </label>

                <select id="editBatchActive">

                    <option
                        value="true"
                        ${batch.active ? "selected" : ""}
                    >
                        Active
                    </option>

                    <option
                        value="false"
                        ${!batch.active ? "selected" : ""}
                    >
                        Inactive
                    </option>

                </select>

                <button onclick="updateBatch(${batchId})">
                    Save Changes
                </button>

                <button onclick="showBatches()">
                    Cancel
                </button>

            </div>
        `;

    } catch (error) {

        console.error(error);

        content.innerHTML =
            "<p>Unable to load batch information. Make sure the Spring Boot backend is running.</p>";
    }
}

async function updateBatch(batchId) {

    const instituteId =
        document.getElementById("editBatchInstitute").value;

    const curriculumId =
        document.getElementById("editBatchCurriculum").value;

    const batchName =
        document.getElementById("editBatchName").value.trim();

    const monthlyFee =
        document.getElementById("editMonthlyFee").value;

    const active =
        document.getElementById("editBatchActive").value === "true";

    if (batchName === "") {
        alert("Please enter a batch name.");
        return;
    }

    if (monthlyFee === "") {
        alert("Please enter the monthly fee.");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:8080/api/batches/${batchId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    institute: {
                        instituteId: Number(instituteId)
                    },

                    curriculum: {
                        curriculumId: Number(curriculumId)
                    },

                    batchName: batchName,

                    monthlyFee: Number(monthlyFee),

                    active: active

                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update batch");
        }

        alert("Batch updated successfully!");

        showBatches();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update batch. " +
            "Make sure the Spring Boot backend is running."
        );
    }
}


async function showMaterials() {

    const content = document.getElementById("content");

    content.innerHTML = "<p>Loading learning materials...</p>";

    try {

        const response = await fetch(
            "http://localhost:8080/api/learning-materials"
        );

        if (!response.ok) {
            throw new Error("Failed to load learning materials");
        }

        const materials = await response.json();

        let html = `
            <button onclick="showDashboard()">← Dashboard</button>
            <h2>Learning Materials</h2>
        `;

        if (materials.length === 0) {

            html += "<p>No learning materials found.</p>";

        } else {

            html += "<div class='material-list'>";

            materials.forEach(material => {

                html += `
                    <div class="material-card">

                        <h3>${material.title}</h3>

                        <p>
                            <strong>Batch:</strong>
                            ${material.batch.batchName}
                        </p>

                        <p>
                            <strong>Institute:</strong>
                            ${material.batch.institute.name}
                        </p>

                        <p>
                            <strong>Curriculum:</strong>
                            ${material.batch.curriculum.name}
                        </p>

                        <p>
                            <strong>Week:</strong>
                            ${material.weekNumber}
                        </p>

                        <p>
                            <strong>Type:</strong>
                            ${material.materialType}
                        </p>

                        <p>
                            <strong>Description:</strong>
                            ${material.description || "No description"}
                        </p>

                        <p>
                            <strong>File:</strong>
                            ${material.fileName || "No file"}
                        </p>

                        <button onclick="showEditMaterialForm(${material.materialId})">
                            Edit
                        </button>

                        <button onclick="deleteMaterial(${material.materialId})">
                            Delete
                        </button>

                    </div>
                `;

            });

            html += "</div>";
        }

        content.innerHTML = html;

    } catch (error) {

        console.error(error);

        content.innerHTML =
            "<p>Unable to load learning materials. Make sure the Spring Boot backend is running.</p>";
    }
}

async function deleteMaterial(materialId) {

    const confirmed = confirm(
        "Are you sure you want to delete this learning material?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:8080/api/learning-materials/${materialId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete learning material");
        }

        alert("Learning material deleted successfully!");

        showMaterials();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete learning material. " +
            "Make sure the Spring Boot backend is running."
        );
    }
}

async function showEditMaterialForm(materialId) {

    const content = document.getElementById("content");

    content.innerHTML = "<p>Loading material...</p>";

    try {

        const [materialResponse, batchesResponse] =
            await Promise.all([
                fetch(`http://localhost:8080/api/learning-materials/${materialId}`),
                fetch("http://localhost:8080/api/batches")
            ]);

        if (!materialResponse.ok || !batchesResponse.ok) {
            throw new Error("Failed to load material information");
        }

        const material = await materialResponse.json();
        const batches = await batchesResponse.json();

        let batchOptions = "";

        batches.forEach(batch => {

            batchOptions += `
                <option
                    value="${batch.batchId}"
                    ${batch.batchId === material.batch.batchId ? "selected" : ""}
                >
                    ${batch.batchName} -
                    ${batch.institute.name} -
                    ${batch.curriculum.name}
                </option>
            `;

        });

        content.innerHTML = `
            <h2>Edit Learning Material</h2>

            <div class="form-card">

                <label for="editMaterialBatch">
                    Batch
                </label>

                <select id="editMaterialBatch">
                    ${batchOptions}
                </select>

                <label for="editMaterialWeek">
                    Week Number
                </label>

                <input
                    type="number"
                    id="editMaterialWeek"
                    value="${material.weekNumber}"
                >

                <label for="editMaterialTitle">
                    Title
                </label>

                <input
                    type="text"
                    id="editMaterialTitle"
                    value="${material.title}"
                >

                <label for="editMaterialType">
                    Material Type
                </label>

                <select id="editMaterialType">

                    <option value="PDF"
                        ${material.materialType === "PDF" ? "selected" : ""}>
                        PDF
                    </option>

                    <option value="VIDEO"
                        ${material.materialType === "VIDEO" ? "selected" : ""}>
                        Video
                    </option>

                    <option value="DOCUMENT"
                        ${material.materialType === "DOCUMENT" ? "selected" : ""}>
                        Document
                    </option>

                    <option value="LINK"
                        ${material.materialType === "LINK" ? "selected" : ""}>
                        Link
                    </option>

                    <option value="OTHER"
                        ${material.materialType === "OTHER" ? "selected" : ""}>
                        Other
                    </option>

                </select>

                <label for="editMaterialDescription">
                    Description
                </label>

                <input
                    type="text"
                    id="editMaterialDescription"
                    value="${material.description || ""}"
                >

                <label for="editMaterialFileName">
                    File Name
                </label>

                <input
                    type="text"
                    id="editMaterialFileName"
                    value="${material.fileName || ""}"
                >

                <button onclick="updateMaterial(${materialId})">
                    Save Changes
                </button>

                <button onclick="showMaterials()">
                    Cancel
                </button>

            </div>
        `;

    } catch (error) {

        console.error(error);

        content.innerHTML =
            "<p>Unable to load material information. Make sure the Spring Boot backend is running.</p>";
    }
}

async function updateMaterial(materialId) {

    const batchId =
        document.getElementById("editMaterialBatch").value;

    const weekNumber =
        document.getElementById("editMaterialWeek").value;

    const title =
        document.getElementById("editMaterialTitle").value.trim();

    const materialType =
        document.getElementById("editMaterialType").value;

    const description =
        document.getElementById("editMaterialDescription").value.trim();

    const fileName =
        document.getElementById("editMaterialFileName").value.trim();

    if (weekNumber === "") {
        alert("Please enter the week number.");
        return;
    }

    if (title === "") {
        alert("Please enter a title.");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:8080/api/learning-materials/${materialId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    batch: {
                        batchId: Number(batchId)
                    },

                    weekNumber: Number(weekNumber),

                    title: title,

                    materialType: materialType,

                    description: description,

                    fileName: fileName,

                    filePath: fileName
                        ? "/materials/" + fileName
                        : null,

                    mimeType: materialType === "PDF"
                        ? "application/pdf"
                        : null,

                    fileSizeBytes: 0,

                    uploadedBy: 1

                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update learning material");
        }

        alert("Learning material updated successfully!");

        showMaterials();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update learning material. " +
            "Make sure the Spring Boot backend is running."
        );
    }
}


function showAddInstituteForm() {

    const content = document.getElementById("content");

    content.innerHTML = `
        <h2>Add Institute</h2>

        <div class="form-card">

            <label for="instituteName">Institute Name</label>

            <input
                type="text"
                id="instituteName"
                placeholder="Enter institute name"
            >

            <button onclick="addInstitute()">
                Add Institute
            </button>

        </div>
    `;
}


async function addInstitute() {

    const name = document.getElementById("instituteName").value.trim();

    if (name === "") {
        alert("Please enter an institute name.");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:8080/api/institutes",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to add institute");
        }

        alert("Institute added successfully!");

        showInstitutes();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to add institute. " +
            "Make sure the Spring Boot backend is running."
        );
    }
}


function showAddCurriculumForm() {

    const content = document.getElementById("content");

    content.innerHTML = `
        <h2>Add Curriculum</h2>

        <div class="form-card">

            <label for="curriculumName">Curriculum Name</label>

            <input
                type="text"
                id="curriculumName"
                placeholder="Enter curriculum name"
            >

            <button onclick="addCurriculum()">
                Add Curriculum
            </button>

        </div>
    `;
}


async function addCurriculum() {

    const name = document.getElementById("curriculumName").value.trim();

    if (name === "") {
        alert("Please enter a curriculum name.");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:8080/api/curricula",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to add curriculum");
        }

        alert("Curriculum added successfully!");

        showCurricula();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to add curriculum. " +
            "Make sure the Spring Boot backend is running."
        );
    }
}


async function showAddBatchForm() {

    const content = document.getElementById("content");

    content.innerHTML = "<p>Loading batch form...</p>";

    try {

        const [institutesResponse, curriculaResponse] = await Promise.all([
            fetch("http://localhost:8080/api/institutes"),
            fetch("http://localhost:8080/api/curricula")
        ]);

        if (!institutesResponse.ok || !curriculaResponse.ok) {
            throw new Error("Failed to load institutes or curricula");
        }

        const institutes = await institutesResponse.json();
        const curricula = await curriculaResponse.json();

        let instituteOptions = "";

        institutes.forEach(institute => {

            instituteOptions += `
                <option value="${institute.instituteId}">
                    ${institute.name}
                </option>
            `;

        });

        let curriculumOptions = "";

        curricula.forEach(curriculum => {

            curriculumOptions += `
                <option value="${curriculum.curriculumId}">
                    ${curriculum.name}
                </option>
            `;

        });

        content.innerHTML = `
            <h2>Add Batch</h2>

            <div class="form-card">

                <label for="batchInstitute">Institute</label>

                <select id="batchInstitute">
                    ${instituteOptions}
                </select>

                <label for="batchCurriculum">Curriculum</label>

                <select id="batchCurriculum">
                    ${curriculumOptions}
                </select>

                <label for="batchName">Batch Name</label>

                <input
                    type="text"
                    id="batchName"
                    placeholder="Example: 2029"
                >

                <label for="monthlyFee">Monthly Fee</label>

                <input
                    type="number"
                    id="monthlyFee"
                    placeholder="Example: 5000"
                >

                <label for="batchActive">Status</label>

                <select id="batchActive">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>

                <button onclick="addBatch()">
                    Add Batch
                </button>

            </div>
        `;

    } catch (error) {

        console.error(error);

        content.innerHTML =
            "<p>Unable to load the batch form. Make sure the Spring Boot backend is running.</p>";
    }
}


async function addBatch() {

    const instituteId =
        document.getElementById("batchInstitute").value;

    const curriculumId =
        document.getElementById("batchCurriculum").value;

    const batchName =
        document.getElementById("batchName").value.trim();

    const monthlyFee =
        document.getElementById("monthlyFee").value;

    const active =
        document.getElementById("batchActive").value === "true";

    if (batchName === "") {
        alert("Please enter a batch name.");
        return;
    }

    if (monthlyFee === "") {
        alert("Please enter the monthly fee.");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:8080/api/batches",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    institute: {
                        instituteId: Number(instituteId)
                    },

                    curriculum: {
                        curriculumId: Number(curriculumId)
                    },

                    batchName: batchName,

                    monthlyFee: Number(monthlyFee),

                    active: active
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to add batch");
        }

        alert("Batch added successfully!");

        showBatches();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to add batch. " +
            "Make sure the Spring Boot backend is running."
        );
    }
}


async function showAddMaterialForm() {

    const content = document.getElementById("content");

    content.innerHTML = "<p>Loading material form...</p>";

    try {

        const response = await fetch(
            "http://localhost:8080/api/batches"
        );

        if (!response.ok) {
            throw new Error("Failed to load batches");
        }

        const batches = await response.json();

        let batchOptions = "";

        batches.forEach(batch => {

            batchOptions += `
                <option value="${batch.batchId}">
                    ${batch.batchName} -
                    ${batch.institute.name} -
                    ${batch.curriculum.name}
                </option>
            `;

        });

        content.innerHTML = `
            <h2>Add Learning Material</h2>

            <div class="form-card">

                <label for="materialBatch">Batch</label>

                <select id="materialBatch">
                    ${batchOptions}
                </select>

                <label for="materialWeek">Week Number</label>

                <input
                    type="number"
                    id="materialWeek"
                    placeholder="Example: 1"
                >

                <label for="materialTitle">Title</label>

                <input
                    type="text"
                    id="materialTitle"
                    placeholder="Example: Introduction to Physics"
                >

                <label for="materialType">Material Type</label>

                <select id="materialType">

                    <option value="PDF">
                        PDF
                    </option>

                    <option value="VIDEO">
                        Video
                    </option>

                    <option value="DOCUMENT">
                        Document
                    </option>

                    <option value="LINK">
                        Link
                    </option>

                    <option value="OTHER">
                        Other
                    </option>

                </select>

                <label for="materialDescription">
                    Description
                </label>

                <input
                    type="text"
                    id="materialDescription"
                    placeholder="Enter a description"
                >

                <label for="materialFileName">
                    File Name
                </label>

                <input
                    type="text"
                    id="materialFileName"
                    placeholder="Example: lesson1.pdf"
                >

                <button onclick="addMaterial()">
                    Add Material
                </button>

            </div>
        `;

    } catch (error) {

        console.error(error);

        content.innerHTML =
            "<p>Unable to load the material form. Make sure the Spring Boot backend is running.</p>";
    }
}


async function addMaterial() {

    const batchId =
        document.getElementById("materialBatch").value;

    const weekNumber =
        document.getElementById("materialWeek").value;

    const title =
        document.getElementById("materialTitle").value.trim();

    const materialType =
        document.getElementById("materialType").value;

    const description =
        document.getElementById("materialDescription").value.trim();

    const fileName =
        document.getElementById("materialFileName").value.trim();

    if (weekNumber === "") {
        alert("Please enter the week number.");
        return;
    }

    if (title === "") {
        alert("Please enter a title.");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:8080/api/learning-materials",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    batch: {
                        batchId: Number(batchId)
                    },

                    weekNumber: Number(weekNumber),

                    title: title,

                    materialType: materialType,

                    description: description,

                    fileName: fileName,

                    filePath: fileName
                        ? "/materials/" + fileName
                        : null,

                    mimeType: materialType === "PDF"
                        ? "application/pdf"
                        : null,

                    fileSizeBytes: 0,

                    uploadedBy: 1

                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to add learning material");
        }

        alert("Learning material added successfully!");

        showMaterials();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to add learning material. " +
            "Make sure the Spring Boot backend is running."
        );
    }
}


async function deleteInstitute(instituteId) {

    const confirmed = confirm(
        "Are you sure you want to delete this institute?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:8080/api/institutes/${instituteId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete institute");
        }

        alert("Institute deleted successfully!");

        showInstitutes();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete institute. " +
            "It may be used by an existing batch."
        );
    }
}

function showDashboard() {

    document.getElementById("content").innerHTML = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
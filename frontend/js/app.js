async function showInstitutes() {

    const content = document.getElementById("content");

    content.innerHTML = "<p>Loading institutes...</p>";

    try {

        const response = await fetch("http://localhost:8080/api/institutes");

        if (!response.ok) {
            throw new Error("Failed to load institutes");
        }

        const institutes = await response.json();

        let html = "<h2>Institutes</h2>";

        if (institutes.length === 0) {
            html += "<p>No institutes found.</p>";
        } else {

            html += "<div class='institute-list'>";

            institutes.forEach(institute => {

                html += `
                    <div class="institute-card">
                        <h3>${institute.name}</h3>
                        <p><strong>Institute ID:</strong> ${institute.instituteId}</p>
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

async function showCurricula() {

    const content = document.getElementById("content");

    content.innerHTML = "<p>Loading curricula...</p>";

    try {

        const response = await fetch("http://localhost:8080/api/curricula");

        if (!response.ok) {
            throw new Error("Failed to load curricula");
        }

        const curricula = await response.json();

        let html = "<h2>Curricula</h2>";

        if (curricula.length === 0) {
            html += "<p>No curricula found.</p>";
        } else {

            html += "<div class='curriculum-list'>";

            curricula.forEach(curriculum => {

                html += `
                    <div class="curriculum-card">
                        <h3>${curriculum.name}</h3>
                        <p><strong>Curriculum ID:</strong> ${curriculum.curriculumId}</p>
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

async function showBatches() {

     const content = document.getElementById("content");

     content.innerHTML = "<p>Loading batches...</p>";

     try {

         const response = await fetch("http://localhost:8080/api/batches");

         if (!response.ok) {
             throw new Error("Failed to load batches");
         }

         const batches = await response.json();

         let html = "<h2>Batches</h2>";

         if (batches.length === 0) {
             html += "<p>No batches found.</p>";
         } else {

             html += "<div class='batch-list'>";

             batches.forEach(batch => {

                 html += `
                     <div class="batch-card">
                         <h3>${batch.batchName}</h3>
                         <p><strong>Institute:</strong> ${batch.institute.name}</p>
                         <p><strong>Curriculum:</strong> ${batch.curriculum.name}</p>
                         <p><strong>Monthly Fee:</strong> Rs. ${batch.monthlyFee}</p>
                         <p><strong>Status:</strong> ${batch.active ? "Active" : "Inactive"}</p>
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

function showMaterials() {
    document.getElementById("content").innerHTML =
        "<h2>Learning Materials</h2><p>Learning material management will be added here.</p>";
}
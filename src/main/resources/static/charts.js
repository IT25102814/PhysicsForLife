// Shared Chart.js rendering for student and tutor pages.
let progressChartInstance = null;
let tutorChartInstance = null;

function drawChart(dataPoints, canvasId, chartType) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (canvasId === 'progressChart') {
        if (progressChartInstance) progressChartInstance.destroy();
        progressChartInstance = new Chart(ctx, {
            type: 'scatter',
            data: { datasets: [{ label: 'Student Marks per Quiz', data: dataPoints, backgroundColor: 'rgba(31, 78, 121, 1)', pointRadius: 8 }] },
            options: { scales: { x: { title: { display: true, text: 'Quiz ID' }, min: 1, ticks: { stepSize: 1 } }, y: { title: { display: true, text: 'Marks (out of 100)' }, min: 0, max: 100 } } }
        });
    } else if (canvasId === 'tutorChart') {
        if (tutorChartInstance) tutorChartInstance.destroy();

        const labels = dataPoints.map(d => `Question ${d.questionNumber}`);
        const dataValues = dataPoints.map(d => d.percentage);

        tutorChartInstance = new Chart(ctx, {
            type: 'bar', // Horizontal bar chart configuration
            data: {
                labels: labels,
                datasets: [{
                    label: 'Correct Percentage (%)',
                    data: dataValues,
                    backgroundColor: '#1f4e79', // Solid blue rows matching your theme
                    borderRadius: 6,
                    barThickness: 28
                }]
            },
            options: {
                indexAxis: 'y', // Makes the bar chart horizontal
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: function(value) { return value + '%'; }
                        },
                        grid: { display: false }
                    },
                    y: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` Correct: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }
}

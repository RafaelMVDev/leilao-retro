// Function to switch tabs
function switchTab(tabName) {
    // Remove 'active' class from all buttons and hide all contents
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');

    // Add 'active' class to the clicked button
    document.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');

    // Display the corresponding tab content
    document.getElementById(`tab-${tabName}`).style.display = 'block';
}

// Initialize the first tab when the page loads
window.onload = function () {
    switchTab('details');
};
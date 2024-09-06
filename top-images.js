document.addEventListener('DOMContentLoaded', () => {
    const votes = JSON.parse(localStorage.getItem('votes')) || {};

    function updateTopImagesTable() {
        const sortedImages = Object.entries(votes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const tableBody = document.getElementById('topImagesTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = ''; // Clear existing rows

        sortedImages.forEach(([imageUrl, voteCount], index) => {
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = index + 1;
            row.insertCell(1).innerHTML = `<img src="${imageUrl}" alt="Image ${index + 1}">`;
            row.insertCell(2).textContent = voteCount;
        });
    }

    updateTopImagesTable();
});

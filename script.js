const GITHUB_TOKEN = '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'; 
const GITHUB_REPO = 'mandarwagh9/facemash'; 
const GITHUB_API = 'https://api.github.com';

let votes = JSON.parse(localStorage.getItem('votes')) || {}; // Load votes from local storage

async function loadRandomImages() {
    try {
        const response = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/images.json`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });

        if (!response.ok) throw new Error('Failed to fetch images.json');

        const data = await response.json();
        const content = JSON.parse(atob(data.content));

        if (content.images.length >= 2) {
            const randomImages = content.images.sort(() => 0.5 - Math.random()).slice(0, 2);
            document.getElementById('image1').src = randomImages[0];
            document.getElementById('image2').src = randomImages[1];

            // Initialize votes for these images
            randomImages.forEach(image => {
                if (!votes[image]) votes[image] = 0;
            });

            localStorage.setItem('votes', JSON.stringify(votes));
        }
    } catch (error) {
        console.error('Error loading images:', error);
    }
}

function selectImage(imageNumber) {
    const selectedImage = document.getElementById(`image${imageNumber}`).src;

    if (votes[selectedImage] !== undefined) {
        votes[selectedImage]++;
        localStorage.setItem('votes', JSON.stringify(votes));
        // Remove the call to updateTopImagesTable here
        loadRandomImages();
    } else {
        alert('Image not found.');
    }
}

async function uploadToGitHub(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const content = reader.result.split(',')[1];
        const filename = `images/${Date.now()}_${file.name}`;
        
        try {
            const uploadResponse = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filename}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Upload image via Facemash clone',
                    content: content
                })
            });

            if (!uploadResponse.ok) throw new Error('Failed to upload image to GitHub');

            const uploadData = await uploadResponse.json();
            const imageUrl = uploadData.content.download_url;

            const jsonResponse = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/images.json`, {
                headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
            });
            const jsonData = await jsonResponse.json();
            const jsonContent = JSON.parse(atob(jsonData.content));
            jsonContent.images.push(imageUrl);

            const updateResponse = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/images.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update images.json',
                    content: btoa(JSON.stringify(jsonContent)),
                    sha: jsonData.sha
                })
            });

            if (!updateResponse.ok) throw new Error('Failed to update images.json');

            console.log('File uploaded to GitHub and images.json updated!');
            document.getElementById('statusMessage').style.display = 'block';
            setTimeout(() => {
                document.getElementById('statusMessage').style.display = 'none';
            }, 3000); // Hide the message after 3 seconds

            votes[imageUrl] = 0;
            localStorage.setItem('votes', JSON.stringify(votes));

            loadRandomImages();
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while uploading the image.');
        }
    };
}

document.getElementById("imageUpload").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) uploadToGitHub(file);
});

// Load random images on page load
loadRandomImages();
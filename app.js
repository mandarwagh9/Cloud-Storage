
// Replace with your GitHub token
const GITHUB_TOKEN = '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' 
// Helper function to make API requests
async function githubApiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
    };
    
    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`https://api.github.com${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });
    
    if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || 'Something went wrong');
    }
    
    return await response.json();
}

// Upload a file to the repository
async function uploadFile(filePath, fileContent) {
    const fileBase64 = btoa(fileContent);
    const commitMessage = `Upload file ${filePath}`;
    
    const body = {
        message: commitMessage,
        content: fileBase64
    };
    
    return await githubApiRequest(`/repos/mandarwagh9/Cloud-Storage/contents/${filePath}`, 'PUT', body);
}

// List files in the repository
async function listFiles(path = '') {
    return await githubApiRequest(`/repos/mandarwagh9/Cloud-Storage/contents/${path}`);
}

// Handle file upload
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const path = document.getElementById('path').value || fileInput.files[0].name;

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async function (event) {
            try {
                const result = await uploadFile(path, event.target.result);
                alert(`File uploaded: ${result.content.path}`);
                displayFiles();
            } catch (error) {
                alert(`Upload failed: ${error.message}`);
            }
        };
        
        reader.readAsBinaryString(file);
    }
});



let sessionId = null;

// Step 1: Start a session
async function startSession(options) {
    const res = await fetch('http://localhost:3200/api/optimize/start', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(options)
    });
    const data = await res.json();
    sessionId = data.sessionId;
    return data;
}

// Step 2: Upload files one by one
async function uploadFile(file) {
    const form = new FormData();
    form.append('image', file);
    form.append('sessionId', sessionId);

    const res = await fetch('/api/optimize/upload', {
        method: 'POST',
        body: form
    });
    return await res.json();
}

// Step 3: Download the full batch as ZIP
async function downloadAll() {
    const res = await fetch(`/api/optimize/zip/${sessionId}`);
    const data = await res.json();
    window.location.href = data.zipUrl;
}


console.log('Hi');

const startSessionExample = {
    "quality": 80,
    "format": "webp",
    "stripMetadata": true,
    "progressive": true,
    "lossless": false,
    "resize": {
        "width": 1200,
        "height": 800,
        "fit": "inside"
    }
}


startSession(startSessionExample);
console.log('startSession', startSession(startSessionExample));


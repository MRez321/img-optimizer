

    // CLIENT-SIDE USAGE EXAMPLE (frontend) - Plain JavaScript Version

    const socket = io('http://localhost:3200');

    // Start a session
    async function startBatch(files, options) {
    const response = await axios.post('/api/start', {
    ...options,
    totalFiles: files.length
});

    const { sessionId } = response.data;

    // Join the socket room for this session
    socket.emit('join-session', sessionId);

    // Set up listeners BEFORE uploading
    socket.on('file-processed', function(data) {
    console.log(`Processed ${data.image.originalName}`);
    console.log(`Progress: ${data.progress.completed}/${data.progress.expected}`);
    // Update UI with image result + progress bar
});

    socket.on('file-error', function(data) {
    console.error(`Error (${data.stage}) on ${data.originalName ?? 'unknown'}: ${data.message}`);
    // Show error toast for this specific file
});

    socket.on('zip-ready', function(zipData) {
    console.log('All files done! ZIP ready:', zipData.zipUrl);
    // Show download button / auto-trigger download
});

    // Heartbeat - keep session alive
    const heartbeatInterval = setInterval(() => {
    socket.emit('heartbeat', sessionId);
}, 30000); // every 30s

    // Upload files one by one
    for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const formData = new FormData();
    formData.append('image', file);
    formData.append('sessionId', sessionId);

    try {
    await axios.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
} catch (err) {
    console.error(`Upload failed for ${file.name}`, err);
}
}

    // Optional cleanup when done
    // clearInterval(heartbeatInterval);
    // socket.emit('leave-session', sessionId);

    return sessionId;
}

    // Example usage:
    // const files = document.getElementById('fileInput').files;
    // startBatch(files, { someOption: "value" });
/**
 * CLIENT-SIDE USAGE EXAMPLE (frontend)
 * -------------------------------------
 * This is NOT a backend file - shows how your frontend should
 * use the new socket events with the existing single-file upload loop.
 *
 * Requires: npm install socket.io-client
 */

import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3200');

// Start a session
async function startBatch(files: File[], options: Record<string, any>) {
    const { data } = await axios.post('/api/start', {
        ...options,
        totalFiles: files.length // <-- IMPORTANT: tells server how many to expect
    });

    const { sessionId } = data;

    // Join the socket room for this session
    socket.emit('join-session', sessionId);

    // Set up listeners BEFORE uploading
    socket.on('file-processed', ({ image, progress }) => {
        console.log(`Processed ${image.originalName}`);
        console.log(`Progress: ${progress.completed}/${progress.expected}`);
        // Update UI with image result + progress bar
    });

    socket.on('file-error', ({ stage, originalName, message }) => {
        console.error(`Error (${stage}) on ${originalName ?? 'unknown'}: ${message}`);
        // Show error toast for this specific file
    });

    socket.on('zip-ready', (zipData) => {
        console.log('All files done! ZIP ready:', zipData.zipUrl);
        // Show download button / auto-trigger download
    });

    // Heartbeat - keep session alive while user has the tab open
    const heartbeatInterval = setInterval(() => {
        socket.emit('heartbeat', sessionId);
    }, 30000); // every 30s

    // Upload files one by one (existing loop pattern, just kept as-is)
    for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('sessionId', sessionId);

        try {
            await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Result also arrives via 'file-processed' socket event,
            // so you don't strictly need to use this response body.
        } catch (err) {
            console.error(`Upload failed for ${file.name}`, err);
            // 'file-error' socket event will also fire for processing failures
        }
    }

    // Optional cleanup when done
    // clearInterval(heartbeatInterval);
    // socket.emit('leave-session', sessionId);

    return sessionId;
}

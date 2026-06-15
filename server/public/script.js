    // ---- CONFIG ----
    const API_BASE = window.location.origin; // assumes served from same origin as backend
    // If testing from a different origin (e.g. opening this file directly),
    // change to: const API_BASE = 'http://localhost:3000';

    // ---- STATE ----
    let socket = null;
    let currentSessionId = null;
    let heartbeatTimer = null;
    let expectedFiles = 0;
    let completedFiles = 0;

    // ---- DOM ----
    const connDot = document.getElementById('connDot');
    const connText = document.getElementById('connText');
    const sessionIdDisplay = document.getElementById('sessionIdDisplay');
    const hbPulse = document.getElementById('hbPulse');
    const hbText = document.getElementById('hbText');
    const logEl = document.getElementById('log');
    const startBtn = document.getElementById('startBtn');
    const manualZipBtn = document.getElementById('manualZipBtn');
    const resetBtn = document.getElementById('resetBtn');
    const progressPanel = document.getElementById('progressPanel');
    const progressFill = document.getElementById('progressFill');
    const progressLabel = document.getElementById('progressLabel');
    const resultsPanel = document.getElementById('resultsPanel');
    const resultsGrid = document.getElementById('resultsGrid');
    const zipBanner = document.getElementById('zipBanner');
    const zipLink = document.getElementById('zipLink');
    const zipStats = document.getElementById('zipStats');

    // ---- LOG ----
    function log(message, type = 'dim') {
    const entry = document.createElement('div');
    entry.className = `entry t-${type}`;
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] ${message}`;
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
}

    function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let val = bytes;
    while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
}
    return `${val.toFixed(val < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

    // ---- SOCKET SETUP ----
    function initSocket() {
    socket = io(API_BASE);

    socket.on('connect', () => {
    connDot.classList.add('connected');
    connText.textContent = `connected (${socket.id})`;
    log(`Socket connected: ${socket.id}`, 'ok');

    // If we already have a session (e.g. socket reconnected mid-batch), rejoin
    if (currentSessionId) {
    socket.emit('join-session', currentSessionId);
    log(`Rejoined session room ${currentSessionId}`, 'info');
}
});

    socket.on('disconnect', () => {
    connDot.classList.remove('connected');
    connText.textContent = 'disconnected';
    log('Socket disconnected', 'err');
});

    socket.on('connect_error', (err) => {
    log(`Socket connection error: ${err.message}`, 'err');
});

    socket.on('file-processed', ({ image, progress }) => {
    completedFiles = progress.completed;
    expectedFiles = progress.expected;

    log(
    `file-processed: ${image.originalName} → ${image.optimizedName} ` +
    `(${formatBytes(image.originalSize)} → ${formatBytes(image.optimizedSize)}, ` +
    `${image.savings}% smaller) [${progress.completed}/${progress.expected}]`,
    'ok'
    );

    updateProgress(progress.completed, progress.expected);
    addResultCard(image);
});

    socket.on('file-error', ({ stage, originalName, message }) => {
    log(`file-error [${stage}]${originalName ? ' on ' + originalName : ''}: ${message}`, 'err');
});

    socket.on('zip-ready', (data) => {
    log(
    `zip-ready: ${data.zipUrl} ` +
    `(total: ${formatBytes(data.totalOriginalSize)} → ${formatBytes(data.totalOptimizedSize)}, ` +
    `${data.totalSavings}% savings)`,
    'ok'
    );
    showZipBanner(data);
});
}

    // ---- HEARTBEAT ----
    function startHeartbeat(sessionId) {
    stopHeartbeat();
    hbText.textContent = 'heartbeat: active';
    heartbeatTimer = setInterval(() => {
    if (!socket || !socket.connected) return;
    socket.emit('heartbeat', sessionId);
    hbPulse.classList.add('active');
    log('heartbeat sent', 'dim');
    setTimeout(() => hbPulse.classList.remove('active'), 400);
}, 30000);
}

    function stopHeartbeat() {
    if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
}
    hbText.textContent = 'heartbeat: idle';
    hbPulse.classList.remove('active');
}

    // ---- UI HELPERS ----
    function updateProgress(completed, expected) {
    progressPanel.style.display = 'block';
    const pct = expected > 0 ? Math.round((completed / expected) * 100) : 0;
    progressFill.style.width = `${pct}%`;
    progressLabel.textContent = expected > 0
    ? `${completed} / ${expected} processed (${pct}%)`
    : `${completed} processed (expected count unknown)`;
}

    function addResultCard(image) {
    resultsPanel.style.display = 'block';
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="name">${image.originalName}</div>
      <div class="row2"><span>Original</span><span>${formatBytes(image.originalSize)}</span></div>
      <div class="row2"><span>Optimized</span><span>${formatBytes(image.optimizedSize)}</span></div>
      <div class="row2"><span>Savings</span><span class="savings">${image.savings}%</span></div>
      <div class="row2"><span>Dimensions</span><span>${image.width}×${image.height}</span></div>
      <a href="${API_BASE}${image.downloadUrl}" target="_blank" rel="noopener">Download file →</a>
    `;
    resultsGrid.appendChild(card);
}

    function showZipBanner(data) {
    zipBanner.classList.add('show');
    zipLink.href = `${API_BASE}${data.zipUrl}`;
    zipStats.textContent =
    `${formatBytes(data.totalOriginalSize)} → ${formatBytes(data.totalOptimizedSize)} (${data.totalSavings}% saved)`;
    manualZipBtn.disabled = true;
}

    function resetUI() {
    progressPanel.style.display = 'none';
    resultsPanel.style.display = 'none';
    resultsGrid.innerHTML = '';
    progressFill.style.width = '0%';
    progressLabel.textContent = '0 / 0';
    zipBanner.classList.remove('show');
    sessionIdDisplay.textContent = '';
    manualZipBtn.disabled = true;
    completedFiles = 0;
    expectedFiles = 0;
    stopHeartbeat();
    if (currentSessionId && socket && socket.connected) {
    socket.emit('leave-session', currentSessionId);
    log(`Left session room ${currentSessionId}`, 'info');
}
    currentSessionId = null;
    logEl.innerHTML = '';
    log('Reset', 'info');
}

    // ---- MAIN FLOW ----
    async function startSessionAndUpload() {
    const fileInput = document.getElementById('files');
    const files = Array.from(fileInput.files || []);

    if (files.length === 0) {
    log('No files selected', 'warn');
    return;
}

    startBtn.disabled = true;

    const options = {
    quality: Number(document.getElementById('quality').value) || 80,
    format: document.getElementById('format').value,
    stripMetadata: document.getElementById('stripMetadata').checked,
    progressive: document.getElementById('progressive').checked,
    lossless: document.getElementById('lossless').checked,
    totalFiles: files.length
};

    const resizeWidth = Number(document.getElementById('resizeWidth').value);
    if (resizeWidth > 0) {
    options.resize = { width: resizeWidth };
}

    log(`Starting session for ${files.length} file(s)...`, 'info');

    try {
    const startRes = await fetch(`${API_BASE}/api/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
});

    if (!startRes.ok) throw new Error(`/api/start failed: ${startRes.status}`);

    const { sessionId, folderName, expectedFiles: ef } = await startRes.json();
    currentSessionId = sessionId;
    expectedFiles = ef;

    sessionIdDisplay.textContent = `session: ${sessionId}`;
    log(`Session started: ${sessionId} (folder: ${folderName}, expecting ${ef} files)`, 'ok');

    // Join socket room for this session
    if (socket && socket.connected) {
    socket.emit('join-session', sessionId);
    log(`Joined session room ${sessionId}`, 'info');
} else {
    log('Socket not connected — realtime events will be missed until reconnect', 'warn');
}

    updateProgress(0, ef);
    manualZipBtn.disabled = false;
    startHeartbeat(sessionId);

    // Upload files one by one (single-file endpoint, looped client-side)
    for (const file of files) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('sessionId', sessionId);

    log(`Uploading ${file.name} (${formatBytes(file.size)})...`, 'dim');

    try {
    const uploadRes = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData
});

    const data = await uploadRes.json();

    if (!uploadRes.ok) {
    log(`Upload failed for ${file.name}: ${data.error || uploadRes.status}`, 'err');
    continue;
}

    // Note: result also arrives via 'file-processed' socket event.
    // We rely on the socket event for UI updates to avoid duplicates.
    log(`HTTP response OK for ${file.name}`, 'dim');
} catch (err) {
    log(`Upload request error for ${file.name}: ${err.message}`, 'err');
}
}

    log('All upload requests sent.', 'info');
} catch (err) {
    log(`Error: ${err.message}`, 'err');
} finally {
    startBtn.disabled = false;
}
}

    async function requestZipManually() {
    if (!currentSessionId) return;
    log('Requesting ZIP manually...', 'info');
    try {
    const res = await fetch(`${API_BASE}/api/zip/${currentSessionId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `status ${res.status}`);

    log(`Manual ZIP response: ${data.zipUrl}`, 'ok');
    showZipBanner({
    zipUrl: data.zipUrl,
    totalOriginalSize: data.totalOriginalSize,
    totalOptimizedSize: data.totalOptimizedSize,
    totalSavings: data.totalSavings
});
} catch (err) {
    log(`Manual ZIP error: ${err.message}`, 'err');
}
}

    // ---- WIRE UP ----
    startBtn.addEventListener('click', startSessionAndUpload);
    manualZipBtn.addEventListener('click', requestZipManually);
    resetBtn.addEventListener('click', resetUI);

    initSocket();
    log('Initializing... waiting for socket connection', 'dim');
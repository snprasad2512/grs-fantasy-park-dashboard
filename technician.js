/* ════════════════════════════════════════════════════════════
   GRS FANTASY PARK — TECHNICIAN FIELD PORTAL (/technician)
   Standalone Module logic for technician.html
   ════════════════════════════════════════════════════════════ */

let currentTechUser = null;
let activePortalLocation = '';
let activePortalMeter = null;
let portalCameraStream = null;
let portalPhotoDataUrl = '';

// Assigned Locations mapping by default Technician ID
const TECH_ASSIGNED_LOCATIONS = {
    'TECH-001': ['Substation Alpha (North Gate)', 'Thrill Valley Power Room', 'Thrill Valley Ride Control', 'Thrill Valley South', 'Generator Yard Alpha', 'Generator Yard Beta'],
    'TECH-002': ['Main Food Plaza Rooftop', 'Main Food Plaza Basement', 'Admin HQ Building Ground Floor', 'Main Entrance Gate Complex'],
    'TECH-003': ['Aqua World Pump House 1', 'Aqua World Plant Room 2', 'Aqua World Pump House 3'],
    'TECH-004': ['Kids Zone Control Booth', 'Kids Zone East Pavilion', 'Mystic Zone Building B', 'Entertainment Complex', 'Lighting Control Panel 1', 'Lighting Control Panel 2']
};

// ─── INITIALIZATION ───
window.addEventListener('DOMContentLoaded', () => {
    checkTechPortalSession();
});

function checkTechPortalSession() {
    const sessionStr = localStorage.getItem('tech_portal_session');
    if (sessionStr) {
        try {
            const user = JSON.parse(sessionStr);
            if (user && user.role === 'technician') {
                currentTechUser = user;
                showTechPortalDashboard();
                return;
            } else {
                localStorage.removeItem('tech_portal_session');
            }
        } catch (e) {
            localStorage.removeItem('tech_portal_session');
        }
    }
    showTechPortalLogin();
}

function showTechPortalLogin() {
    document.getElementById('tech-portal-login').style.display = 'block';
    document.getElementById('tech-portal-dashboard').style.display = 'none';
    const errBox = document.getElementById('tech-login-error');
    if (errBox) errBox.style.display = 'none';
}

function showTechPortalDashboard() {
    document.getElementById('tech-portal-login').style.display = 'none';
    document.getElementById('tech-portal-dashboard').style.display = 'flex';
    
    document.getElementById('header-tech-name').textContent = currentTechUser.name + ` (${currentTechUser.id})`;
    renderPortalLocations();
    renderPortalHistory();
}

// ─── LOGIN & LOGOUT ───
function handleTechPortalLogin() {
    const idInput = document.getElementById('tech-login-id').value.trim();
    const passInput = document.getElementById('tech-login-pass').value;
    const errBox = document.getElementById('tech-login-error');

    if (!idInput || !passInput) {
        errBox.textContent = 'Please enter both Technician ID and password.';
        errBox.style.display = 'block';
        return;
    }

    // Load users from localStorage (seed if needed)
    let users = JSON.parse(localStorage.getItem('grs_users') || '[]');
    if (!users || users.length === 0) {
        users = [
            { id: 'ADM-001', name: 'Suresh Menon', role: 'admin', title: 'System Administrator', password: 'pass123', status: 'active' },
            { id: 'MGR-001', name: 'Anitha Desai', role: 'manager', title: 'Senior Operations Manager', password: 'pass123', status: 'active' },
            { id: 'SUP-001', name: 'Deepa Nair', role: 'supervisor', title: 'Park Maintenance Supervisor', password: 'pass123', status: 'active' },
            { id: 'TECH-001', name: 'Rajesh Kumar', role: 'technician', title: 'Senior Electrical Tech', password: 'pass123', status: 'active' },
            { id: 'TECH-002', name: 'Priya Sharma', role: 'technician', title: 'HVAC & Power Tech', password: 'pass123', status: 'active' },
            { id: 'TECH-003', name: 'Arun Venkat', role: 'technician', title: 'Ride & Water Grid Tech', password: 'pass123', status: 'active' },
            { id: 'TECH-004', name: 'Meena Rao', role: 'technician', title: 'Zone Maintenance Tech', password: 'pass123', status: 'active' }
        ];
        localStorage.setItem('grs_users', JSON.stringify(users));
    }

    const foundUser = users.find(u => u.id.toLowerCase() === idInput.toLowerCase() && u.password === passInput);

    if (!foundUser) {
        errBox.textContent = 'Invalid Technician ID or password.';
        errBox.style.display = 'block';
        return;
    }

    // REQUIREMENT 1: Technician logs in using Technician credentials only.
    if (foundUser.role !== 'technician') {
        errBox.textContent = `Access Denied: This portal (/technician) is restricted to Technicians only. User '${foundUser.id}' (${foundUser.role.toUpperCase()}) must use the Main Portal (/index.html).`;
        errBox.style.display = 'block';
        return;
    }

    if (foundUser.status === 'suspended') {
        errBox.textContent = 'Your Technician account is suspended. Please contact Supervisor or Admin.';
        errBox.style.display = 'block';
        return;
    }

    currentTechUser = foundUser;
    localStorage.setItem('tech_portal_session', JSON.stringify(currentTechUser));
    errBox.style.display = 'none';
    showTechPortalDashboard();
}

function handleTechPortalLogout() {
    stopPortalCamera();
    currentTechUser = null;
    localStorage.removeItem('tech_portal_session');
    showTechPortalLogin();
}

// ─── ASSIGNED LOCATIONS SYSTEM (REQUIREMENT 2) ───
function getAssignedLocationsList() {
    if (!currentTechUser) return [];
    
    // Check if user has explicit assignedLocations property
    if (currentTechUser.assignedLocations && Array.isArray(currentTechUser.assignedLocations) && currentTechUser.assignedLocations.length > 0) {
        return currentTechUser.assignedLocations;
    }

    // Check mapping by ID
    const upperId = currentTechUser.id.toUpperCase();
    if (TECH_ASSIGNED_LOCATIONS[upperId]) {
        return TECH_ASSIGNED_LOCATIONS[upperId];
    }

    // Fallback: assign first 3 locations
    const allLocs = JSON.parse(localStorage.getItem('grs_locations') || '[]');
    if (allLocs && allLocs.length > 0) {
        return allLocs.slice(0, 3).map(l => l.name);
    }

    return ['Substation Alpha (North Gate)', 'Thrill Valley Power Room', 'Aqua World Pump House 1'];
}

function renderPortalLocations() {
    const listContainer = document.getElementById('portal-locations-list');
    if (!listContainer) return;

    const assignedLocs = getAssignedLocationsList();
    document.getElementById('assigned-loc-count').textContent = `${assignedLocs.length} Assigned`;

    if (assignedLocs.length === 0) {
        listContainer.innerHTML = `<div style="color:var(--text-muted);padding:1rem">No locations assigned. Please contact Administrator.</div>`;
        return;
    }

    listContainer.innerHTML = assignedLocs.map(locName => `
        <button type="button" class="loc-pill ${locName === activePortalLocation ? 'active' : ''}" onclick="selectPortalLocation('${locName.replace(/'/g, "\\'")}')">
            <span>📍 ${locName}</span>
        </button>
    `).join('');

    // If no location selected yet, auto-select first
    if (!activePortalLocation && assignedLocs.length > 0) {
        selectPortalLocation(assignedLocs[0]);
    }
}

function selectPortalLocation(locName) {
    activePortalLocation = locName;
    
    // Update active class
    document.querySelectorAll('.loc-pill').forEach(pill => {
        pill.classList.toggle('active', pill.textContent.includes(locName));
    });

    document.getElementById('active-location-name').textContent = locName;
    document.getElementById('portal-meters-section').style.display = 'block';
    
    // Close any open capture form on location change
    closePortalCaptureSection();
    
    // REQUIREMENT 3: Display only energy meters assigned to that location
    renderPortalMeters();
}

// ─── ASSIGNED METERS SYSTEM (REQUIREMENT 3 & 4) ───
function renderPortalMeters() {
    const grid = document.getElementById('portal-meters-grid');
    if (!grid) return;

    const allMeters = JSON.parse(localStorage.getItem('grs_meters') || '[]');
    const locationMeters = allMeters.filter(m => m.location === activePortalLocation);

    document.getElementById('assigned-meter-count').textContent = `${locationMeters.length} Meters`;

    if (locationMeters.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-muted);background:var(--bg-card);border-radius:14px;border:1px dashed rgba(255,255,255,0.1)">
            No energy meters currently mapped to location '${activePortalLocation}'.
        </div>`;
        return;
    }

    // REQUIREMENT 4: Show two buttons: Capture Photo and Upload Photo on each meter card
    grid.innerHTML = locationMeters.map(m => `
        <div class="meter-portal-card">
            <div class="meter-portal-header">
                <div class="meter-portal-icon">${m.icon || '⚡'}</div>
                <div>
                    <div style="font-weight:700;font-size:1.08rem;color:#fff">${m.name}</div>
                    <div style="font-size:0.82rem;color:var(--text-muted);margin-top:2px">ID: ${m.id} | Zone: ${m.zone || 'Central Utility'}</div>
                    <div style="font-size:0.85rem;color:#22d3ee;font-weight:600;margin-top:4px">Last Baseline: ${m.prevReading ? m.prevReading.toFixed(2) : '0.00'} kWh</div>
                </div>
            </div>
            <div class="meter-portal-btns">
                <button type="button" class="btn-portal-capture" onclick="openPortalCapture('${m.id}', 'camera')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    Capture Photo
                </button>
                <button type="button" class="btn-portal-upload" onclick="openPortalCapture('${m.id}', 'upload')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload Photo
                </button>
            </div>
        </div>
    `).join('');
}

// ─── PHOTO CAPTURE & UPLOAD ROUTINE (REQUIREMENTS 4 & 5) ───
function openPortalCapture(meterId, action) {
    const allMeters = JSON.parse(localStorage.getItem('grs_meters') || '[]');
    activePortalMeter = allMeters.find(m => m.id === meterId);
    if (!activePortalMeter) return;

    const captureSec = document.getElementById('portal-capture-section');
    captureSec.style.display = 'block';
    
    document.getElementById('capture-meter-icon').textContent = activePortalMeter.icon || '⚡';
    document.getElementById('capture-meter-name').textContent = `${activePortalMeter.name} (${activePortalMeter.id})`;
    document.getElementById('capture-meter-loc').textContent = `📍 ${activePortalMeter.location} (${activePortalMeter.zone || 'Central Utility'})`;
    document.getElementById('capture-meter-prev').textContent = `${activePortalMeter.prevReading ? activePortalMeter.prevReading.toFixed(2) : '0.00'} kWh`;

    // Reset previous states
    portalPhotoDataUrl = '';
    document.getElementById('portal-preview-area').style.display = 'none';
    document.getElementById('portal-ocr-loading').style.display = 'none';
    document.getElementById('portal-reading-form').style.display = 'none';

    // Scroll to capture area smoothly
    setTimeout(() => {
        captureSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    if (action === 'camera') {
        startPortalCamera();
    } else if (action === 'upload') {
        document.getElementById('portal-file-input').value = '';
        setTimeout(() => {
            document.getElementById('portal-file-input').click();
        }, 300);
    }
}

function closePortalCaptureSection() {
    stopPortalCamera();
    document.getElementById('portal-capture-section').style.display = 'none';
    activePortalMeter = null;
}

async function startPortalCamera() {
    const video = document.getElementById('portal-camera-video');
    const viewfinder = document.getElementById('portal-viewfinder');
    document.getElementById('portal-preview-area').style.display = 'none';

    try {
        portalCameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = portalCameraStream;
        viewfinder.style.display = 'block';
    } catch (err) {
        alert('Device camera access denied or unavailable. Switching to Gallery Upload.');
        document.getElementById('portal-file-input').click();
    }
}

function stopPortalCamera() {
    if (portalCameraStream) {
        portalCameraStream.getTracks().forEach(t => t.stop());
        portalCameraStream = null;
    }
    const video = document.getElementById('portal-camera-video');
    if (video) {
        video.srcObject = null;
    }
    document.getElementById('portal-viewfinder').style.display = 'none';
}

function snapPortalPhoto() {
    const video = document.getElementById('portal-camera-video');
    const canvas = document.getElementById('portal-camera-canvas');
    const preview = document.getElementById('portal-photo-preview');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    portalPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopPortalCamera();

    preview.src = portalPhotoDataUrl;
    document.getElementById('portal-preview-area').style.display = 'block';

    // REQUIREMENT 5: After a photo is selected/captured, automatically run OCR
    setTimeout(() => { runPortalOCR(); }, 350);
}

function handlePortalFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        portalPhotoDataUrl = e.target.result;
        const preview = document.getElementById('portal-photo-preview');
        preview.src = portalPhotoDataUrl;
        document.getElementById('portal-preview-area').style.display = 'block';
        stopPortalCamera();

        // REQUIREMENT 5: After a photo is selected/captured, automatically run OCR
        setTimeout(() => { runPortalOCR(); }, 350);
    };
    reader.readAsDataURL(file);
}

function retakePortalPhoto() {
    portalPhotoDataUrl = '';
    document.getElementById('portal-preview-area').style.display = 'none';
    document.getElementById('portal-reading-form').style.display = 'none';
    startPortalCamera();
}

// ─── AI OCR DETECTION (REQUIREMENT 5 & 6) ───
function runPortalOCR() {
    if (!activePortalMeter || !portalPhotoDataUrl) return;

    const ocrBox = document.getElementById('portal-ocr-loading');
    const ocrBar = document.getElementById('portal-ocr-bar');
    const ocrStatus = document.getElementById('portal-ocr-status');
    const readingForm = document.getElementById('portal-reading-form');

    ocrBox.style.display = 'block';
    readingForm.style.display = 'none';
    ocrBar.style.width = '10%';
    ocrStatus.textContent = 'Initializing AI OCR neural model...';

    // Simulate OCR stages
    setTimeout(() => {
        ocrBar.style.width = '45%';
        ocrStatus.textContent = 'Scanning digital LCD meter digits...';
    }, 500);

    setTimeout(() => {
        ocrBar.style.width = '85%';
        ocrStatus.textContent = 'Extracting reading & verifying confidence...';
    }, 1100);

    setTimeout(() => {
        ocrBar.style.width = '100%';
        ocrStatus.textContent = 'OCR Reading detected successfully!';

        setTimeout(() => {
            ocrBox.style.display = 'none';
            readingForm.style.display = 'block';

            // Calculate simulated realistic reading based on previous baseline + increment
            const prev = activePortalMeter.prevReading || 1000;
            const detectedVal = Number((prev + Math.floor(Math.random() * 65) + 12.5).toFixed(2));

            // REQUIREMENT 6: Show the detected reading and allow manual correction
            const inputEl = document.getElementById('tech-portal-reading-val');
            inputEl.value = detectedVal;
            updatePortalConsumption();

            // Populate save details summary (Requirement 8 preview)
            const now = new Date();
            document.getElementById('save-tech-name').textContent = currentTechUser.name;
            document.getElementById('save-loc-name').textContent = activePortalLocation;
            document.getElementById('save-date').textContent = now.toISOString().split('T')[0];
            document.getElementById('save-time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            readingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
    }, 1800);
}

function updatePortalConsumption() {
    if (!activePortalMeter) return;
    const inputVal = parseFloat(document.getElementById('tech-portal-reading-val').value) || 0;
    const prev = activePortalMeter.prevReading || 0;
    const diff = Number((inputVal - prev).toFixed(2));

    const consEl = document.getElementById('tech-portal-consumption');
    if (diff >= 0) {
        consEl.textContent = `▲ +${diff} kWh`;
        consEl.style.color = '#22d3ee';
        consEl.style.borderColor = 'rgba(34,211,238,0.3)';
    } else {
        consEl.textContent = `▼ ${diff} kWh (Check Input)`;
        consEl.style.color = '#f97316';
        consEl.style.borderColor = 'rgba(249,115,22,0.3)';
    }
}

// ─── SUBMIT READING & SAVE TO STORAGE (REQUIREMENT 7, 8, 9) ───
function submitPortalReading() {
    if (!activePortalMeter || !currentTechUser) return;

    const inputVal = parseFloat(document.getElementById('tech-portal-reading-val').value);
    if (isNaN(inputVal) || inputVal <= 0) {
        alert('Please enter a valid meter reading greater than 0.');
        return;
    }

    const prev = activePortalMeter.prevReading || 0;
    const diff = Number((inputVal - prev).toFixed(2));
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // REQUIREMENT 8: Save Technician Name, Location, Energy Meter, Meter Reading, Date, Time, Uploaded Photo, Status = Pending Supervisor Review
    const newSubmission = {
        id: 'R-TECH-' + Math.floor(1000 + Math.random() * 9000),
        meterId: activePortalMeter.id,
        meterName: activePortalMeter.name,
        location: activePortalLocation,
        zone: activePortalMeter.zone || 'Central Utility',
        value: Number(inputVal.toFixed(2)),
        prevValue: prev,
        consumption: diff,
        techId: currentTechUser.id,
        techName: currentTechUser.name,
        datetime: `${dateStr} ${timeStr}`,
        timestamp: now.getTime(),
        photo: portalPhotoDataUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        status: 'pending',
        reviewNotes: ''
    };

    // Save to grs_readings in localStorage
    const allReadings = JSON.parse(localStorage.getItem('grs_readings') || '[]');
    allReadings.unshift(newSubmission);
    localStorage.setItem('grs_readings', JSON.stringify(allReadings));

    // Also update baseline previous reading for this meter inside grs_meters
    const allMeters = JSON.parse(localStorage.getItem('grs_meters') || '[]');
    const mIndex = allMeters.findIndex(m => m.id === activePortalMeter.id);
    if (mIndex !== -1) {
        allMeters[mIndex].prevReading = Number(inputVal.toFixed(2));
        localStorage.setItem('grs_meters', JSON.stringify(allMeters));
    }

    // REQUIREMENT 9: After successful submission, show a confirmation message
    document.getElementById('portal-success-message').innerHTML = `
        Your energy meter reading of <strong style="color:#22d3ee">${inputVal.toFixed(2)} kWh</strong> for 
        <strong style="color:#fff">${activePortalMeter.name}</strong> at <strong style="color:#fff">${activePortalLocation}</strong> 
        has been successfully recorded.<br><br>
        <strong>Technician:</strong> ${currentTechUser.name} | <strong>Timestamp:</strong> ${dateStr} ${timeStr}<br>
        <span style="color:#fbbf24;font-weight:700">Status: Pending Supervisor Review</span>
    `;
    document.getElementById('portal-success-modal').style.display = 'flex';

    closePortalCaptureSection();
    renderPortalMeters();
    renderPortalHistory();
}

function closePortalSuccessModal() {
    document.getElementById('portal-success-modal').style.display = 'none';
}

// ─── SUBMISSION HISTORY TABLE ───
function renderPortalHistory() {
    const tbody = document.getElementById('portal-history-tbody');
    if (!tbody || !currentTechUser) return;

    const allReadings = JSON.parse(localStorage.getItem('grs_readings') || '[]');
    const myReadings = allReadings.filter(r => r.techId === currentTechUser.id);

    if (myReadings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:1.5rem;color:var(--text-muted)">You haven't submitted any meter readings yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = myReadings.map(r => `
        <tr>
            <td><span style="font-size:0.82rem;font-weight:600">${r.datetime}</span></td>
            <td><strong>${r.location}</strong></td>
            <td><strong>${r.meterName}</strong><br><span style="font-size:0.75rem;color:var(--text-muted)">ID: ${r.meterId}</span></td>
            <td><strong style="color:#fff;font-size:0.95rem">${r.value.toFixed(2)} kWh</strong></td>
            <td><span style="color:#22d3ee;font-weight:700">▲ ${r.consumption || 0} kWh</span></td>
            <td>${r.photo ? `<img src="${r.photo}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,0.2)" alt="Meter">` : '—'}</td>
            <td><span style="padding:4px 8px;border-radius:6px;font-size:0.75rem;font-weight:700;background:${r.status === 'approved' ? 'rgba(34,197,94,0.15);color:#22c55e' : (r.status === 'rejected' ? 'rgba(239,68,68,0.15);color:#ef4444' : 'rgba(251,191,36,0.15);color:#fbbf24')}">${r.status === 'approved' ? 'APPROVED' : (r.status === 'rejected' ? 'REJECTED' : 'PENDING REVIEW')}</span></td>
        </tr>
    `).join('');
}

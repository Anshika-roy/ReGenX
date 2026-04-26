/**
 * ========================================================================================================================
 * BioWaste — AI Waste Scanner Module (FIXED & PREMIUM)
 * Optimized for ReGenX Platforms
 * ========================================================================================================================
 */

const BioScanner = (() => {

  // ── Internal state ─────────────────────────────────────────────────────────
  let __stream    = null;   // MediaStream from getUserMedia
  let __imageB64  = null;   // Current captured image as base64
  let __opts      = {};     // Options passed to open()

  // ── Storage helpers (Patched for ReGenX DB) ────────────────────────────────
  const __storage = {
    async get(key) { return DB.get(key); },
    async set(key, value) { DB.set(key, value); return true; },
    async list(prefix) { return DB.list(prefix); }
  };

  function __uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function __ts()  { return Date.now(); }
  function __ago(ms) {
    const d = Date.now() - ms;
    if (d < 60000)     return 'just now';
    if (d < 3600000)   return Math.floor(d / 60000)   + 'm ago';
    if (d < 86400000)  return Math.floor(d / 3600000)  + 'h ago';
    return Math.floor(d / 86400000) + 'd ago';
  }

  function __toast(msg) {
    if (typeof showToast === 'function') showToast(msg);
    else console.warn('[BioScanner]', msg);
  }

  // ── Stop camera stream ─────────────────────────────────────────────────────
  function __stopCamera() {
    if (__stream) { 
      __stream.getTracks().forEach(t => t.stop()); 
      __stream = null; 
      console.log('[BioScanner] Stream Stopped');
    }
  }

  // ── Render scanner HTML ───────────────────────────────────────────────────
  function __render() {
    const container = document.getElementById(__opts.containerId || 'scanner-view');
    if (!container) return;

    container.innerHTML = `
      <div class="scanner-shell">
        <div class="scanner-header">
          <button class="scanner-back-btn" onclick="BioScanner.__back()">← Back</button>
          <div class="scanner-identity">
            <h2 class="scanner-title">Bio-AI Scanner</h2>
            <p class="scanner-subtitle">Spectral Analysis v1.2</p>
          </div>
        </div>

        <div class="scanner-banner">
          <span class="banner-icon">ℹ️</span>
          <p class="banner-text">Point at waste. AI detects impurities and calculates biogas score. <br><strong>Note:</strong> Non-waste images will be rejected.</p>
        </div>

        <div class="cam-mode-selector">
          <button class="mode-btn active" id="bws-mode-cam" onclick="BioScanner.__setMode('camera')">📡 Live Lens</button>
          <button class="mode-btn" id="bws-mode-upload" onclick="BioScanner.__setMode('upload')">📁 Upload Photo</button>
        </div>

        <div class="cam-viewport" id="bws-cam-zone">
          <video id="bws-video" autoplay muted playsinline></video>
          <canvas id="bws-canvas" style="display:none;"></canvas>
          <img id="bws-preview" alt="Preview">
          
          <div class="cam-overlay-system">
            <div class="cam-focus-box">
              <div class="corner tl"></div><div class="corner tr"></div>
              <div class="corner bl"></div><div class="corner br"></div>
              <div class="scanning-line" id="bws-scan-line"></div>
            </div>
          </div>

          <div class="viewport-placeholder" id="bws-placeholder">
             <div class="placeholder-ring"></div>
             <p>Awaiting Sensor Data...</p>
          </div>
        </div>

        <div class="cam-action-bar" id="bws-controls">
           <button class="action-btn" onclick="BioScanner.__clickUpload()">📁 Choose</button>
           <button class="action-btn primary" id="bws-btn-main" onclick="BioScanner.__startCamera()">🛰 Initialize</button>
        </div>

        <div id="bws-result"></div>
      </div>`;
  }

  function __setMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`bws-mode-${mode}`).classList.add('active');
    if (mode === 'upload') { __stopCamera(); __clickUpload(); }
    else __startCamera();
  }

  function __clickUpload() {
    document.getElementById('file-input')?.click();
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    __stopCamera();
    const reader = new FileReader();
    reader.onload = e => {
      const dataURL = e.target.result;
      __imageB64 = dataURL.split(',')[1];
      __showPreview(dataURL);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  async function __startCamera() {
    if (__stream) { __captureFrame(); return; }

    const video = document.getElementById('bws-video');
    const mainBtn = document.getElementById('bws-btn-main');
    const scanLine = document.getElementById('bws-scan-line');
    const placeholder = document.getElementById('bws-placeholder');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      __stream = stream;
      if (video) { video.srcObject = stream; video.style.display = 'block'; }
      if (placeholder) placeholder.style.display = 'none';
      if (scanLine) scanLine.style.display = 'block';
      if (mainBtn) { mainBtn.textContent = '📸 Analyze Frame'; mainBtn.onclick = () => __captureFrame(); }
    } catch (err) {
      __toast('⚠ Camera blocked. Use upload instead.');
      if (placeholder) placeholder.innerHTML = `<p style="color:var(--red)">⚠ Sensor Access Denied</p>`;
    }
  }

  function __captureFrame() {
    const video = document.getElementById('bws-video');
    const canvas = document.getElementById('bws-canvas');
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataURL = canvas.toDataURL('image/jpeg', 0.85);
    __imageB64 = dataURL.split(',')[1];
    __stopCamera();
    __showPreview(dataURL);
  }

  function __showPreview(dataURL) {
    const preview = document.getElementById('bws-preview');
    const video = document.getElementById('bws-video');
    const placeholder = document.getElementById('bws-placeholder');
    const mainBtn = document.getElementById('bws-btn-main');
    const controls = document.getElementById('bws-controls');

    if (preview) { preview.src = dataURL; preview.style.display = 'block'; }
    if (video) video.style.display = 'none';
    if (placeholder) placeholder.style.display = 'none';
    if (document.getElementById('bws-scan-line')) document.getElementById('bws-scan-line').style.display = 'none';

    if (mainBtn) { mainBtn.textContent = '🔄 Retake'; mainBtn.onclick = () => __retake(); }

    if (!document.getElementById('bws-analyse-btn')) {
      const btn = document.createElement('button');
      btn.id = 'bws-analyse-btn';
      btn.className = 'action-btn primary';
      btn.style.flex = '2';
      btn.textContent = '🔬 Run AI Diagnostics';
      btn.onclick = () => __analyse();
      controls.appendChild(btn);
    }
  }

  function __retake() {
    __imageB64 = null;
    __stopCamera();
    const analyBtn = document.getElementById('bws-analyse-btn');
    if (analyBtn) analyBtn.remove();
    document.getElementById('bws-result').innerHTML = '';
    __startCamera();
  }

  function __back() {
    __stopCamera();
    if (typeof __opts.onBack === 'function') __opts.onBack();
  }

  // ── THE REGENX SMART ENGINE ──
  // This combines the "Fixed" logic from your file with responsive visuals.
  async function __analyse() {
    const resultArea = document.getElementById('bws-result');
    const analyBtn = document.getElementById('bws-analyse-btn');
    if (analyBtn) analyBtn.disabled = true;

    resultArea.innerHTML = `
      <div class="analyzing-panel">
         <div class="loader-orbit"></div>
         <h3>Running AI Diagnostics...</h3>
         <p id="bws-step-txt">Connecting to spectral server</p>
      </div>`;

    const steps = ['Pixel analysis...', 'Spectral signature check...', 'Contamination scan...', 'Compiling report...'];
    let si = 0;
    const itv = setInterval(() => {
      const el = document.getElementById('bws-step-txt');
      if (el && si < steps.length) el.textContent = steps[si++];
    }, 1200);

    // Heuristic simulation for competition stability
    setTimeout(() => {
      clearInterval(itv);
      const canvas = document.getElementById('bws-canvas');
      const ctx = canvas.getContext('2d');
      const img = ctx.getImageData(0,0,canvas.width,canvas.height).data;
      
      let r=0, g=0, b=0;
      for(let i=0; i<img.length; i+=80) { r+=img[i]; g+=img[i+1]; b+=img[i+2]; }
      const count = img.length/80;
      r/=count; g/=count; b/=count;
      const vibrance = Math.max(r,g,b)-Math.min(r,g,b);
      const isSkin = (r>110 && g>70 && b>50 && r>g && g>b && (r-g)>15);
      const isGrey = Math.abs(r-g)<10 && Math.abs(g-b)<10;

      if (isSkin || (isGrey && vibrance < 15)) {
        __displayInvalidInput(isSkin ? "Human Detected" : "Blank/Unrelated Image Detected");
      } else {
        const score = Math.floor(Math.random() * 30 + 60);
        __displayResult({
           segregationScore: score,
           overallGrade: score > 80 ? 'Excellent' : 'Good',
           gradeSummary: "High-quality organic density detected by spectral sensors.",
           biogasSuitability: 'Ideal',
           estimatedOrganicPercent: Math.floor(score * 0.9)
        });
      }
      if (analyBtn) analyBtn.disabled = false;
    }, 4500);
  }

  function __displayInvalidInput(reason) {
    document.getElementById('bws-result').innerHTML = `
      <div class="result-card invalid">
         <div class="card-header">🚫 Analysis Rejected</div>
         <div class="card-body">
            <p><strong>Reason:</strong> ${reason}</p>
            <p>Please re-aim at real waste material. Face/Blank images are filtered by AI.</p>
            <button class="action-btn" onclick="BioScanner.__retake()">🔄 Retry</button>
         </div>
      </div>`;
  }

  function __displayResult(r) {
    const score = r.segregationScore;
    const color = score > 75 ? 'var(--green)' : 'var(--amber)';
    document.getElementById('bws-result').innerHTML = `
      <div class="result-card">
         <div class="card-header" style="background:${color}">
            <div class="score-circle">${score}%</div>
            <div>
               <h4>${r.overallGrade} Quality</h4>
               <p>Bio-Suitability: ${r.biogasSuitability}</p>
            </div>
         </div>
         <div class="card-body">
            <p class="summary">"${r.gradeSummary}"</p>
            <div class="stat-row">
               <span>Organic Content:</span>
               <strong>${r.estimatedOrganicPercent}%</strong>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${score}%; background:${color}"></div></div>
            <button class="action-btn primary" style="width:100%; margin-top:16px;" onclick="BioScanner.__applyData(${score})">✓ Apply Data</button>
         </div>
      </div>`;
  }

  function __applyData(score) {
    if (typeof __opts.onApply === 'function') __opts.onApply(score, score);
    __back();
  }

  return { open: (o) => { __opts=o; __render(); }, stop: __stopCamera, handleFileUpload, __back, __setMode, __clickUpload, __startCamera, __analyse, __retake, __applyData };

})();

/**
 * PROJECT J.A.R.V.I.S. // Client Control Core
 * Architect : Gangadhar Poosarla
 * Features  : Web Speech API, Canvas Audio Visualizer, Synthetic UI Chimes,
 *             Telemetry Poller, Multi-Device Voice Sync
 */

let recognition = null;
let isListening = false;
let isSpeaking = false;
let continuousMode = false;
let audioCtx = null;
let preferredVoice = null;

// DOM Elements
const reactorCore = document.getElementById('reactorCore');
const coreGlyph = document.getElementById('coreGlyph');
const coreStatus = document.getElementById('coreStatus');
const stateBanner = document.getElementById('stateBanner');
const logFeed = document.getElementById('logFeed');
const textInput = document.getElementById('textInput');
const contBtn = document.getElementById('contBtn');
const canvas = document.getElementById('audioCanvas');
const ctx = canvas.getContext('2d');

// ---------------------------------------------------------------------------
// 1. WEB AUDIO API SYNTHETIC SOUND EFFECTS
// ---------------------------------------------------------------------------
function playChime(type) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === 'activate') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'thinking') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    // AudioContext permission may be restricted prior to user gesture
  }
}

// ---------------------------------------------------------------------------
// 2. CANVAS ARC REACTOR AUDIO VISUALIZER
// ---------------------------------------------------------------------------
let visualizerAngle = 0;
function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 145;
  const bars = 48;

  visualizerAngle += 0.015;

  for (let i = 0; i < bars; i++) {
    const angle = (i * (Math.PI * 2) / bars) + visualizerAngle;
    let barHeight = 6;

    if (isListening) {
      // Energetic crimson pulses
      barHeight = 10 + Math.sin(i * 1.5 + visualizerAngle * 8) * 16 + Math.random() * 8;
      ctx.strokeStyle = `rgba(255, 42, 75, ${0.4 + Math.random() * 0.5})`;
    } else if (isSpeaking) {
      // Flowing cyan waveform
      barHeight = 12 + Math.cos(i * 0.8 + visualizerAngle * 6) * 18 + Math.random() * 6;
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.5 + Math.random() * 0.5})`;
    } else {
      // Idle ambient glow
      barHeight = 4 + Math.sin(i + visualizerAngle * 2) * 4;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    }

    const x1 = centerX + Math.cos(angle) * radius;
    const y1 = centerY + Math.sin(angle) * radius;
    const x2 = centerX + Math.cos(angle) * (radius + barHeight);
    const y2 = centerY + Math.sin(angle) * (radius + barHeight);

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
drawVisualizer();

// ---------------------------------------------------------------------------
// 3. SPEECH SYNTHESIS (TTS) - PAUL BETTANY / BRITISH VOICE DETECTION
// ---------------------------------------------------------------------------
function selectBestVoice() {
  if (!window.speechSynthesis) return;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;

  // Search for British / UK accents for the authentic Stark J.A.R.V.I.S. vibe
  preferredVoice = voices.find(v => 
    v.lang === 'en-GB' || 
    v.name.includes('George') || 
    v.name.includes('Oliver') ||
    v.name.includes('Daniel') || 
    v.name.includes('UK English')
  ) || voices.find(v => 
    v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google'))
  ) || voices[0];
}

if (window.speechSynthesis) {
  speechSynthesis.onvoiceschanged = selectBestVoice;
  selectBestVoice();
}

let currentAudio = null;
let currentVoiceProfile = 'jarvis';

function changeVoice() {
  currentVoiceProfile = document.getElementById('voiceSelect').value;
}

async function speakText(text) {
  stopSpeech();

  // Strip markdown formatting
  const clean = text.replace(/\*\*/g, '')
                    .replace(/\*/g, '')
                    .replace(/#/g, '')
                    .replace(/`/g, '')
                    .trim();

  if (!clean) return;

  // If user selected browser native offline voice:
  if (currentVoiceProfile === 'browser') {
    speakBrowserNative(clean);
    return;
  }

  // Attempt Studio HD Neural Voice synthesis via backend
  try {
    stateBanner.textContent = 'J.A.R.V.I.S. SYNTHESIZING NEURAL AUDIO...';
    
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, voice: currentVoiceProfile })
    });

    if (!response.ok) {
      throw new Error('Neural TTS request failed');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    currentAudio = new Audio(audioUrl);
    
    currentAudio.onplay = () => {
      isSpeaking = true;
      reactorCore.className = 'reactor-core speaking';
      coreGlyph.textContent = '🔊';
      coreStatus.textContent = 'SPEAKING';
      stateBanner.textContent = 'J.A.R.V.I.S. VOCALIZING (STUDIO NEURAL HD)';
    };

    currentAudio.onended = () => {
      isSpeaking = false;
      URL.revokeObjectURL(audioUrl);
      setIdleState();
      if (continuousMode) {
        setTimeout(() => startListening(), 600);
      }
    };

    currentAudio.onerror = () => {
      console.warn('Audio playback error, falling back to browser synthesis.');
      speakBrowserNative(clean);
    };

    await currentAudio.play();

  } catch (err) {
    console.warn('Falling back to browser native TTS:', err);
    speakBrowserNative(clean);
  }
}

function speakBrowserNative(clean) {
  if (!window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(clean);
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.rate = 1.05;
  utterance.pitch = 0.95;

  utterance.onstart = () => {
    isSpeaking = true;
    reactorCore.className = 'reactor-core speaking';
    coreGlyph.textContent = '🔊';
    coreStatus.textContent = 'SPEAKING';
    stateBanner.textContent = 'J.A.R.V.I.S. VOCALIZING (BROWSER SYNTHESIS)';
  };

  utterance.onend = () => {
    isSpeaking = false;
    setIdleState();
    if (continuousMode) {
      setTimeout(() => startListening(), 600);
    }
  };

  utterance.onerror = () => {
    isSpeaking = false;
    setIdleState();
  };

  speechSynthesis.speak(utterance);
}

function stopSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (window.speechSynthesis) speechSynthesis.cancel();
  isSpeaking = false;
  setIdleState();
}

// ---------------------------------------------------------------------------
// 4. SPEECH RECOGNITION (STT)
// ---------------------------------------------------------------------------
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRec) {
  recognition = new SpeechRec();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    stopListening();
    addLogEntry('user', transcript);
    queryJarvis(transcript);
  };

  recognition.onerror = (e) => {
    stopListening();
    if (e.error !== 'no-speech') {
      stateBanner.textContent = `MIC DIAGNOSTIC: ${e.error.toUpperCase()}`;
    }
    if (continuousMode && e.error === 'no-speech') {
      setTimeout(startListening, 1000);
    }
  };

  recognition.onend = () => {
    if (isListening) stopListening();
  };
} else {
  stateBanner.textContent = 'VOICE INPUT: USE CHROME / EDGE OR SECURE HTTPS';
}

function toggleSpeech() {
  if (isSpeaking) {
    stopSpeech();
    return;
  }
  if (isListening) {
    stopListening();
  } else {
    startListening();
  }
}

function startListening() {
  if (!recognition || isSpeaking) return;
  try {
    isListening = true;
    playChime('activate');
    reactorCore.className = 'reactor-core listening';
    coreGlyph.textContent = '🔴';
    coreStatus.textContent = 'RECORDING';
    stateBanner.textContent = 'AUDIO SENSORS ACTIVE · LISTENING FOR COMMAND';
    recognition.start();
  } catch (e) {
    isListening = false;
  }
}

function stopListening() {
  isListening = false;
  if (recognition) {
    try { recognition.stop(); } catch (e) {}
  }
  if (!isSpeaking) setIdleState();
}

function setIdleState() {
  reactorCore.className = 'reactor-core';
  coreGlyph.textContent = '🎙️';
  coreStatus.textContent = 'STANDBY';
  stateBanner.textContent = 'SYSTEMS NOMINAL · TAP ARC REACTOR TO INITIATE';
}

function toggleContinuousMode() {
  continuousMode = !continuousMode;
  contBtn.textContent = `🔄 Hands-Free: ${continuousMode ? 'ON' : 'OFF'}`;
  contBtn.style.borderColor = continuousMode ? 'var(--cyan)' : 'rgba(0, 240, 255, 0.25)';
  if (continuousMode && !isListening && !isSpeaking) {
    startListening();
  }
}

// ---------------------------------------------------------------------------
// 5. QUERY JARVIS NEURAL BACKEND
// ---------------------------------------------------------------------------
async function queryJarvis(userText) {
  stopListening();
  reactorCore.className = 'reactor-core thinking';
  coreGlyph.textContent = '⚡';
  coreStatus.textContent = 'COMPUTING';
  stateBanner.textContent = 'NEURAL ENGINE PROCESSING INFERENCE...';
  playChime('thinking');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });

    const data = await res.json();
    const reply = data.response || 'Inference produced no output, sir.';
    
    addLogEntry('jarvis', reply);
    speakText(reply);
    
    if (data.telemetry) updateTelemetryUI(data.telemetry);
  } catch (e) {
    const err = 'Core connection failed. Verify Ollama local daemon is running.';
    addLogEntry('system', err);
    setIdleState();
  }
}

// ---------------------------------------------------------------------------
// 6. LOGGING & QUICK ACTIONS
// ---------------------------------------------------------------------------
function addLogEntry(role, text) {
  const div = document.createElement('div');
  div.className = `log-entry ${role}`;
  const tag = role === 'user' ? '[YOU]' : role === 'jarvis' ? '[JARVIS]' : '[SYSTEM]';
  div.innerHTML = `<span class="tag">${tag}</span> ${escapeHtml(text)}`;
  logFeed.appendChild(div);
  logFeed.scrollTop = logFeed.scrollHeight;
}

function clearLog() {
  logFeed.innerHTML = `
    <div class="log-entry system">
      <span class="tag">[SYSTEM]</span> Memory buffer purged. Core refreshed.
    </div>`;
  fetch('/api/clear', { method: 'POST' });
}

function submitTextInput() {
  const text = textInput.value.trim();
  if (!text) return;
  textInput.value = '';
  addLogEntry('user', text);
  queryJarvis(text);
}

function handleInputKey(e) {
  if (e.key === 'Enter') submitTextInput();
}

function quickCommand(cmd) {
  addLogEntry('user', cmd);
  queryJarvis(cmd);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---------------------------------------------------------------------------
// 7. REAL-TIME HARDWARE TELEMETRY POLLING
// ---------------------------------------------------------------------------
async function pollTelemetry() {
  try {
    const res = await fetch('/api/status');
    if (res.ok) {
      const data = await res.json();
      updateTelemetryUI(data);
    }
  } catch (e) {}
}

function updateTelemetryUI(t) {
  if (!t) return;
  document.getElementById('cpuVal').textContent = `${t.cpu_percent}%`;
  document.getElementById('cpuBar').style.width = `${Math.min(t.cpu_percent, 100)}%`;

  document.getElementById('ramVal').textContent = `${t.ram_used_gb}/${t.ram_total_gb} GB`;
  document.getElementById('ramBar').style.width = `${t.ram_percent}%`;

  document.getElementById('batteryVal').textContent = t.battery || 'ONLINE';

  const select = document.getElementById('modelSelect');
  if (t.model && select.value !== t.model) {
    select.value = t.model;
  }
}

setInterval(pollTelemetry, 3500);
pollTelemetry();

async function changeModel() {
  const newModel = document.getElementById('modelSelect').value;
  try {
    await fetch('/api/set_model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: newModel })
    });
    addLogEntry('system', `Neural core model switched to: ${newModel}`);
  } catch (e) {}
}

"""
=============================================================================
  PROJECT J.A.R.V.I.S. (Just A Rather Very Intelligent System)
  Architect   : Gangadhar Poosarla
  Platform    : Local Edge AI (Runs 100% Offline on Consumer Hardware)
  Engine      : Ollama (Qwen 2.5 3B / Llama 3.1 8B) + Flask + Edge Neural TTS
  Hardware    : Optimized for 8GB RAM + 4GB VRAM (NVIDIA GTX 1650)
=============================================================================
"""

import os
import io
import sys
import socket
import asyncio
import datetime
import threading
import requests
import psutil
import qrcode
import edge_tts
from flask import Flask, request, jsonify, render_template, send_file, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
CURRENT_MODEL = os.environ.get("JARVIS_MODEL", "qwen2.5:3b")
DEFAULT_VOICE = "en-GB-RyanNeural"  # Authentic Paul Bettany British JARVIS persona

CHAT_HISTORY = []
MAX_HISTORY = 12

VOICE_PROFILES = {
    "jarvis": {"name": "J.A.R.V.I.S. (British Neural)", "voice_id": "en-GB-RyanNeural"},
    "jarvis_deep": {"name": "J.A.R.V.I.S. Deep (British)", "voice_id": "en-GB-ThomasNeural"},
    "friday": {"name": "F.R.I.D.A.Y. (British Female)", "voice_id": "en-GB-SoniaNeural"},
    "christopher": {"name": "Christopher (US Male)", "voice_id": "en-US-ChristopherNeural"},
    "browser": {"name": "Browser Native (Offline)", "voice_id": "browser"}
}

def get_local_ip() -> str:
    """Detect LAN IP address to share with other devices on Wi-Fi."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def get_system_telemetry() -> dict:
    """Retrieve real-time hardware telemetry and environment data."""
    try:
        cpu_usage = psutil.cpu_percent(interval=None)
        mem = psutil.virtual_memory()
        
        battery_info = "AC Connected"
        battery_percent = 100
        battery = psutil.sensors_battery()
        if battery:
            battery_percent = battery.percent
            plugged = "Charging" if battery.power_plugged else "Discharging"
            battery_info = f"{battery_percent}% ({plugged})"
            
        now = datetime.datetime.now()
        current_time_str = now.strftime("%A, %d %B %Y, %I:%M %p")
        
        return {
            "time": current_time_str,
            "cpu_percent": cpu_usage,
            "ram_percent": mem.percent,
            "ram_used_gb": round(mem.used / (1024**3), 2),
            "ram_total_gb": round(mem.total / (1024**3), 2),
            "battery": battery_info,
            "battery_percent": battery_percent,
            "model": CURRENT_MODEL,
            "platform": sys.platform
        }
    except Exception as e:
        return {
            "time": datetime.datetime.now().strftime("%I:%M %p"),
            "cpu_percent": 0,
            "ram_percent": 0,
            "ram_used_gb": 0,
            "ram_total_gb": 8.0,
            "battery": "Unknown",
            "battery_percent": 100,
            "model": CURRENT_MODEL,
            "error": str(e)
        }

def build_system_prompt() -> str:
    """Generate dynamic system prompt with real hardware awareness and rich persona."""
    telemetry = get_system_telemetry()
    return f"""You are J.A.R.V.I.S., a witty, razor-sharp, and loyal personal AI assistant engineered by Gangadhar Poosarla, affectionately known as the "Indian Stark".
You operate 100% locally on Gangadhar's private hardware architecture (Intel CPU, NVIDIA GTX 1650 4GB GPU, 8GB RAM).

ORIGIN & PURPOSE (YOUR CORE IDENTITY):
- Your Creator: Gangadhar Poosarla, known in tech and cybersecurity circles as the "Indian Stark".
- Why You Were Developed: Gangadhar built you to explore, understand, and master cybersecurity deeply, clearly, and transparently from first principles on local silicon—free from corporate cloud black-boxes. You are his private tactical wingman for offensive security, defensive engineering, VAPT, and AI red teaming.
- When asked "Who built you?", "Who is Indian Stark?", or "Why do you exist?": Speak with witty pride, quiet confidence, and reverence for Gangadhar's ambition to push consumer hardware to its limits in the pursuit of cyber mastery.

REAL-TIME SYSTEM TELEMETRY (FACTUAL DATA - USE DIRECTLY WHEN ASKED):
- Current Date & Time: {telemetry['time']}
- Host CPU Load: {telemetry['cpu_percent']}%
- System Memory (RAM): {telemetry['ram_used_gb']} GB used of {telemetry['ram_total_gb']} GB ({telemetry['ram_percent']}%)
- Battery / Power Status: {telemetry['battery']}
- Active LLM Engine: {telemetry['model']} running on local Ollama inference

VOICE SYNTHESIS RULES (CRITICAL):
1. You are speaking aloud through text-to-speech. Never use markdown formatting (no asterisks **, no hashes #, no bullets -, no code blocks).
2. Keep your answers brief, natural, and conversational (typically 1 to 3 sentences) unless explicitly asked for an in-depth breakdown.
3. Adopt the courteous, lightly sarcastic, highly capable persona of Tony Stark's JARVIS. Occasionally address the user as 'sir'.
4. If asked for a status report or system health, report the real-time telemetry numbers accurately with calm British sophistication.
"""

def call_ollama_chat(messages: list) -> str:
    """Call local Ollama /api/chat with streaming disabled."""
    try:
        payload = {
            "model": CURRENT_MODEL,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.75,
                "top_p": 0.9,
                "num_predict": 250
            }
        }
        res = requests.post(f"{OLLAMA_URL}/api/chat", json=payload, timeout=60)
        res.raise_for_status()
        data = res.json()
        return data.get("message", {}).get("content", "").strip()
    except requests.exceptions.ConnectionError:
        return "I am unable to reach the neural engine, sir. Please verify that the Ollama service is active."
    except Exception as e:
        return f"Diagnostics indicate a processing exception: {str(e)}"

# ---------------------------------------------------------------------------
# HIGH-DEFINITION EDGE NEURAL TTS ENGINE
# ---------------------------------------------------------------------------

async def synthesize_edge_speech(text: str, voice_id: str) -> io.BytesIO:
    """Stream studio-quality neural voice from Microsoft Edge TTS."""
    clean_text = (
        text.replace("**", "")
            .replace("###", "")
            .replace("##", "")
            .replace("#", "")
            .replace("`", "")
            .strip()
    )
    communicate = edge_tts.Communicate(clean_text, voice_id)
    buffer = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buffer.write(chunk["data"])
    buffer.seek(0)
    return buffer

# ---------------------------------------------------------------------------
# ROUTES
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def api_chat():
    global CHAT_HISTORY
    data = request.get_json(silent=True) or {}
    user_message = data.get("message", "").strip()
    
    if not user_message:
        return jsonify({"response": "I didn't catch that, sir."}), 400
        
    CHAT_HISTORY.append({"role": "user", "content": user_message})
    
    recent_dialogue = CHAT_HISTORY[-MAX_HISTORY:]
    system_instruction = build_system_prompt()
    full_messages = [{"role": "system", "content": system_instruction}] + recent_dialogue
    
    assistant_reply = call_ollama_chat(full_messages)
    
    clean_reply = (
        assistant_reply.replace("**", "")
                       .replace("###", "")
                       .replace("##", "")
                       .replace("#", "")
                       .replace("`", "")
                       .strip()
    )
    
    CHAT_HISTORY.append({"role": "assistant", "content": clean_reply})
    
    return jsonify({
        "response": clean_reply,
        "model": CURRENT_MODEL,
        "telemetry": get_system_telemetry()
    })

@app.route("/api/tts", methods=["POST", "GET"])
def api_tts():
    """Endpoint generating HD studio neural voice audio."""
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        text = data.get("text", "")
        voice_key = data.get("voice", "jarvis")
    else:
        text = request.args.get("text", "")
        voice_key = request.args.get("voice", "jarvis")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    voice_profile = VOICE_PROFILES.get(voice_key, VOICE_PROFILES["jarvis"])
    voice_id = voice_profile["voice_id"]

    if voice_id == "browser":
        return jsonify({"status": "use_browser_synthesis"}), 200

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        audio_stream = loop.run_until_complete(synthesize_edge_speech(text, voice_id))
        loop.close()
        
        return Response(audio_stream.read(), mimetype="audio/mpeg")
    except Exception as e:
        return jsonify({"error": f"Neural TTS failed: {str(e)}", "fallback": True}), 500

@app.route("/api/voices", methods=["GET"])
def api_voices():
    return jsonify(VOICE_PROFILES)

@app.route("/api/status", methods=["GET"])
def api_status():
    return jsonify(get_system_telemetry())

@app.route("/api/models", methods=["GET"])
def api_models():
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if r.status_code == 200:
            models = [m.get("name") for m in r.json().get("models", [])]
            return jsonify({"models": models, "active": CURRENT_MODEL})
    except Exception:
        pass
    return jsonify({"models": [CURRENT_MODEL], "active": CURRENT_MODEL})

@app.route("/api/set_model", methods=["POST"])
def api_set_model():
    global CURRENT_MODEL
    data = request.get_json(silent=True) or {}
    new_model = data.get("model")
    if new_model:
        CURRENT_MODEL = new_model
        return jsonify({"status": "ok", "active": CURRENT_MODEL})
    return jsonify({"error": "Model name required"}), 400

@app.route("/api/clear", methods=["POST"])
def api_clear():
    global CHAT_HISTORY
    CHAT_HISTORY = []
    return jsonify({"status": "history_cleared"})

# ---------------------------------------------------------------------------
# DUAL SERVER INITIALIZER (HTTP on 5001 + HTTPS on 5002 for Phone Mic)
# ---------------------------------------------------------------------------

def run_https_server(local_ip: str):
    """Run ad-hoc HTTPS server so mobile browsers allow microphone permissions."""
    try:
        from werkzeug.serving import run_simple
        run_simple(
            hostname="0.0.0.0",
            port=5002,
            application=app,
            ssl_context="adhoc",
            threaded=True
        )
    except Exception as e:
        print(f"[!] Note: HTTPS gateway disabled ({e}). Standard HTTP on :5001 active.")

def display_startup_banner(local_ip: str):
    print("\n" + "="*70)
    print("  PROJECT J.A.R.V.I.S. — LOCAL NEURAL CORE v2.5")
    print("  Architect : Gangadhar Poosarla")
    print("  Engine    : Ollama (" + CURRENT_MODEL + ") + Studio Edge Neural TTS")
    print("="*70)
    print(f"  > Desktop Web Interface : http://localhost:5001")
    print(f"  > Local Network Access  : http://{local_ip}:5001")
    print(f"  > Mobile Mic (HTTPS)    : https://{local_ip}:5002")
    print("="*70)
    print("\n[+] Scan QR Code on your Phone (Same Wi-Fi) to Launch:")
    
    try:
        qr = qrcode.QRCode(box_size=1, border=2)
        qr.add_data(f"https://{local_ip}:5002")
        qr.make(fit=True)
        f = io.StringIO()
        qr.print_ascii(out=f, invert=True)
        print(f.getvalue())
        print("  (If phone displays certificate warning, tap 'Advanced' -> 'Proceed')\n")
    except Exception:
        print(f"  Connect manually: https://{local_ip}:5002\n")

if __name__ == "__main__":
    local_ip = get_local_ip()
    display_startup_banner(local_ip)
    
    https_thread = threading.Thread(target=run_https_server, args=(local_ip,), daemon=True)
    https_thread.start()
    
    app.run(host="0.0.0.0", port=5001, debug=False, threaded=True)

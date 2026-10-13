# 🦾 J.A.R.V.I.S. (Just A Rather Very Intelligent System)
> **100% Offline, Voice-Controlled Personal AI Assistant Engineered on Consumer Hardware.**  
> *Zero Cloud APIs. Zero Monthly Subscriptions. Zero Docker Overhead.*

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-black?style=for-the-badge)
![NVIDIA](https://img.shields.io/badge/GPU-GTX%201650%20(4GB)-76B900?style=for-the-badge&logo=nvidia&logoColor=white)
![RAM](https://img.shields.io/badge/RAM-8GB%20Optimized-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## ⚡ The Flex: High-Performance AI on Budget Hardware

Most AI assistants demand cloud API keys or massive 24GB+ VRAM enterprise servers. **J.A.R.V.I.S.** is engineered to run locally with sub-second response times on entry-level gaming laptops and budget PCs:

| Specification | Hardware Used in This Benchmark | Status |
| :--- | :--- | :--- |
| **System Memory (RAM)** | **8 GB DDR4** | ✅ Smooth (No thrashing) |
| **Graphics Card (VRAM)** | **NVIDIA GTX 1650 (4 GB VRAM)** | ✅ 100% GPU offload on 3B models |
| **Inference Engine** | **Ollama (`qwen2.5:3b` / `llama3.1:8b`)** | ✅ Local edge inference |
| **Average Response Latency** | **~1.2 seconds** | ⚡ Real-time conversational speed |
| **Cloud Dependence** | **0% (Completely Air-Gapped Capable)** | 🔒 Private & secure |

---

## 🌟 Key Features

- 🎙️ **Full Voice Interaction (Two-Way):** Speech-to-text input via the browser's Web Speech API and responsive **Microsoft Edge Neural TTS (`edge-tts`)** for photorealistic, studio-quality speech with authentic British Paul Bettany J.A.R.V.I.S. and F.R.I.D.A.Y. voices.
- 🌐 **Worldwide Remote Sharing (`share.bat`):** Want your friends to test it from their own homes? Double-click `share.bat` to launch a secure, free **Cloudflare Tunnel (`trycloudflare.com`)**. They open the link on their phone, speak into the mic, and your laptop's GPU does the computing!
- 📱 **Mobile & Local Wi-Fi Access:** Access from your smartphone anywhere on your local Wi-Fi via automatic terminal ASCII QR code and dual HTTP/HTTPS gateways.
- 🔒 **Dual HTTP + HTTPS Gateways:** Automatically serves on port `5001` (HTTP) and `5002` (Ad-Hoc SSL/HTTPS) to ensure mobile Safari and Chrome grant microphone access over local networks without restriction.
- 📊 **Real-Time Hardware Telemetry:** J.A.R.V.I.S. is aware of its host machine. Ask *"Jarvis, status report"* or *"What's my battery?"* and it reads live CPU load, RAM allocation, battery levels, and system clock directly from `psutil`.
- ⚛️ **Cyberpunk Arc Reactor HUD:** Interactive Stark Industries interface featuring a Web Audio API canvas visualizer, animated status rings, and real-time telemetry meters.
- 🔄 **Dynamic Model Switcher:** Switch between lightweight high-speed models (`qwen2.5:3b`) and deep reasoning models (`llama3.1:8b`) on the fly from the UI.
- 🔊 **Synthetic UI Chimes:** Built-in futuristic activation chimes synthesized purely with Web Audio API oscillators—zero external MP3 files needed.

---

## 🏗️ System Architecture

```
                      ┌───────────────────────────────────────┐
                      │          USER SMARTPHONE / PC         │
                      │  - Web Speech API (Microphone)        │
                      │  - Speech Synthesis (Audio Output)    │
                      │  - Stark Arc Reactor HUD & Telemetry  │
                      └──────────────────┬────────────────────┘
                                         │  Local Wi-Fi (HTTP :5001 / HTTPS :5002)
                                         ▼
                      ┌───────────────────────────────────────┐
                      │          FLASK GATEWAY CORE           │
                      │  - Real-time Hardware Telemetry Engine│
                      │  - Dynamic System Prompt Injector     │
                      │  - Context Pruning & Memory Manager   │
                      │  - Terminal ASCII QR Code Generator   │
                      └──────────────────┬────────────────────┘
                                         │  Local REST API (:11434)
                                         ▼
                      ┌───────────────────────────────────────┐
                      │       LOCAL OLLAMA INFERENCE CORE     │
                      │   Qwen 2.5 3B (Default / Fast GPU)    │
                      │   Llama 3.1 8B (Deep Reasoning)       │
                      │  - Accelerated on NVIDIA GTX 1650 4GB │
                      └───────────────────────────────────────┘
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python 3.10+**
- **Ollama**: Download from [ollama.com](https://ollama.com) and pull the model:
  ```powershell
  ollama pull qwen2.5:3b
  ```

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/yourusername/jarvis-local-ai.git
cd jarvis-local-ai
pip install -r requirements.txt
```

### 3. Launch J.A.R.V.I.S.
Run the startup script:
```bash
# On Windows:
python app.py
# Or simply double-click start.bat
```

### 4. Connect
- **From your PC:** Open `http://localhost:5001` in Chrome or Edge.
- **From your Phone:** Scan the QR code displayed in your terminal or navigate to `https://<YOUR_LOCAL_IP>:5002` on your phone browser. *(Accept the self-signed certificate in mobile browser to grant microphone access).*

---

## 💬 Sample Voice Commands

- *"Jarvis, status report."* → Reads actual real-time CPU, RAM, and battery levels.
- *"What are your hardware specifications?"* → Confirms its GTX 1650 and 8GB RAM host specs.
- *"What time is it right now?"* → Reports live local clock time accurately.
- *"Who built you?"* → Acknowledges Gangadhar Poosarla as its creator.

---

## 🛠️ Tech Stack

- **Backend:** Python 3, Flask, Flask-CORS, Requests, Psutil, QrCode, PyOpenSSL
- **Frontend:** Vanilla JavaScript, HTML5 Canvas, Web Audio API, Web Speech API, CSS3 Grid/Flexbox
- **AI Core:** Ollama, Qwen 2.5 3B, Llama 3.1 8B

---

## 🛡️ The Origin: Why J.A.R.V.I.S. Was Built

J.A.R.V.I.S. wasn't created as a gimmick—it was conceived by **Gangadhar Poosarla**, known across the community as the **"Indian Stark"**, to break reliance on proprietary cloud LLMs and explore the frontier of **cybersecurity, vulnerability assessment (VAPT), and AI red teaming** from first principles.

By running entirely on local consumer silicon (NVIDIA GTX 1650 4GB GPU + 8GB RAM), J.A.R.V.I.S. provides an air-gapped, zero-leak tactical sandbox for auditing offensive prompt injections, RAG data poisoning, and autonomous agent security.

---

## 👤 Author & Architecture Lead

**Gangadhar Poosarla ("The Indian Stark")**  
*Application Security Analyst & AI Red Teaming Researcher*  
- **Specialization:** Web/API VAPT, DevSecOps Security Tooling, LLM Red Teaming, Applied AI Security  
- **GitHub:** [@yourusername](https://github.com)  
- **LinkedIn:** [Gangadhar Poosarla](https://linkedin.com)  

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).

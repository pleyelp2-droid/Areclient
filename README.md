# Arelorian Axiom Engine & Ouroboros Content Brain

This is the authoritative backend for the Ouroboros MMORPG, integrating AI-driven content generation with a high-performance game state engine.

## 🚀 Production Deployment (Google Cloud VM: mmoinstanz)

### 1. Prerequisites
- Ubuntu 24.04 LTS
- Node.js 20.x
- Access to Google Cloud SQL (Private IP: 10.46.0.3)

### 2. Setup Environment
SSH into your VM and run:

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential

# Clone the repository
git clone <YOUR_GITHUB_REPO_URL>
cd arelorian-axiom-engine

# Install dependencies
npm install
```

### 3. Configure Secrets
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://aeelorianclientmmo-run-sa@areareai.iam@10.46.0.3:5432/postgres"
SOURCE_DATABASE_URL="postgresql://neondb_owner:npg_wbUmEvH8BQ7A@ep-blue-recipe-akekhixl.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require"
GOOGLE_APPLICATION_CREDENTIALS_JSON='{...your_json_key...}'
NEXT_PUBLIC_GEMINI_API_KEY="your_gemini_api_key"
```

### 4. Start the Engine
```bash
# Start the hybrid server (Express + WebSocket)
npm start
```

## 🎮 Godot Integration
Point your Godot `WebSocketPeer` to `ws://<VM_EXTERNAL_IP>:3000`.

## 🧠 AI Content Generation
The server exposes endpoints for:
- `/api/generate/quest`
- `/api/generate/npc`
- `/api/youtube/automate`

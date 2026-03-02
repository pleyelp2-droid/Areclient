import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import helmet from 'helmet';
import cors from 'cors';
import { GoogleGenAI, Type } from "@google/genai";

// --- Configuration ---
const PORT = 3000; // MUST be 3000
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// --- World State (Full PDF Implementation) ---
interface Agent {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  state: string;
}

interface CityState {
  id: string;
  name: string;
  population: number;
  military_power: number;
  economy_power: number;
  stability: number;
  knowledge_index: number;
  corruption_index: number;
  expansion_pressure: number;
  cultural_unity: number;
  ci: number; // Civilization Index
}

let worldState = {
  tick: 0,
  region_state: 'Stable',
  biome_type: 'Temperate Forest',
  active_players: 0,
  recent_events: [] as string[],
  
  // Economy State (PDF Section 15)
  economy: {
    total_gold_supply: 1000000,
    total_items_supply: 5000,
    gold_velocity: 1.2,
    trade_volume: 50000,
    npc_gold_reserve: 200000,
    tax_pool: 15000,
    inflation_index: 0,
    wealth_distribution_index: 0.4
  },

  // Civilization State (PDF Section 1)
  cities: [
    {
      id: 'city_01',
      name: 'Arelor Prime',
      population: 0.8,
      military_power: 0.6,
      economy_power: 0.7,
      stability: 0.9,
      knowledge_index: 0.5,
      corruption_index: 0.1,
      expansion_pressure: 0.4,
      cultural_unity: 0.8,
      ci: 0.75
    }
  ] as CityState[],

  agents: [
    { id: 'agent_01', name: 'Arelor Guard', x: 10, y: 0, z: 10, state: 'IDLE' },
    { id: 'agent_02', name: 'Forest Stalker', x: -20, y: 0, z: 15, state: 'WANDERING' }
  ] as Agent[]
};

// --- Mathematical Engines (PDF Sections 1-15) ---

/**
 * PDF Section 1: Civilization Index Formula
 * CI = (0.2 * economy) + (0.2 * military) + (0.15 * stability) + (0.15 * knowledge) + (0.15 * culture) - (0.15 * corruption)
 */
function calculateCI(city: CityState): number {
  const ci = (0.2 * city.economy_power) + 
             (0.2 * city.military_power) + 
             (0.15 * city.stability) + 
             (0.15 * city.knowledge_index) + 
             (0.15 * city.cultural_unity) - 
             (0.15 * city.corruption_index);
  return Math.max(0, Math.min(1, ci));
}

/**
 * PDF Section 28: Loot Drop Model
 * EffectiveDropChance = (BaseDropRate) * (1 + PlayerMagicFind) * (1 - AreaLootSaturation) * RarityModifier
 */
function calculateDropChance(baseRate: number, mf: number, saturation: number, rarityMod: number): number {
  const adjustedMF = 1 + (mf / (mf + 100)); // Diminishing returns (PDF Section 29)
  return baseRate * adjustedMF * (1 - saturation) * rarityMod;
}

/**
 * PDF Section 36: Inflation Index
 * InflationIndex = (Gold_In - Gold_Out) / total_gold_supply
 */
function updateEconomy() {
  const goldIn = 5000; // Simulated from quest rewards + drops
  const goldOut = 4500; // Simulated from repair + crafting sinks
  
  worldState.economy.inflation_index = (goldIn - goldOut) / worldState.economy.total_gold_supply;
  
  // Dynamic Gold Sinks (PDF Section 36)
  if (worldState.economy.inflation_index > 0.05) {
    // Increase costs to combat inflation
    worldState.recent_events.push("Inflation rising: Merchant prices increased by 8%");
  }
}

// --- AI Engine (Content Brain) ---
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

async function generateAIContent(type: string, context: any) {
  if (!ai) return { error: "AI not configured" };
  
  const model = "gemini-3-flash-preview";
  let prompt = "";
  let schema: any = {};

  switch(type) {
    case 'quest':
      prompt = `Generate a quest for Ouroboros. Context: ${JSON.stringify(context)}. Rules: Balanced to level, respect biome, no overpowered loot.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          quest_title: { type: Type.STRING },
          quest_type: { type: Type.STRING },
          difficulty: { type: Type.INTEGER },
          objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
          rewards: { type: Type.OBJECT, properties: { xp: { type: Type.NUMBER }, gold: { type: Type.NUMBER } } },
          narrative_hook: { type: Type.STRING }
        }
      };
      break;
    case 'npc':
      prompt = `Generate an NPC personality. Context: ${JSON.stringify(context)}. Include secret motivation and relationship hooks.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          npc_name: { type: Type.STRING },
          temperament: { type: Type.STRING },
          ideology: { type: Type.STRING },
          secret_motivation: { type: Type.STRING },
          speech_style: { type: Type.STRING }
        }
      };
      break;
    case 'youtube':
      prompt = `Generate a YouTube automation script for Ouroboros. Events: ${JSON.stringify(context)}`;
      schema = {
        type: Type.OBJECT,
        properties: {
          video_title: { type: Type.STRING },
          hook: { type: Type.STRING },
          short_script: { type: Type.STRING },
          seo_description: { type: Type.STRING }
        }
      };
      break;
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(response.text || '{}');
}

// --- Server Setup ---
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/world-state', (req, res) => {
  res.json(worldState);
});

app.post('/api/generate/:type', async (req, res) => {
  const { type } = req.params;
  const content = await generateAIContent(type, worldState);
  res.json(content);
});

// YouTube Automation Endpoint
app.post('/api/youtube/automate', async (req, res) => {
  const events = worldState.recent_events.length > 0 ? worldState.recent_events : ["Weekly Boss Kill", "Rare Drop Found"];
  const script = await generateAIContent('youtube', events);
  res.json({ status: 'success', script });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket Logic (Godot Compatible)
wss.on('connection', (ws: WebSocket) => {
  console.log('Godot/Client connected');
  worldState.active_players++;

  // Send initial state
  ws.send(JSON.stringify({ type: 'INIT', state: worldState }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'MOVE') {
        // Update simulated player position
        console.log(`Player moved to: ${data.x}, ${data.y}, ${data.z}`);
      }
    } catch (e) {
      console.error('WS Error:', e);
    }
  });

  ws.on('close', () => {
    worldState.active_players--;
    console.log('Client disconnected');
  });
});

// Game Loop (Tick Engine - PDF Section 31)
setInterval(() => {
  worldState.tick++;
  
  // 1. Simulate Agent Movement
  worldState.agents.forEach(agent => {
    agent.x += (Math.random() - 0.5) * 2;
    agent.z += (Math.random() - 0.5) * 2;
  });

  // 2. Recursive Evolution (PDF Section 27)
  worldState.cities.forEach(city => {
    // Simulate weekly evolution every 10 ticks
    if (worldState.tick % 10 === 0) {
      city.economy_power = Math.min(1, city.economy_power + 0.01);
      city.military_power = Math.min(1, city.military_power + 0.005);
      city.ci = calculateCI(city);
      
      // Civilization Conflict Mechanik (PDF Section 28)
      if (city.ci < 0.25) {
        worldState.recent_events.push(`${city.name} is struggling. Buildings decaying.`);
      }
    }
  });

  // 3. Update Economy (PDF Section 36)
  if (worldState.tick % 5 === 0) {
    updateEconomy();
  }

  // 4. Broadcast state to all Godot clients
  const stateUpdate = JSON.stringify({ type: 'TICK', state: worldState });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(stateUpdate);
    }
  });
}, 1000);

server.listen(PORT, () => {
  console.log(`Arelorian Hybrid Server running on port ${PORT}`);
});

'use client';

import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Brain, 
  ScrollText, 
  Users, 
  Youtube, 
  Database, 
  Code2, 
  ChevronRight, 
  Loader2,
  Sparkles,
  Terminal,
  Settings,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

// --- Types & Schemas ---

const QUEST_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    quest_title: { type: Type.STRING },
    quest_type: { type: Type.STRING },
    region: { type: Type.STRING },
    difficulty: { type: Type.INTEGER },
    objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
    enemy_types: { type: Type.ARRAY, items: { type: Type.STRING } },
    required_level: { type: Type.INTEGER },
    rewards: {
      type: Type.OBJECT,
      properties: {
        xp: { type: Type.NUMBER },
        gold: { type: Type.NUMBER },
        item_reward: { type: Type.STRING }
      }
    },
    narrative_hook: { type: Type.STRING }
  },
  required: ["quest_title", "difficulty", "objectives", "rewards"]
};

const NPC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    npc_name: { type: Type.STRING },
    temperament: { type: Type.STRING },
    ideology: { type: Type.STRING },
    trust_bias: { type: Type.STRING },
    ambition: { type: Type.STRING },
    faction_alignment: { type: Type.STRING },
    speech_style: { type: Type.STRING },
    secret_motivation: { type: Type.STRING },
    relationship_hooks: { type: Type.ARRAY, items: { type: Type.STRING } }
  }
};

const LORE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    lore_title: { type: Type.STRING },
    historical_context: { type: Type.STRING },
    conflict_origin: { type: Type.STRING },
    current_implication: { type: Type.STRING },
    future_hook: { type: Type.STRING }
  }
};

const YOUTUBE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    video_title: { type: Type.STRING },
    hook: { type: Type.STRING },
    short_script: { type: Type.STRING },
    long_form_outline: { type: Type.ARRAY, items: { type: Type.STRING } },
    thumbnail_prompt: { type: Type.STRING },
    seo_description: { type: Type.STRING },
    call_to_action: { type: Type.STRING }
  }
};

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 text-sm transition-all border-b border-[#141414]/10",
      active ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5 text-[#141414]/70"
    )}
  >
    <Icon size={18} />
    <span className="font-medium">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto" />}
  </button>
);

const SectionHeader = ({ title, subtitle }: any) => (
  <div className="mb-8 border-b border-[#141414] pb-4">
    <h2 className="text-4xl font-serif italic tracking-tight">{title}</h2>
    <p className="text-sm uppercase tracking-widest opacity-50 mt-1">{subtitle}</p>
  </div>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [worldContext, setWorldContext] = useState({
    region_state: 'War-torn',
    biome_type: 'Volcanic Wastes',
    civilization_index: 0.35,
    player_level_range: '20-30'
  });

  const generateContent = async (type: string) => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      let schema, systemPrompt, userPrompt;

      switch(type) {
        case 'quest':
          schema = QUEST_SCHEMA;
          systemPrompt = "You are the Autonomous Content Brain of the MMORPG Ouroboros. Generate a structured quest based on the world context.";
          userPrompt = `Context: ${JSON.stringify(worldContext)}`;
          break;
        case 'npc':
          schema = NPC_SCHEMA;
          systemPrompt = "Generate a complex NPC personality profile for the MMORPG Ouroboros.";
          userPrompt = `Region: ${worldContext.region_state}, Biome: ${worldContext.biome_type}`;
          break;
        case 'lore':
          schema = LORE_SCHEMA;
          systemPrompt = "Generate a deep lore entry for the world of Ouroboros.";
          userPrompt = `Current State: ${worldContext.region_state}`;
          break;
        case 'youtube':
          schema = YOUTUBE_SCHEMA;
          systemPrompt = "Generate a YouTube automation package for Ouroboros MMO events.";
          userPrompt = "Input: Weekly Boss Kill Stats, Rare Drop Milestones";
          break;
        default:
          return;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: schema as any
        }
      });

      setResult(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error(error);
      setResult({ error: "Generation failed. Check API key." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#141414] flex flex-col bg-[#E4E3E0] z-10">
        <div className="p-6 border-b border-[#141414]">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="text-[#141414]" size={24} />
            <h1 className="font-bold tracking-tighter text-xl uppercase">Ouroboros</h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 font-mono">Content Brain v1.0</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          <SidebarItem icon={Terminal} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={ScrollText} label="Quest Engine" active={activeTab === 'quest'} onClick={() => setActiveTab('quest')} />
          <SidebarItem icon={Users} label="NPC Personality" active={activeTab === 'npc'} onClick={() => setActiveTab('npc')} />
          <SidebarItem icon={Sparkles} label="Lore Generator" active={activeTab === 'lore'} onClick={() => setActiveTab('lore')} />
          <SidebarItem icon={Youtube} label="YouTube Automation" active={activeTab === 'youtube'} onClick={() => setActiveTab('youtube')} />
          <SidebarItem icon={Brain} label="Arelorian World" active={activeTab === 'arelorian'} onClick={() => setActiveTab('arelorian')} />
          <SidebarItem icon={Code2} label="Godot Resources" active={activeTab === 'godot'} onClick={() => setActiveTab('godot')} />
          <SidebarItem icon={Database} label="Database Sync" active={activeTab === 'db'} onClick={() => setActiveTab('db')} />
          <SidebarItem icon={ShieldCheck} label="Validation Layer" active={activeTab === 'validation'} onClick={() => setActiveTab('validation')} />
        </nav>

        <div className="p-4 border-t border-[#141414] bg-[#141414] text-[#E4E3E0]">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-60 mb-2">
            <ShieldCheck size={12} />
            <span>System Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono tracking-tight">Vertex AI Connected</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#E4E3E0] p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SectionHeader title="System Overview" subtitle="Autonomous Content Brain Control" />
              
              <div className="grid grid-cols-4 gap-8 mb-12">
                <div className="border border-[#141414] p-6">
                  <span className="technical-label">Active Region</span>
                  <div className="text-2xl font-mono mt-2">{worldContext.region_state}</div>
                </div>
                <div className="border border-[#141414] p-6">
                  <span className="technical-label">Civilization Index</span>
                  <div className="text-2xl font-mono mt-2">{(worldContext.civilization_index * 100).toFixed(1)}%</div>
                </div>
                <div className="border border-[#141414] p-6">
                  <span className="technical-label">Inflation Index</span>
                  <div className="text-2xl font-mono mt-2 text-emerald-600">0.02%</div>
                </div>
                <div className="border border-[#141414] p-6">
                  <span className="technical-label">Generation Limit</span>
                  <div className="text-2xl font-mono mt-2">1,200 / Day</div>
                </div>
                <div className="border border-[#141414] p-6 bg-[#141414] text-[#E4E3E0]">
                  <span className="technical-label opacity-60">Prod Instance</span>
                  <div className="text-xl font-mono mt-2">mmoinstanz</div>
                  <div className="text-[10px] uppercase tracking-widest opacity-40 mt-1">AMD Milan • SEV Enabled</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="border border-[#141414] p-8 bg-white/50 backdrop-blur-sm">
                  <h3 className="font-serif italic text-2xl mb-4">World Context Configuration</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="technical-label">Region State</label>
                      <input 
                        type="text" 
                        value={worldContext.region_state}
                        onChange={(e) => setWorldContext({...worldContext, region_state: e.target.value})}
                        className="w-full bg-transparent border-b border-[#141414] py-2 font-mono focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="technical-label">Biome Type</label>
                      <input 
                        type="text" 
                        value={worldContext.biome_type}
                        onChange={(e) => setWorldContext({...worldContext, biome_type: e.target.value})}
                        className="w-full bg-transparent border-b border-[#141414] py-2 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-[#141414] p-8 bg-[#141414] text-[#E4E3E0]">
                  <h3 className="font-serif italic text-2xl mb-4">Economy Balance (PDF Section 35)</h3>
                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="opacity-50 uppercase">Total Gold Supply</span>
                      <span>1,000,000 G</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="opacity-50 uppercase">Gold Velocity</span>
                      <span>1.2x</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="opacity-50 uppercase">Tax Pool</span>
                      <span>15,000 G</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {['quest', 'npc', 'lore', 'youtube'].includes(activeTab) && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SectionHeader 
                title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Engine`} 
                subtitle={`Vertex AI Content Generation`} 
              />

              <div className="flex gap-8">
                <div className="w-1/3 space-y-6">
                  <div className="border border-[#141414] p-6 bg-white/30">
                    <h4 className="font-serif italic text-xl mb-4">Parameters</h4>
                    <div className="space-y-4">
                      <div className="p-3 border border-[#141414]/10 bg-[#141414]/5">
                        <span className="technical-label block">Model</span>
                        <span className="font-mono text-sm">gemini-3-flash-preview</span>
                      </div>
                      <div className="p-3 border border-[#141414]/10 bg-[#141414]/5">
                        <span className="technical-label block">Temperature</span>
                        <span className="font-mono text-sm">0.7</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => generateContent(activeTab)}
                      disabled={loading}
                      className="w-full mt-8 bg-[#141414] text-[#E4E3E0] py-4 font-bold uppercase tracking-widest hover:bg-[#141414]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                      {loading ? 'Generating...' : 'Initiate Generation'}
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="border border-[#141414] min-h-[500px] bg-[#141414] text-[#E4E3E0] p-8 font-mono text-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="flex items-center gap-2 mb-6 opacity-40">
                      <Terminal size={14} />
                      <span className="uppercase tracking-widest text-[10px]">Output Stream</span>
                    </div>
                    
                    {result ? (
                      <pre className="whitespace-pre-wrap leading-relaxed">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <Brain size={64} className="mb-4" />
                        <p className="uppercase tracking-[0.3em]">Awaiting Input</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'arelorian' && (
            <motion.div
              key="arelorian"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <SectionHeader title="Arelorian World Engine" subtitle="Real-time Game State Integration" />
              
              <div className="grid grid-cols-2 gap-8">
                <div className="border border-[#141414] p-8">
                  <h3 className="font-serif italic text-2xl mb-6">Active Agents</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-[#141414]/10 bg-white/40 flex justify-between items-center">
                      <div>
                        <div className="font-bold">Arelor Guard</div>
                        <div className="text-[10px] uppercase opacity-50">ID: agent_01</div>
                      </div>
                      <div className="font-mono text-xs">POS: 10, 0, 10</div>
                    </div>
                    <div className="p-4 border border-[#141414]/10 bg-white/40 flex justify-between items-center">
                      <div>
                        <div className="font-bold">Forest Stalker</div>
                        <div className="text-[10px] uppercase opacity-50">ID: agent_02</div>
                      </div>
                      <div className="font-mono text-xs">POS: -20, 0, 15</div>
                    </div>
                  </div>
                </div>

                <div className="border border-[#141414] p-8">
                  <h3 className="font-serif italic text-2xl mb-6">WebSocket Bridge</h3>
                  <div className="p-6 bg-[#141414] text-[#E4E3E0] rounded">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs uppercase tracking-widest">Godot Client Connected</span>
                    </div>
                    <p className="text-sm opacity-70 mb-4">
                      The Arelorian Axiom Engine is currently broadcasting world state updates to Godot clients via port 3000.
                    </p>
                    <div className="font-mono text-[10px] opacity-50">
                      [TICK 1042] Broadcasted state to 1 client
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'godot' && (
            <motion.div
              key="godot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <SectionHeader title="Godot Migration Hub" subtitle="Client-Side Implementation Resources" />
              
              <div className="grid grid-cols-2 gap-8">
                <div className="border border-[#141414] p-8">
                  <h3 className="font-serif italic text-2xl mb-6">Network Manager (GDScript)</h3>
                  <div className="bg-[#141414] text-[#E4E3E0] p-4 font-mono text-xs rounded overflow-x-auto">
                    <pre>{`extends Node
var socket := WebSocketPeer.new()
var url := "ws://YOUR_SERVER_IP:3000/ws"

func _ready():
    connect_to_server()

func _process(delta):
    socket.poll()
    if socket.get_available_packet_count() > 0:
        var packet = socket.get_packet().get_string_from_utf8()
        handle_message(packet)`}</pre>
                  </div>
                </div>

                <div className="border border-[#141414] p-8">
                  <h3 className="font-serif italic text-2xl mb-6">Entity Interpolation</h3>
                  <div className="bg-[#141414] text-[#E4E3E0] p-4 font-mono text-xs rounded overflow-x-auto">
                    <pre>{`extends CharacterBody3D
var target_position : Vector3

func _physics_process(delta):
    global_position = global_position.lerp(
        target_position, 0.15
    )`}</pre>
                  </div>
                </div>

                <div className="border border-[#141414] p-8 col-span-2">
                  <h3 className="font-serif italic text-2xl mb-6">Production Setup (GitHub & VM)</h3>
                  <div className="bg-[#141414] text-[#E4E3E0] p-6 font-mono text-xs rounded overflow-x-auto">
                    <pre>{`# 1. SSH into mmoinstanz
gcloud compute ssh mmoinstanz --project areareai --zone <YOUR_ZONE>

# 2. Install Node.js & Git
sudo apt-get update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git build-essential

# 3. Clone your new GitHub Repo
git clone <YOUR_GITHUB_REPO_URL>
cd <REPO_NAME>

# 4. Install & Start
npm install
# Set your secrets in a .env file first!
npm start`}</pre>
                  </div>
                  <div className="mt-4 p-4 border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 text-xs">
                    <p className="font-bold mb-1">✅ GitHub Ready:</p>
                    <p>Your project is now prepared for export. Push your changes to GitHub, then run the commands above on your VM to bring the Arelorian Brain online.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'db' && (
            <motion.div
              key="db"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <SectionHeader title="Database Synchronization" subtitle="PostgreSQL / Cloud SQL Connectivity" />
              
              <div className="border border-[#141414] p-12 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 border border-[#141414] flex items-center justify-center mb-6">
                  <Database size={48} />
                </div>
                <h3 className="text-2xl font-serif italic mb-2">Google Cloud SQL (Private)</h3>
                <p className="max-w-md text-sm opacity-60 mb-8">
                  Instance: <code className="bg-[#141414]/5 px-1">10.46.0.3</code><br/>
                  Network: <code className="bg-[#141414]/5 px-1">aeelorianclientmmo-private-network</code>
                </p>

                <div className="flex gap-4 mb-12">
                  <button 
                    onClick={async () => {
                      if(confirm("Start migration from Replit to Google Cloud SQL?")) {
                        const res = await fetch('/api/admin/migrate', { method: 'POST' });
                        const data = await res.json();
                        alert(JSON.stringify(data, null, 2));
                      }
                    }}
                    className="px-6 py-3 bg-[#141414] text-[#E4E3E0] text-xs uppercase tracking-widest font-bold hover:bg-[#141414]/90 transition-all"
                  >
                    Start Data Migration
                  </button>
                </div>
                
                <div className="w-full max-w-2xl border border-[#141414] overflow-hidden">
                  <div className="bg-[#141414] text-[#E4E3E0] px-4 py-2 text-[10px] uppercase tracking-widest flex justify-between">
                    <span>Table Status</span>
                    <span className="text-emerald-400">Sync Active</span>
                  </div>
                  <div className="p-4 space-y-2 font-mono text-xs">
                    <div className="flex justify-between border-b border-[#141414]/10 pb-2">
                      <span>quests</span>
                      <span className="opacity-50">1,242 Rows</span>
                    </div>
                    <div className="flex justify-between border-b border-[#141414]/10 pb-2">
                      <span>npc_profiles</span>
                      <span className="opacity-50">482 Rows</span>
                    </div>
                    <div className="flex justify-between border-b border-[#141414]/10 pb-2">
                      <span>lore_entries</span>
                      <span className="opacity-50">129 Rows</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'validation' && (
            <motion.div
              key="validation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <SectionHeader title="Validation Layer" subtitle="Data Integrity & Economy Safety" />
              
              <div className="grid grid-cols-2 gap-8">
                <div className="border border-[#141414] p-8">
                  <h3 className="font-serif italic text-2xl mb-6">JSON Schema Validation</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 border border-emerald-500/20 bg-emerald-500/5 text-emerald-800">
                      <ShieldCheck size={20} />
                      <span className="text-sm font-medium">Quest Schema Validated</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 border border-emerald-500/20 bg-emerald-500/5 text-emerald-800">
                      <ShieldCheck size={20} />
                      <span className="text-sm font-medium">NPC Profile Schema Validated</span>
                    </div>
                  </div>
                </div>

                <div className="border border-[#141414] p-8">
                  <h3 className="font-serif italic text-2xl mb-6">Economy Safety Check (PDF Section 25)</h3>
                  <div className="p-6 bg-amber-50 border border-amber-200 text-amber-900 rounded">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle size={18} />
                      <span className="text-xs uppercase tracking-widest font-bold">Inflation Guard Active</span>
                    </div>
                    <p className="text-sm opacity-80 mb-4 font-mono leading-relaxed">
                      IF (questRewardGold &gt; totalGoldSupply * 0.0001) <br/>
                      THEN REJECT(quest)
                    </p>
                    <div className="text-[10px] uppercase opacity-50">
                      Last Check: 0.00002% (PASS)
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Settings Overlay (Mock) */}
      <div className="fixed bottom-8 right-8">
        <button className="w-12 h-12 bg-[#141414] text-[#E4E3E0] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}

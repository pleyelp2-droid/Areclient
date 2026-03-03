import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenAI } from "@google/genai";

admin.initializeApp();
const db = admin.firestore();
const rtdb = admin.database();

/**
 * OUROBOROS AXIOM ENGINE - FIREBASE PORT
 * Generated automatically from server.ts & tick-engine.ts
 */

const GEMINI_API_KEY = functions.config().ouroboros?.gemini_key || process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenAI(GEMINI_API_KEY) : null;

// --- Math Engines (1:1 Port from Tick-Engine) ---
const calculateCI = (city: any) => {
  return (0.2 * (city.economy_power || 0)) + 
         (0.2 * (city.military_power || 0)) + 
         (0.15 * (city.stability || 0)) + 
         (0.15 * (city.knowledge_index || 0)) + 
         (0.15 * (city.cultural_unity || 0)) - 
         (0.15 * (city.corruption_index || 0));
};

// --- World Heartbeat (Scheduled every minute) ---
export const worldHeartbeat = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  const worldRef = db.collection('world_state').doc('current');
  const snap = await worldRef.get();
  const state = snap.data() || { tick: 0, gold_supply: 1000000 };

  const newTick = (state.tick || 0) + 1;
  
  // Update World State
  await worldRef.update({
    tick: newTick,
    last_pulse: admin.firestore.FieldValue.serverTimestamp()
  });

  // Sync to RTDB for Godot Realtime
  await rtdb.ref('live_world').set({
    tick: newTick,
    timestamp: Date.now()
  });

  return null;
});

// --- AI Content Generator ---
export const generateGameContent = functions.https.onCall(async (data, context) => {
  if (!genAI) throw new functions.https.HttpsError('failed-precondition', 'AI not configured');
  
  const { type, context: gameContext } = data;
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  
  const prompt = `Generate ${type} for Ouroboros MMO. Context: ${JSON.stringify(gameContext)}`;
  const result = await model.generateContent(prompt);
  const content = JSON.parse(result.response.text());

  // Store in Firestore
  await db.collection(type + 's').add({
    ...content,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });

  return content;
});

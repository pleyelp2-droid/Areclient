/**
 * OUROBOROS DETERMINISTIC CORE ENGINE
 * Phase 1: Network Protocol & Contract Standardization
 * Phase 2: Engine-agnostic Deterministic Core-Loop
 * 
 * This module defines the absolute authority of the server state.
 */

export enum MessageType {
  STATE_UPDATE = 0,
  PLAYER_INPUT = 1,
  WORLD_EVENT = 2,
  SYSTEM_SYNC = 3
}

export interface WorldState {
  tick: number;
  timestamp: number;
  entities: Record<string, Entity>;
  economy: EconomyState;
  evolution: EvolutionState;
}

export interface Entity {
  id: string;
  type: 'player' | 'npc' | 'object';
  position: { x: number; y: number; z: number };
  rotation: number;
  velocity: { x: number; y: number; z: number };
  stats: Record<string, number>;
}

export interface EconomyState {
  total_currency: number;
  inflation_rate: number;
  resource_nodes: Record<string, number>;
}

export interface EvolutionState {
  global_index: number;
  era: string;
  unlocked_tech: string[];
}

/**
 * DETERMINISTIC CORE LOOP
 * Runs at a fixed tick rate (e.g., 20Hz = 50ms)
 */
export class OuroborosCore {
  private state: WorldState;
  private tickRate: number = 50; // ms
  private lastTickTime: number = 0;

  constructor(initialState?: Partial<WorldState>) {
    this.state = {
      tick: 0,
      timestamp: Date.now(),
      entities: {},
      economy: {
        total_currency: 1000000,
        inflation_rate: 0.01,
        resource_nodes: {}
      },
      evolution: {
        global_index: 0,
        era: 'Stone Age',
        unlocked_tech: []
      },
      ...initialState
    };
  }

  /**
   * The Heartbeat: Fixed Step Simulation
   */
  public step(inputs: any[]): WorldState {
    this.state.tick++;
    this.state.timestamp = Date.now();

    // 1. Process Inputs (Deterministic ordering)
    this.processInputs(inputs);

    // 2. Physics & Movement
    this.updatePhysics();

    // 3. Economy Simulation (Phase 5)
    this.updateEconomy();

    // 4. Evolution Logic (Phase 5)
    this.updateEvolution();

    return { ...this.state };
  }

  private processInputs(inputs: any[]) {
    // Inputs are sorted by timestamp/sequence to ensure determinism
    inputs.sort((a, b) => a.sequence - b.sequence);
    
    for (const input of inputs) {
      const entity = this.state.entities[input.playerId];
      if (entity) {
        // Apply input to velocity/state
        entity.velocity.x = input.moveX || 0;
        entity.velocity.z = input.moveZ || 0;
      }
    }
  }

  private updatePhysics() {
    for (const id in this.state.entities) {
      const entity = this.state.entities[id];
      // Simple Euler integration (Deterministic if using fixed-point math, 
      // but for this demo we use standard floats with caution)
      entity.position.x += entity.velocity.x;
      entity.position.y += entity.velocity.y;
      entity.position.z += entity.velocity.z;
    }
  }

  private updateEconomy() {
    // Economy logic: inflation adjustment, resource regeneration
    this.state.economy.total_currency *= (1 + this.state.economy.inflation_rate / 1000);
  }

  private updateEvolution() {
    // Evolution logic: progress based on global activity
    this.state.evolution.global_index += 0.0001;
    if (this.state.evolution.global_index > 1 && this.state.evolution.era === 'Stone Age') {
      this.state.evolution.era = 'Bronze Age';
    }
  }

  public getState(): WorldState {
    return JSON.parse(JSON.stringify(this.state));
  }
}

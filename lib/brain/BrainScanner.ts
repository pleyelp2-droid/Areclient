import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

export type ProjectType = 'godot' | 'unity' | 'unreal' | 'generic';

export interface ProjectStats {
  type: ProjectType;
  graphicsModules: number;
  textures: number;
  gameRules: number;
  characters: number;
  lore: number;
  quests: number;
}

export class BrainScanner {
  async scan(targetDir: string): Promise<ProjectStats> {
    const files = await glob('**/*', { cwd: targetDir, nodir: true });
    
    let type: ProjectType = 'generic';
    if (files.some(f => f.endsWith('.godot'))) type = 'godot';
    else if (files.some(f => f.endsWith('.unity'))) type = 'unity';
    else if (files.some(f => f.endsWith('.uproject'))) type = 'unreal';

    return {
      type,
      graphicsModules: files.filter(f => f.includes('graphics') || f.includes('shaders')).length,
      textures: files.filter(f => f.match(/\.(png|jpg|tga|dds)$/)).length,
      gameRules: files.filter(f => f.includes('rules') || f.includes('logic')).length,
      characters: files.filter(f => f.includes('character') || f.includes('npc')).length,
      lore: files.filter(f => f.includes('lore') || f.includes('story')).length,
      quests: files.filter(f => f.includes('quest')).length,
    };
  }
}

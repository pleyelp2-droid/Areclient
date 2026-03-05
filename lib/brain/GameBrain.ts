import { BrainScanner, ProjectStats } from './BrainScanner';
import { FilesystemWatchdog } from './FilesystemWatchdog';
import { LLMProvider } from './llm/LLMProvider';
import { MCPClient } from './mcp/MCPClient';
import { CacheManager } from './cache/CacheManager';
import { RepositoryMixer } from './mixer/RepositoryMixer';
import { WSServer } from './ws/WSServer';
import { Server } from 'http';
import simpleGit from 'simple-git';

export class GameBrain {
  private scanner = new BrainScanner();
  private watchdog = new FilesystemWatchdog();
  private stats: ProjectStats | null = null;
  private llm: LLMProvider | null = null;
  private mcp: MCPClient | null = null;
  private cache: CacheManager | null = null;
  private mixer = new RepositoryMixer();
  private wsServer: WSServer | null = null;
  private tenantId: string;

  constructor(tenantId: string, server?: Server) {
    this.tenantId = tenantId;
    if (server) {
      this.wsServer = new WSServer(server);
      this.watchdog.setWSServer(this.wsServer);
    }
  }

  setLLM(provider: LLMProvider) {
    this.llm = provider;
  }

  setMCP(mcp: MCPClient) {
    this.mcp = mcp;
  }

  setCache(cache: CacheManager) {
    this.cache = cache;
  }

  async init(targetDir: string) {
    // Try to get stats from cache first, scoped by tenantId
    if (this.cache) {
      const cachedStats = await this.cache.get(`project_stats_${this.tenantId}`);
      if (cachedStats) {
        this.stats = cachedStats;
        return;
      }
    }

    this.stats = await this.scanner.scan(targetDir);
    
    if (this.cache) {
      await this.cache.set(`project_stats_${this.tenantId}`, this.stats);
    }

    this.watchdog.watch(targetDir, (log) => {
      console.log(`[${this.tenantId}] Update:`, log);
    });
  }

  async mixRepos(logicRepoUrl: string, contentRepoUrl: string, targetDir: string) {
    return await this.mixer.mix(logicRepoUrl, contentRepoUrl, targetDir);
  }

  async generate(prompt: string) {
    if (!this.llm) throw new Error("LLM not initialized");
    return await this.llm.generate(prompt, this.stats);
  }

  async connectToRepo(repoUrl: string, targetDir: string) {
    const git = simpleGit();
    await git.clone(repoUrl, targetDir);
    await this.init(targetDir);
  }

  getStats() {
    return this.stats;
  }
}

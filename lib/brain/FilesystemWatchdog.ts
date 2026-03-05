import * as chokidar from 'chokidar';
import { WSServer } from './ws/WSServer';

export class FilesystemWatchdog {
  private watcher: chokidar.FSWatcher | null = null;
  private logs: string[] = [];
  private wsServer: WSServer | null = null;

  setWSServer(wsServer: WSServer) {
    this.wsServer = wsServer;
  }

  watch(targetDir: string, onUpdate: (log: string) => void) {
    this.watcher = chokidar.watch(targetDir, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    this.watcher
      .on('add', path => this.log(`File ${path} has been added`))
      .on('change', path => this.log(`File ${path} has been changed`))
      .on('unlink', path => this.log(`File ${path} has been removed`))
      .on('error', error => this.log(`Watcher error: ${error}`));
  }

  private log(message: string) {
    this.logs.push(message);
    console.warn(`[WATCHDOG]: ${message}`);
    if (this.wsServer) {
      this.wsServer.broadcast(message);
    }
  }

  getLogs() {
    return this.logs;
  }
}

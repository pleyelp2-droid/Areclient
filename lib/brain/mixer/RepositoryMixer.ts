import simpleGit from 'simple-git';
import * as fs from 'fs-extra';
import * as path from 'path';

export class RepositoryMixer {
  async mix(logicRepoUrl: string, contentRepoUrl: string, targetDir: string) {
    const logicDir = path.join(targetDir, 'logic_temp');
    const contentDir = path.join(targetDir, 'content_temp');
    const outputDir = path.join(targetDir, 'mixed_project');

    const git = simpleGit();
    await git.clone(logicRepoUrl, logicDir);
    await git.clone(contentRepoUrl, contentDir);

    await fs.ensureDir(outputDir);

    // Heuristic: Logic usually in src/, content in assets/ or data/
    // This is a naive implementation that can be improved.
    await fs.copy(path.join(logicDir, 'src'), path.join(outputDir, 'src'));
    await fs.copy(path.join(contentDir, 'assets'), path.join(outputDir, 'assets'));
    await fs.copy(path.join(contentDir, 'data'), path.join(outputDir, 'data'));

    // Cleanup
    await fs.remove(logicDir);
    await fs.remove(contentDir);

    return outputDir;
  }
}

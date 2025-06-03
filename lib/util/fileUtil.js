import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { printErrorMessage } from './printUtil.js';


export async function findFilesByExtension(initialDirPath, extensions) {
    const files = [];
    const foldersToIgnore = ['node_modules', '.venv', '.terraform'];
    const filesToIgnore = ['combined_course_markdown.md'];

    async function recurseDirectory(directory) {
      const entries = await fs.readdir(directory, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.resolve(directory, entry.name);
        if (entry.isDirectory() && !foldersToIgnore.includes(entry.name)) {
          await recurseDirectory(fullPath)
        } else if (extensions.includes(path.extname(entry.name)) && !filesToIgnore.includes(entry.name)) {
          const fileContent = (await fs.readFile(fullPath)).toString();
          files.push({
            filename: entry.name,
            directory,
            fullPath,
            fileContent
          });
        } 
      }

    }
  
    await recurseDirectory(initialDirPath);

    return files;
}


export function getRepositoryRoot() {
	try {
		return execSync('git rev-parse --show-toplevel', {
			encoding: 'utf8',
			stdio: ['pipe', 'pipe', 'ignore']
		}).trim();
	} catch {
		printErrorMessage('Error: Not inside a Git repository.');
		process.exit(1);
	}
}

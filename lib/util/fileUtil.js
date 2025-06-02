import fs from 'fs/promises';
import path from 'path';


export async function findFilesByExtension(initialDirPath, extensions) {
    const files = [];

    async function recurseDirectory(directory) {
      const entries = await fs.readdir(directory, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.resolve(directory, entry.name);
        if (entry.isDirectory()) {
          await recurseDirectory(fullPath)
        } else if (extensions.includes(path.extname(entry.name))) {
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




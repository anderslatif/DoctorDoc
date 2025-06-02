import fs from 'fs/promises';
import path from 'path';


export async function findAsciiDocFiles(dirPath) {
    // the key is the directory and the value is an array of markdown files
    const asciiDocFilesByDirectory = {};

    async function recurseDirectory(directory) {
      const entries = await fs.readdir(directory, { withFileTypes: true });

      // Initialize the list of Markdown and CSS files for this directory
      asciiDocFilesByDirectory[directory] = asciiDocFilesByDirectory[directory] || [];

      for (const entry of entries) {
        const fullPath = path.resolve(directory, entry.name);
        if (entry.isDirectory()) {
          await recurseDirectory(fullPath)
        } else if (path.extname(entry.name) === '.adoc') {
          asciiDocFilesByDirectory[directory].push(fullPath);
        } 
      }

    }
  
    await recurseDirectory(dirPath);

    // remove empty directories
    const asciiDocFiles = Object.fromEntries(
      Object.entries(asciiDocFilesByDirectory).filter(([directory, files]) => files.length > 0)
    );
    
    return asciiDocFiles;
}


export async function getAsciiDocContents(filePaths) {
  const readingFilePromises = await filePaths.map(async (filePath) => {
    return (await fs.readFile(filePath)).toString();
  });

  const fileContents = (await Promise.all(readingFilePromises));

  return fileContents;
}

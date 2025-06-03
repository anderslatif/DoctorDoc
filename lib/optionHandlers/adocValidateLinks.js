import fs from 'fs';
import path from 'path';
import { printTable, printHeader } from '../util/printUtil.js';

export function adocValidateLinks(adocFilePaths) {
	for (const file of adocFilePaths) {
		validateLinksInASingleAdocFile(file);
	}
}

function validateLinksInASingleAdocFile({ filename, fullPath, directory, fileContent }) {
    const links = extractLinksFromDocument(fileContent);
    links.forEach((link) => {
        const linkExists = fs.existsSync(path.resolve(directory, link.url));

        if (!linkExists) {
   
            printHeader(" FILE DOES NOT EXIST ");

            let closestValidDirectory = findClosestValidDirectory(directory + path.sep + link.url);
            closestValidDirectory = closestValidDirectory?.replace(directory, "").replace(path.sep, "");

            const header = [];
            const rows = [];

            rows.push(["File name:".underline.cyan, filename.bgMagenta.white]);
            rows.push(["In directory:".underline.cyan, directory.magenta]);
            rows.push(["Line number:".underline.cyan, String(link.lineNumber).yellow.black]);
            rows.push(["Link defined as:".underline.cyan, link.url.italic]);
            rows.push(["Closest valid file path:".underline.cyan, String(closestValidDirectory).grey.italic]);

            printTable(header, rows);
        
        }
    });
}

function extractLinksFromDocument(fileContent) {
    const lines = fileContent.split('\n');
    const regex = /(?:^\s*\*?\s*|\|\s*\*?\s*)link:(?!https?:\/\/)(.+?)\[(.+?)\]/g;
    const links = [];
  
    lines.forEach((line, index) => {
      let match;
      while ((match = regex.exec(line)) !== null) {
        links.push({ lineNumber: index + 1, url: match[1], text: match[2] });
      }
    });
  
    return links;
}

function findClosestValidDirectory(link) {
    const parentFolder = link.split(path.sep).slice(0, -1).join(path.sep);
    const parentFolderExists = fs.existsSync(parentFolder);
    if (parentFolderExists) {
        return parentFolder;
    } else {
        return findClosestValidDirectory(parentFolder);
    }
}

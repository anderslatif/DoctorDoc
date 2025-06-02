import fs from 'fs';
import path from 'path';

import { printTable } from '../util/printUtil.js';

export function validateLinks(adocFilePaths) {
	for (const file of adocFilePaths) {
		validateSingleFile(file);
	}
}

export function validateSingleFile({ filename, fullPath, directory, fileContent }) {
    const links = extractLinksFromDocument(fileContent);
    links.map(async (link) => {
        const linkExists = verifyLinkInFilesystem(link.url, directory);
        if (!linkExists) {
   
            const terminalWidth = process.stdout.columns;
            const headerText = " FILE DOES NOT EXIST ";
            const headerPaddingLength = Math.floor((terminalWidth - headerText.length) / 2);
            const quarterHeaderPadding = '='.repeat(headerPaddingLength/2);
            
            console.log(quarterHeaderPadding + headerText.bgGrey.black + quarterHeaderPadding.repeat(3));

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
  
function verifyLinkInFilesystem(link, directoryPath) {
    const filePath = path.resolve(directoryPath, link);
    return fs.existsSync(filePath);
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

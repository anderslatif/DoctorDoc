import fs from 'fs';
import path from 'path';
import { printErrorMessage } from '../util/printUtil.js';

export async function generateAsciidocLinks(fileOrFolderPath) {
	let stat;
	try {
		stat = fs.statSync(fileOrFolderPath);
	} catch (error) {
        printErrorMessage('Invalid directory path or file path provided.');
		return;
	}

	const results = [];

	function walk(dir) {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath);
			} else if (entry.isFile() && fullPath.endsWith('.md')) {
				results.push(fullPath);
			}
		}
	}

	if (stat.isDirectory()) {
		walk(fileOrFolderPath);
	} else if (fileOrFolderPath.endsWith('.md')) {
		results.push(fileOrFolderPath);
	} else {
        console.log('This command targets markdown files by default but will generate a link for any specified file type.'.bgGreen);
        results.push(fileOrFolderPath);
	}

    
	const links = results.map(generateLinkForFile);
	console.log(links.join('\n\n').green);
}

function generateLinkForFile(filePath) {
	const relPath = filePath.replace(/\\/g, '/').replace(/^\.\//, '');
	const link = relPath.replace(/ /g, '_');
	const parts = relPath.split('/');
	let file = parts[parts.length - 1].replace(/_/g, ' ').replace(/\.md$/, '');
	return `link:${link}[${file}]`;
}
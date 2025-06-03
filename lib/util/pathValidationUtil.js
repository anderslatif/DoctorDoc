import fs from 'fs';
import path from 'path';
import { getRepositoryRoot } from '../util/fileUtil.js';
import { printTable, printHeader, printErrorMessage } from './printUtil.js';

export function validateLink(link, filename, fullPath, directory, lineNumber) {
	if (link.startsWith('http://') || link.startsWith('https://')) {
		// too many false positives, skipping URL validation
		// validateURL(link, filename, lineNumber);
		return;
	}

	if (link.startsWith('/')) {
		const repoRoot = getRepositoryRoot();
		const resolvedPath = path.resolve(repoRoot, '.' + link);
		const relativePath = path.relative(repoRoot, resolvedPath);

		const isAbsolute = path.isAbsolute(link);
		const isOutsideRepo = relativePath === '..' || relativePath.startsWith('..' + path.sep);

		if (isAbsolute || isOutsideRepo) {
			printHeader(isAbsolute ? ' Absolute Path Used ' : ' Path Outside Repository ');

			const header = [];
			const rows = [];

			rows.push(["File:".underline.cyan, `${filename}:${lineNumber}`]);
			rows.push(["Broken link:".underline.cyan, link.italic]);
			
			printTable(header, rows);
		} else {
			validateFilePath(resolvedPath, filename, lineNumber, directory, link);
		}
		return;
	}

	const resolvedPath = path.resolve(directory, link);
	const repoRoot = getRepositoryRoot();
	const relativePath = path.relative(repoRoot, resolvedPath);
	const isOutsideRepo = relativePath === '..' || relativePath.startsWith('..' + path.sep);

	if (isOutsideRepo) {
		console.warn(`[${filename}:${lineNumber}] Warning: Path "${link}" is outside the repository.`);
	} else {
		validateFilePath(resolvedPath, filename, lineNumber, directory, link);
	}
}

function validateFilePath(filePath, filename, lineNumber, directory, link) {
	if (!fs.existsSync(filePath)) {
		printHeader(' Linked File Not Found ');

		const header = [];
		const rows = [];

		rows.push(["File:".underline.cyan, `${filename.bgMagenta.white}:${String(lineNumber).yellow.black}`]);
		rows.push(["Broken link:".underline.cyan, link.italic]);

		printTable(header, rows);
	}
}

async function validateURL(url, filename, lineNumber, directory, link) {
	try {
		const response = await fetch(url, { method: 'HEAD' });
		if (!response.ok) {
			printHeader(' URL Returned Error Status ');

			const header = [];
			const rows = [];

			rows.push(["File:".underline.cyan, `${filename.bgMagenta.white}:${String(lineNumber).yellow.black}`]);
			rows.push(["Broken link:".underline.cyan, link.italic]);

			printTable(header, rows);
		}
	} catch (error) {
		printErrorMessage(`[${filename}:${lineNumber}] Error: Failed to fetch URL "${url}" - ${error.message}`);
	}
}

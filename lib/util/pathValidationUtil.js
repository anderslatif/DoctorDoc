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
		const isOutsideRepo = relativePath === '..' || relativePath.startsWith('..' + path.sep);

		if (isOutsideRepo) {
			// todo 
			console.warn(`[${filename}:${lineNumber}] Warning: Absolute path "${link}" is outside the repository.`);

		} else {
			validateFilePath(resolvedPath, filename, lineNumber);
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
		validateFilePath(resolvedPath, filename, lineNumber);
	}
}

function validateFilePath(filePath, filename, lineNumber) {
	if (!fs.existsSync(filePath)) {
		// todo 
		console.error(`[${filename}:${lineNumber}] Error: File not found at "${filePath}"`);
	}
}

async function validateURL(url, filename, lineNumber) {
	try {
		const response = await fetch(url, { method: 'HEAD' });
		if (!response.ok) {
			// todo
			console.error(`[${filename}:${lineNumber}] Error: URL "${url}" returned status ${response.status}`);
		}
	} catch (error) {
		printErrorMessage(`[${filename}:${lineNumber}] Error: Failed to fetch URL "${url}" - ${error.message}`);
	}
}

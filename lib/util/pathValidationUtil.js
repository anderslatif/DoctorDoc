import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { getRepositoryRoot } from '../util/fileUtil.js';
import { printErrorMessage } from './printUtil.js';

export function validateLink(link, filename, fullPath, directory, lineNumber) {
	if (link.startsWith('http://') || link.startsWith('https://')) {
		return validateURL(link, filename, lineNumber);
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
		console.error(`[${filename}:${lineNumber}] Error: File not found at "${filePath}"`);
	}
}

async function validateURL(url, filename, lineNumber) {
	try {
		const response = await fetch(url, { method: 'HEAD' });
		if (!response.ok) {
			console.error(`[${filename}:${lineNumber}] Error: URL "${url}" returned status ${response.status}`);
		}
	} catch (error) {
		console.error(`[${filename}:${lineNumber}] Error: Failed to fetch URL "${url}" - ${error.message}`);
	}
}

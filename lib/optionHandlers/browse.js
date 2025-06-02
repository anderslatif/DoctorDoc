import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { platform } from 'os';
import { printErrorMessage } from '../util/printUtil.js';

export function getGitRepositoryUrl(targetPath) {
	try {
		const exec = (cmd) =>
			execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();

		// Ensure inside a Git repo
		let repoRoot;
		try {
			repoRoot = exec('git rev-parse --show-toplevel');
		} catch {
            printErrorMessage('Error: Must be inside a Git repository to open the link in the browser.');
            process.exit(0);
		}

		const remoteUrl = exec('git config --get remote.origin.url');
		const branch =
			exec('git rev-parse --abbrev-ref HEAD') === 'HEAD'
				? exec('git rev-parse HEAD')
				: exec('git rev-parse --abbrev-ref HEAD');

		// Normalize remote
		let baseUrl = remoteUrl
			.replace(/^git@([^:]+):/, 'https://$1/')
			.replace(/^https?:\/\/([^@]+@)?/, 'https://')
			.replace(/\.git$/, '');

		// Resolve path
		const fullPath = path.resolve(targetPath);
		if (!fullPath.startsWith(repoRoot)) {
			printErrorMessage('Error: Target path is outside the Git repository.');
            process.exit(0);
		}
		const relativePath = path.relative(repoRoot, fullPath).replace(/\\/g, '/');

		// Determine file or folder
		let isDir;
		try {
			isDir = fs.statSync(fullPath).isDirectory();
		} catch {
			console.error('Error: Path does not exist:', relativePath);
			return null;
		}
		const type = isDir ? 'tree' : 'blob';

		// Generate URL based on host
		if (baseUrl.includes('github.com')) {
			return `${baseUrl}/${type}/${branch}/${relativePath}`;
		}
		if (baseUrl.includes('gitlab.com')) {
			return `${baseUrl}/-/${type}/${branch}/${relativePath}`;
		}
		if (baseUrl.includes('bitbucket.org')) {
			return `${baseUrl}/src/${branch}/${relativePath}`;
		}

		printErrorMessage('Error: Unsupported remote platform: ' + baseUrl);
		process.exit(0);
	} catch (error) {
		console.error('Unexpected error:', error.message);
		process.exit(1);
	}
}

export function openInBrowser(url) {
    const browserCommand = {
        win32: 'start',
        darwin: 'open',
        linux: 'xdg-open'
    }[platform()] || 'xdg-open';
  
    try {
        execSync(`${browserCommand} "${url}"`, (error) => {
            if (error) {
                throw new Error(`Failed to open browser: ${browserCommand}`);
            }
        });
    } catch {
        throw new Error(`Failed to open browser or possibly get the platform.`);
    }
}

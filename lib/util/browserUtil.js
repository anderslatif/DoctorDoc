import { platform } from 'os';
import { execSync } from 'child_process';

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
import { printHeader } from "../util/printUtil.js";
import { validateLink } from "../util/pathValidationUtil.js";

export function mdValidateLinks(mdFilePaths) {
    for (const file of mdFilePaths) {
        validateLinksInASingleMdFile(file);
    }
}

function validateLinksInASingleMdFile({ filename, fullPath, directory, fileContent }) {
    const lines = fileContent.split('\n');
    const headingIds = extractHeadingIds(lines);
    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        validateMarkdownLinks(line, lineNumber, filename, fullPath, directory, headingIds);
        validateMarkdownImages(line, lineNumber, filename, fullPath, directory);
        validateHtmlLinks(line, lineNumber, filename, fullPath, directory);
        validateHtmlImages(line, lineNumber, filename, fullPath, directory);
        validateReferenceLinks(line, lineNumber, filename, fullPath, directory);
        validateBareUrls(line, lineNumber, filename, fullPath, directory);
    });
}


function validateMarkdownLinks(line, lineNumber, filename, fullPath, directory, headingIds) {
    // [Text](./file.md)
    const regex = /\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
        const target = match[1];
        if (target.startsWith('#')) {
            validateFragmentLink(target, filename, lineNumber, headingIds);
        } else {
            validateLink(target, filename, fullPath, directory, lineNumber);
        }
    }
}

function validateMarkdownImages(line, lineNumber, filename, fullPath, directory) {
    // ![Alt](./image.png)
    const regex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
        if (match[1].startsWith('#')) continue;
        if (!match[1].startsWith('data:')) {
            validateLink(match[1], filename, fullPath, directory, lineNumber);
        }
    }
}

function validateHtmlLinks(line, lineNumber, filename, fullPath, directory) {
    // <a href="./path">
    const regex = /<a\s+[^>]*href=["'](.*?)["']/gi;
    let match;
    while ((match = regex.exec(line)) !== null) {
        validateLink(match[1], filename, fullPath, directory, lineNumber);
    }
}

function validateHtmlImages(line, lineNumber, filename, fullPath, directory) {
    // <img src="./path">
    const regex = /<img\s+[^>]*src=["'](.*?)["']/gi;
    let match;
    while ((match = regex.exec(line)) !== null) {
        if (!match[1].startsWith('data:')) {
            validateLink(match[1], filename, fullPath, directory, lineNumber);
        }
    }
}

function validateReferenceLinks(line, lineNumber, filename, fullPath, directory) {
    // [label][ref] and [ref]: ./path
    const regex = /^\[([^\]]+)\]:\s+(.*)$/;
    const match = regex.exec(line);
    if (match) {
        if (match[2].startsWith('#')) return;
        validateLink(match[2], filename, fullPath, directory, lineNumber);
    }
}

function validateBareUrls(line, lineNumber, filename, fullPath, directory) {
    // <https://example.com>
    const regex = /<https?:\/\/[^>]+>/gi;
    let match;
    while ((match = regex.exec(line)) !== null) {
        const url = match[0].slice(1, -1);
        validateLink(url, filename, fullPath, directory, lineNumber);
    }
}

function validateFragmentLink(fragment, filename, lineNumber, headingIds) {
    const normalizedFragment = fragment.toLowerCase();
    const exists = headingIds.includes(normalizedFragment);
    if (!exists) {
        console.warn(`[${filename}:${lineNumber}] Warning: Fragment "${fragment}" not found in headings.`);
    }
}

function extractHeadingIds(lines) {
    const headings = [];
    const regex = /^#{1,6}\s+(.+)/;
    for (const line of lines) {
        const match = regex.exec(line);
        if (match) {
            const id = match[1].trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            headings.push(`#${id}`);
        }
    }
    return headings;
}
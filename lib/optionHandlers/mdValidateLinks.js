import { printHeader } from "../util/printUtil.js";

export function mdValidateLinks(mdFilePaths) {
    for (const file of mdFilePaths) {
        validateLinksInASingleMdFile(file);
    }
}

function validateLinksInASingleMdFile({ filename, fullPath, directory, fileContent }) {

    const lines = fileContent.split('\n');

    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        validateMarkdownLinks(line, lineNumber, filename, fullPath, directory);
        validateMarkdownImages(line, lineNumber, filename, fullPath, directory);
        validateHtmlLinks(line, lineNumber, filename, fullPath, directory);
        validateHtmlImages(line, lineNumber, filename, fullPath, directory);
        validateReferenceLinks(line, lineNumber, filename, fullPath, directory);
        validateBareUrls(line, lineNumber, filename, fullPath, directory);
    });
}


function validateMarkdownLinks(line, lineNumber, filename, fullPath, directory) {
    // [Text](./file.md)
    const regex = /\[.*?\]\((?!http)(.*?)\)/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
        validateLink(match[1], filename, fullPath, directory, lineNumber);
    }
}

function validateMarkdownImages(line, lineNumber, filename, fullPath, directory) {
    // ![Alt](./image.png)
    const regex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
        validateLink(match[1], filename, fullPath, directory, lineNumber);
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
        validateLink(match[1], filename, fullPath, directory, lineNumber);
    }
}

function validateReferenceLinks(line, lineNumber, filename, fullPath, directory) {
    // [label][ref] and [ref]: ./path
    const regex = /^\[([^\]]+)\]:\s+(.*)$/;
    const match = regex.exec(line);
    if (match) {
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
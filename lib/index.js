#!/usr/bin/env node

import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import "colors";

import { findFilesByExtension } from './util/fileUtil.js';
import { openInBrowser } from './util/browserUtil.js';

import { Command } from 'commander';
import { getGitRepositoryUrl } from './optionHandlers/browse.js';
import { adocValidateLinks } from './optionHandlers/adocValidateLinks.js';
import { printErrorMessage } from './util/printUtil.js';
import { mdValidateLinks } from './optionHandlers/mdValidateLinks.js';
import { adocValidateDates } from './optionHandlers/adocValidateDates.js';
import { previewGithubMarkdown } from './optionHandlers/previewGithubMarkdown.js';
import { generateAsciidocLinks } from './optionHandlers/generateAsciidocLinks.js';


const program = new Command();

const packageJson = await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf8');
const versionNumber = JSON.parse(packageJson).version;

program
  .name('DoctorDoc')
  .description('AsciiDoc and Markdown Utility Tool.')  
  .version(versionNumber);


program
.option('--all', 'Run all checks (default if no other option is set).')


program
.option('--adoc-validate-links', 'Validate that AsciiDoc links exist on the file system.')
.option('--adoc-validate-dates', 'Validate that dates exist within the calendar year.');

program
.option('--md-validate-links', 'Validate that Markdown file links exist on the file system.');

program
.option('--browse [path]', 'Open repository URL for file/directory. Defaults to the current directory if not path provided.')
.option('--view-github-markdown <file_path>', 'Send a markdown file to the GitHub API and see the generated HTML file in your browser.')
.option('--generate-asciidoc-links <file_or_folder_path>', 'Generate AsciiDoc links for a file or directory.');


program.parse(process.argv);

const options = program.opts();

const noOptionsGiven = Object.keys(options).length === 0;
if (noOptionsGiven) {
  options.all = true;
}

const asciiDocFiles = await findFilesByExtension(process.cwd(), ['.adoc']);
const markdownFiles = await findFilesByExtension(process.cwd(), ['.md']);

const asciiDocFilesFound = asciiDocFiles.length;
const markdownFilesFound = markdownFiles.length;
const noFilesFound = asciiDocFilesFound === 0 && markdownFilesFound === 0;

if (options.browse) {
  const targetPath = path.resolve(options.browse === true ? process.cwd() : options.browse);
  const url = getGitRepositoryUrl(targetPath);
  console.log(`Opening URL: ${url.grey.bold.underline}`);
  openInBrowser(url);

  process.exit(0);
}

if (options.viewGithubMarkdown) {
  await previewGithubMarkdown(options.viewGithubMarkdown);

  process.exit(0);
}

if (options.generateAsciidocLinks) {
  await generateAsciidocLinks(options.generateAsciidocLinks);

  process.exit(0);
}

if (noFilesFound) {
  printErrorMessage('No .adoc and .md files found in the directory or any of its subdirectories.');
  
  process.exit(0);
}

if (options.adocValidateLinks || options.all) {
  adocValidateLinks(asciiDocFiles);
}

if (options.adocValidateDates || options.all) {
  adocValidateDates(asciiDocFiles);
}

if (options.mdValidateLinks || options.all) {
  mdValidateLinks(markdownFiles)
}

#!/usr/bin/env node

import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import "colors";

import { findFilesByExtension } from './util/fileUtil.js';

import { Command } from 'commander';
import { validateLinks } from './optionHandlers/adocValidateLinks.js';
const program = new Command();

const packageJson = await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf8');
const versionNumber = JSON.parse(packageJson).version;

program
  .name('DoctorDoc')
  .description('AsciiDoc and Markdown Utility Tool.')  
  .version(versionNumber);


program
.option('--all', 'Run all checks (default if no other option is set).')
.option('--browse [path]', 'Open repository URL for file/directory. Defaults to the current directory if not path provided.')

program
.option('--adoc-validate-links', 'Validate that AsciiDoc links exist on the file system.')
.option('--adoc-validate-dates', 'Validate that dates exist within the calendar year.');

program
.option('--md-validate-links', 'Validate that Markdown file links exist on the file system.');


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


if (noFilesFound) {
    const message = [
        "No .adoc and .md files found in the directory or any of its subdirectories.".bold.underline.red,
      ].join('\n');
      
    console.log(message);
    process.exit(0);
}

console.log(options)
if (options.browse) {
  const path = options.browse === true ? process.cwd() : options.browse;

}

if (options.adocValidateLinks || options.all) {

}

if (options.adocValidateDates || options.all) {

}

if (options.mdValidateLinks || options.all) {

}
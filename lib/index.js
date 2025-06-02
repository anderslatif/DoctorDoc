#!/usr/bin/env node

import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import "colors";

import { findAsciiDocFiles } from './util/fileUtil.js';

import { Command } from 'commander';
import { validateLinks } from './optionHandlers/validateLinks.js';
const program = new Command();

const packageJson = await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf8');
const versionNumber = JSON.parse(packageJson).version;

program
  .name('AsciiDocDoctor')
  .description('AsciiDoc Utility Tool.')  
  .version(versionNumber);



program
.option('--all', 'Run all checks. Defaults to true of no other options have been given.')
.option('--validate-links', 'Validates that the links defined in the AsciiDoc file exist on the file system.');


program.parse(process.argv);

const options = program.opts();

const noOptionsGiven = Object.keys(options).length === 0;
if (noOptionsGiven) {
  options.all = true;
}

const asciiDocFiles = await findAsciiDocFiles(process.cwd());
const directoriesPaths = Object.keys(asciiDocFiles);
const noFilesFound = asciiDocFiles.length === 0;

if (noFilesFound) {
    const message = [
        "No .adoc files found in the directory or any of its subdirectories.".bold.underline.red,
      ].join('\n');
      
    console.log(message);
    process.exit(0);
}

directoriesPaths.map(async (directoryPath) => {

  const filePathsInDirectory = asciiDocFiles[directoryPath];

  filePathsInDirectory.map(async (filePath) => {
    const fileContent = await fs.readFile(filePath, 'utf-8');
 
    if (options.validateLinks || options.all) {
      validateLinks(filePath, directoryPath, fileContent);
    }

  });

  
});

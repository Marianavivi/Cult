import fs from 'fs';
import path, { dirname } from 'path';
import assert from 'assert';
import { spawn } from 'child_process';
import syntaxError from 'syntax-error';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Resolve directory and file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(__dirname);

// Get directories from package.json
let folders = ['.', ...Object.keys(require(path.join(__dirname, './package.json')).directories)];
let files = [];

// Collect all JavaScript files from specified directories
for (let folder of folders) {
  let folderFiles = fs.readdirSync(folder).filter(v => v.endsWith('.js'));
  for (let file of folderFiles) {
    files.push(path.resolve(path.join(folder, file)));
  }
}

// Check each file for syntax errors
for (let file of files) {
  if (file === __filename) continue;

  console.error('Checking', file);
  
  const fileContent = fs.readFileSync(file, 'utf8');
  const error = syntaxError(fileContent, file, {
    sourceType: 'module',
    allowReturnOutsideFunction: true,
    allowAwaitOutsideFunction: true,
  });
  
  if (error) {
    assert.ok(error.length < 1, `${file}\n\n${error}`);
  }
  
  assert.ok(file);
  console.log('Done', file);
}

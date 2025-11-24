#!/usr/bin/env node

/**
 * Script to remove all console.log statements from the codebase
 * Run: node scripts/remove-console-logs.js
 */

const fs = require('fs');
const path = require('path');

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', '.expo'];
const EXCLUDED_FILES = ['logger.ts', 'loggerService.ts', 'disableConsoleLogs.ts'];

let totalRemoved = 0;
let filesProcessed = 0;

function shouldProcessFile(filePath) {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath);
  
  // Check if file should be excluded
  if (EXCLUDED_FILES.includes(basename)) {
    return false;
  }
  
  // Check if extension is valid
  if (!EXTENSIONS.includes(ext)) {
    return false;
  }
  
  // Check if in excluded directory
  for (const excludedDir of EXCLUDED_DIRS) {
    if (filePath.includes(`/${excludedDir}/`)) {
      return false;
    }
  }
  
  return true;
}

function removeConsoleLogs(content) {
  let removedCount = 0;
  
  // Patterns to match console statements
  const patterns = [
    // Simple console.log/warn/info/debug statements
    /console\.(log|warn|info|debug|trace|table|group|groupEnd|time|timeEnd)\([^)]*\);?/g,
    // Multi-line console statements
    /console\.(log|warn|info|debug|trace|table|group|groupEnd|time|timeEnd)\([^)]*\n[^)]*\);?/g,
    // Console statements with template literals
    /console\.(log|warn|info|debug|trace|table|group|groupEnd|time|timeEnd)\(`[^`]*`\);?/g,
  ];
  
  let modifiedContent = content;
  
  patterns.forEach(pattern => {
    const matches = modifiedContent.match(pattern);
    if (matches) {
      removedCount += matches.length;
      modifiedContent = modifiedContent.replace(pattern, '// console removed');
    }
  });
  
  return { modifiedContent, removedCount };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { modifiedContent, removedCount } = removeConsoleLogs(content);
    
    if (removedCount > 0) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      // console removed
      totalRemoved += removedCount;
    }
    
    filesProcessed++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        const basename = path.basename(filePath);
        if (!EXCLUDED_DIRS.includes(basename)) {
          walkDir(filePath);
        }
      } else if (stat.isFile() && shouldProcessFile(filePath)) {
        processFile(filePath);
      }
    });
  } catch (error) {
    console.error(`❌ Error walking directory ${dir}:`, error.message);
  }
}

// Main execution
// console removed

const projectRoot = path.resolve(__dirname, '..');
walkDir(projectRoot);

// console removed);
// console removed
// console removed
// console removed);

// Create a backup note
const summaryFile = path.join(projectRoot, 'console-removal-summary.txt');
const summary = `Console Removal Summary
========================
Date: ${new Date().toISOString()}
Total Removed: ${totalRemoved}
Files Processed: ${filesProcessed}
`;

fs.writeFileSync(summaryFile, summary, 'utf8');
// console removed

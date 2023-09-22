import * as fs from 'fs';
import * as path from 'path';

interface DirectoryItem {
  name: string;
  isDirectory: boolean;
}

function extractFolderContent(folderPath: string): DirectoryItem[] {
  const items: DirectoryItem[] = [];

  const entries = fs.readdirSync(folderPath);

  entries.forEach((entry) => {
    const entryPath = path.join(folderPath, entry);
    const stats = fs.statSync(entryPath);

    const item: DirectoryItem = {
      name: entry,
      isDirectory: stats.isDirectory(),
    };

    items.push(item);

    if (stats.isDirectory()) {
      item.isDirectory = true;
      item.children = extractFolderContent(entryPath);
    }
  });

  return items;
}

const folderPath = './src/static/nodejs-typescript-extract-zip.zip';
const result = extractFolderContent(folderPath);

console.log(JSON.stringify(result, null, 2));

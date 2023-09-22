import fs from 'fs';
import path from 'path';
import  decompress  from 'decompress';
import {fileTypeFromFile} from 'file-type';
import { isText, isBinary, getEncoding } from 'istextorbinary'


interface FileSystemItem {
  name: string;
  isDirectory: boolean;
  content?: string;
  children?: FileSystemItem[];
}

const compressedFilePath = './static/sample-1.zip'; // Replace with your compressed file path
const outputFilePath = './static/output.json';

async function extractAndBuildStructure(compressedFilePath: string): Promise<FileSystemItem> {

  // const tempDir = await fs.promises.mkdtemp(path.join(__dirname, 'temp-'));
  const tempDir = path.join(__dirname, "tempDir");

  await decompress(compressedFilePath, tempDir);

console.log(tempDir)
  // remove mac OS generated files for testing
  const macOSXFolder = path.join(tempDir, '__MACOSX');
   await fs.promises.rmdir(macOSXFolder, { recursive: true });

  const stats = await fs.promises.stat(tempDir);
  const item: FileSystemItem = {
    name: path.basename(tempDir),
    isDirectory: stats.isDirectory(),
  };

  if (item.isDirectory) {
    const entries = await fs.promises.readdir(tempDir);
    item.children = [];

    for (const entry of entries) {
      const entryPath = path.join(tempDir, entry);
      item.children.push(await buildDirectoryStructure(entryPath));
    }
  }

  // Clean up the temporary directory
  await fs.promises.rm(tempDir, { recursive: true });
  return item;
}

async function buildDirectoryStructure(dirPath: string): Promise<FileSystemItem> {

  const stats = await fs.promises.stat(dirPath);
  const item: FileSystemItem = {
    name: path.basename(dirPath),
    isDirectory: stats.isDirectory(),
  };

  if (item.isDirectory) {
    const entries = await fs.promises.readdir(dirPath);
    item.children = [];
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry);
      item.children.push(await buildDirectoryStructure(entryPath));

    }
  }else{
      // item.content = await fs.promises.readFile(dirPath, 'utf-8');
      // console.log(dirPath, await isTextFile(dirPath))
      if(isBinary(dirPath)){
        // console.log((await fs.promises.readFile(dirPath, {encoding: 'ascii'})).toString());
      }
  
  }

  return item;
}

async function runExtractionAndStructureBuilding() : Promise<FileSystemItem>{
  try {
    // Extract and build the structured object of the extracted contents
    const contents = await extractAndBuildStructure(compressedFilePath);
    // console.log(JSON.stringify(contents, null, 2)); // Print the contents to the console
    await saveJsonToFile(contents, outputFilePath);
    return contents

  } catch (error) {
    console.error((error as Error).message);
    throw new Error(error as string);
  }
}

async function saveJsonToFile(jsonData: any, filePath: string) {
  await fs.promises.writeFile(filePath, JSON.stringify(jsonData, null, 2));
  console.log(`JSON data saved to ${filePath}`);
}

// Run the extraction and structure building when the file is executed
runExtractionAndStructureBuilding();
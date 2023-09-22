import fs from "fs";
import path from "path";
import decompress from "decompress";
import { isText } from "istextorbinary";

interface FileSystemItem {
  name: string;
  isDirectory: boolean;
  content?: string;
  children?: FileSystemItem[];
}

const compressedFilePath = "static/sample-1.zip"; // Replace with your compressed file path
const outputFilePath = "./static/output.json";

async function extractAndBuildStructure(
  compressedFilePath: string
): Promise<FileSystemItem> {
  const tempDir = path.join(__dirname, "tempDir");

  await decompress(compressedFilePath, tempDir);
  console.log(compressedFilePath)

  // remove mac OS generated files for testing / localfiles
  const macOSXFolder = path.join(tempDir, "__MACOSX");
  await fs.promises.rm(macOSXFolder, { recursive: true });

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

const  buildDirectoryStructure = async(
  dirPath: string
): Promise<FileSystemItem> => {
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
  } else {
    if (isText(dirPath)) {
      item.content = await fs.promises.readFile(dirPath, "utf8");
      // console.log(await fs.promises.readFile(dirPath, "utf8"), true);
    }
  }
  return item;
}

 const runExtractionAndStructureBuilding =  async (compressedFilePath: string): Promise<FileSystemItem> => {
  try {
    // Extract and build the structured object of the extracted contents
    const contents = await extractAndBuildStructure(compressedFilePath);

    await saveJsonToFile(contents, outputFilePath);
    return contents;
  } catch (error) {
    throw new Error(error as string);
  }
}

async function saveJsonToFile(jsonData: any, filePath: string) {
  await fs.promises.writeFile(filePath, JSON.stringify(jsonData, null, 2));
  console.log(`JSON data saved to ${filePath}`);
}

// Run the extraction and structure building when the file is executed
runExtractionAndStructureBuilding(compressedFilePath);
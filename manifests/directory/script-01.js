import { Bee, MantarayNode } from "@ethersphere/bee-js";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { printManifestJson } from "./manifestToJson.js";

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bee = new Bee(process.env.BEE_RPC_URL);
const postageBatchId = process.env.POSTAGE_BATCH_ID;

// Build the folder path safely
const directoryPath = path.join(__dirname, "directory");

async function uploadDirectory() {
  try {
    console.log("Uploading directory:", directoryPath);

    // Upload using the resolved directory and get manifest reference
    const { reference } = await bee.uploadFilesFromDirectory(
      postageBatchId,
      directoryPath
    );

    console.log("Directory uploaded successfully!");
    console.log("Manifest reference:", reference.toHex());

    // Download each file using its relative path as recorded by the manifest
    const root = await bee.downloadFile(reference, "root.txt");
    const nested = await bee.downloadFile(reference, "folder/nested.txt");
    const deep = await bee.downloadFile(reference, "folder/subfolder/deep.txt");

    // Print out file contents
    console.log("root.txt:", root.data.toUtf8());
    console.log("folder/nested.txt:", nested.data.toUtf8());
    console.log("folder/subfolder/deep.txt:", deep.data.toUtf8());

    // Load the generated manifest
    const node = await MantarayNode.unmarshal(bee, reference);
    await node.loadRecursively(bee);

    // Print manifest in human readable format
    console.log("\n--- Manifest Tree ---");
    printManifestJson(node);
  } catch (error) {
    console.error("Error during upload or download:", error.message);
  }
}

uploadDirectory();
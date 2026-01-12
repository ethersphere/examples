import dotenv from "dotenv";
dotenv.config();

import { Bee, MantarayNode } from "@ethersphere/bee-js";
import { printManifestJson } from "../utils/manifestToJson.js";

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;

// IMPORTANT: replace this with the output of script-01.js in your .env file each time you re-upload with new contents
const manifestReference = process.env.SCRIPT_02_MANIFEST;

async function run() {
  try {
    // Load existing manifest
    const node = await MantarayNode.unmarshal(bee, manifestReference);
    await node.loadRecursively(bee);

    // New file to add
    const filename = "new.txt";
    const content = "Hi, I'm new here.";
    const bytes = new TextEncoder().encode(content);

    // Upload the file content (this is a *file/data reference*, not a manifest reference)
    const { reference: fileReference } = await bee.uploadData(batchId, bytes);

    console.log("\nNew file content reference:", fileReference.toHex(), "\n");
    console.log(
      "New file direct URL:",
      `${process.env.BEE_URL.replace(/\/+$/, "")}/bzz/${fileReference.toHex()}\n`
    );

    const metadata = {
      "Content-Type": "text/plain; charset=utf-8",
      Filename: filename,
    };

    // Add the file into the manifest
    node.addFork(filename, fileReference, metadata);

    // Save updated manifest
    const updatedManifest = await node.saveRecursively(bee, batchId);
    const updatedManifestReference = updatedManifest.reference.toHex();

    console.log("Updated manifest reference:", updatedManifestReference);
    console.log(
      "Updated manifest URL:",
      `${process.env.BEE_URL.replace(/\/+$/, "")}/bzz/${updatedManifestReference}/\n`
    );

    console.log("\n--- Updated Manifest Tree ---\n");
    printManifestJson(node);

    // Verify file is accessible through the updated manifest
    const newFile = await bee.downloadFile(updatedManifest.reference, filename);
    console.log(`${filename}:`, newFile.data.toUtf8());
  } catch (error) {
    console.error("Error during upload or download:", error.message);
  }
}

run();

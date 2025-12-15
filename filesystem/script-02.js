import dotenv from "dotenv";
dotenv.config();

import { Bee, MantarayNode } from "@ethersphere/bee-js";
import { printManifestJson } from "../utils/manifestToJson.js";

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;

// IMPORTANT: replace this with the output of script-01.js each time you re-upload
const MANIFEST_REFERENCE = process.env.SCRIPT_02_MANIFEST;

async function addFileToManifest() {
  try {
    const node = await MantarayNode.unmarshal(bee, MANIFEST_REFERENCE);
    await node.loadRecursively(bee);

    const filename = "new.txt";
    const content = "Hi, I'm new here.";
    const bytes = new TextEncoder().encode(content);

    const { reference } = await bee.uploadData(batchId, bytes);
    console.log("Uploaded raw reference:", reference.toHex());

    const metadata = {
      "Content-Type": "text/plain; charset=utf-8",
      Filename: filename,
    };

    node.addFork(filename, reference, metadata);

    const newManifest = await node.saveRecursively(bee, batchId);
    const newReference = newManifest.reference.toHex();

    console.log("Updated manifest hash:", newReference);
    printManifestJson(node);

    const newFile = await bee.downloadFile(newManifest.reference, filename);
    console.log("new.txt:", newFile.data.toUtf8());

  } catch (error) {
    console.error("Error during upload or download:", error.message);
  }
}

addFileToManifest();

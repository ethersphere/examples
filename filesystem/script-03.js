import dotenv from "dotenv";
dotenv.config();

import { Bee, MantarayNode } from "@ethersphere/bee-js";
import { printManifestJson } from "../utils/manifestToJson.js";

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;

// Replace with output of script-02.js
const manifestReference = process.env.SCRIPT_03_MANIFEST;

async function run() {
  try {
    const node = await MantarayNode.unmarshal(bee, manifestReference);
    await node.loadRecursively(bee);

    const original = await MantarayNode.unmarshal(bee, manifestReference);
    await original.loadRecursively(bee);

    const existing = original.find("new.txt");
    if (!existing) throw new Error("new.txt not found — run script-02.js first.");

    const fileReference = existing.targetAddress;

    node.removeFork("new.txt");
    console.log("Removed /new.txt");

    const newPath = "nested/deeper/new.txt";
    node.addFork(newPath, fileReference, {
      "Content-Type": "text/plain; charset=utf-8",
      Filename: "new.txt",
    });

    console.log(`Added file under /${newPath}`);

    const updatedManifest = await node.saveRecursively(bee, batchId);
    const updatedManifestReference = updatedManifest.reference.toHex();

    console.log("\nUpdated manifest reference:", updatedManifestReference, "\n");
    console.log(
      "URL:",
      `${process.env.BEE_URL.replace(/\/+$/, "")}/bzz/${updatedManifestReference}/\n`
    );

    console.log("\n--- Updated Manifest Tree ---\n");
    printManifestJson(node);

    const downloaded = await bee.downloadFile(updatedManifest.reference, newPath);
    console.log(`\nContents of /${newPath}:`);
    console.log(downloaded.data.toUtf8());
  } catch (error) {
    console.error("Error while modifying manifest:", error.message);
  }
}

run();

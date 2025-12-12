import dotenv from "dotenv";
dotenv.config();

import { Bee, MantarayNode } from "@ethersphere/bee-js";
import { printManifestJson } from "../utils/manifestToJson.js";

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;

// Replace with output of script-02.js
const ROOT_MANIFEST = process.env.SCRIPT_03_MANIFEST;

async function moveFileInManifest() {
  try {
    const node = await MantarayNode.unmarshal(bee, ROOT_MANIFEST);
    await node.loadRecursively(bee);

    const original = await MantarayNode.unmarshal(bee, ROOT_MANIFEST);
    await original.loadRecursively(bee);

    const existing = original.find("new.txt");
    if (!existing) throw new Error("new.txt not found — run script-02.js first.");

    const fileRef = existing.targetAddress;

    node.removeFork("new.txt");
    console.log("Removed /new.txt");

    const newPath = "nested/deeper/new.txt";
    node.addFork(newPath, fileRef, {
      "Content-Type": "text/plain; charset=utf-8",
      Filename: "new.txt",
    });

    console.log(`Added file under /${newPath}`);

    const updated = await node.saveRecursively(bee, batchId);
    const newManifestRef = updated.reference.toHex();

    console.log("Updated manifest hash:", newManifestRef);

    printManifestJson(node);

    const downloaded = await bee.downloadFile(updated.reference, newPath);
    console.log(`\nContents of /${newPath}:`);
    console.log(downloaded.data.toUtf8());

  } catch (error) {
    console.error("Error while modifying manifest:", error.message);
  }
}

moveFileInManifest();

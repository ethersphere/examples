import dotenv from "dotenv";
dotenv.config();

import { Bee, MantarayNode } from "@ethersphere/bee-js";

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;
const manifestReference = process.env.BASE_MANIFEST;

async function run() {
  try {
    if (!manifestReference) throw new Error("Missing BASE_MANIFEST in .env");

    const node = await MantarayNode.unmarshal(bee, manifestReference);
    await node.loadRecursively(bee);

    const about =
      node.find("about.html") ||
      node.find("/about.html") ||
      node.find("site/about.html"); // last-ditch, just in case

    if (!about) {
      // print keys so you can see what's actually there
      console.log("Manifest paths:");
      for (const [k] of node.forks.entries()) console.log("-", k);
      throw new Error("about.html not found in manifest (see printed paths above)");
    }

    const fileReference = about.targetAddress;
    const metadata = about.metadata;

    node.addFork("about", fileReference, metadata);
    node.addFork("about/", fileReference, metadata);

    const updatedManifest = await node.saveRecursively(bee, batchId);
    const updatedManifestReference = updatedManifest.reference.toHex();

    console.log("\nUpdated manifest reference:", updatedManifestReference, "\n");
    console.log(
      "URL:",
      `${process.env.BEE_URL.replace(/\/+$/, "")}/bzz/${updatedManifestReference}/\n`
    );
  } catch (error) {
    console.error("Error while modifying manifest:", error.message);
  }
}

run();

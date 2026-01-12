// remove-and-add-route.js
import "dotenv/config";
import { Bee, MantarayNode } from "@ethersphere/bee-js";

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;
const manifestReference = process.env.BASE_MANIFEST;

const node = await MantarayNode.unmarshal(bee, manifestReference);
await node.loadRecursively(bee);

// Reuse the content behind about.html
const about = node.find("about.html");
if (!about) throw new Error("about.html not found in manifest");

const fileReference = about.targetAddress;
const metadata = about.metadata;

// 1) Remove all existing routes for this page/content
node.removeFork("about");
node.removeFork("about/");
node.removeFork("about.html");

// 2) Add new routes that point to the same content
node.addFork("moved-about", fileReference, metadata);
node.addFork("moved-about/", fileReference, metadata);

// Save updated manifest
const updatedManifest = await node.saveRecursively(bee, batchId);
const updatedManifestReference = updatedManifest.reference.toHex();

console.log("\nUpdated manifest reference:", updatedManifestReference, "\n");
console.log(
  "URL:",
  `${process.env.BEE_URL.replace(/\/+$/, "")}/bzz/${updatedManifestReference}/\n`
);

console.log("Routes now:");
console.log("  /moved-about");
console.log("  /moved-about/");
console.log("Removed:");
console.log("  /about");
console.log("  /about/");
console.log("  /about.html");

import crypto from "crypto";
import { Bee, Topic, PrivateKey } from "@ethersphere/bee-js";

// -----------------------------------------
// Config
// -----------------------------------------

const BEE_URL = "http://localhost:1633";
const bee = new Bee(BEE_URL);

// Your postage batch ID (replace before running)
const batchId = "3d98a22f522377ae9cc2aa3bca7f352fb0ed6b16bad73f0246b0a5c155f367bc";

// Directory containing your built Vite app
const DIST_DIR = "./dist";

// -----------------------------------------
// 1. Create a publisher private key
// -----------------------------------------

// Generate a new random private key
const publisher = new PrivateKey("0x" + crypto.randomBytes(32).toString("hex"));
console.log("Publisher private key:", publisher.toHex());

const owner = publisher.publicKey().address();

// -----------------------------------------
// 2. Create a feed topic and writer
// -----------------------------------------

const topic = Topic.fromString("website");
const writer = bee.makeFeedWriter(topic, publisher);

// -----------------------------------------
// 3. Upload the built site directory
// -----------------------------------------

const upload = await bee.uploadFilesFromDirectory(batchId, DIST_DIR, {
  indexDocument: "index.html",
  errorDocument: "404.html",
});

console.log("Website Swarm hash:", upload.reference.toHex());

// -----------------------------------------
// 4. Publish the site hash to the feed
// -----------------------------------------

await writer.uploadReference(batchId, upload.reference);

// -----------------------------------------
// 5. Create a feed manifest and print URL
// -----------------------------------------

const manifestRef = await bee.createFeedManifest(batchId, topic, owner);
const manifestHex = manifestRef.toHex();

console.log("Feed manifest:", manifestHex);

// Correct Bee-style local URL
console.log("Local URL:", `${BEE_URL}/bzz/${manifestHex}/`);

/**
 * add-author.js — Add a new author to the blog
 *
 * Generates a new private key for the author, creates their feed and manifest,
 * appends their entry to authors.json, re-uploads the index, and updates config.json.
 *
 * Usage:
 *   node add-author.js <author-name>
 *
 * Example:
 *   node add-author.js charlie
 */

import { Bee, Topic, PrivateKey } from "@ethersphere/bee-js";
import crypto from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { config } from "dotenv";
config();

const [,, authorName] = process.argv;

if (!authorName) {
  console.error('Usage: node add-author.js <author-name>');
  process.exit(1);
}

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;
const cfg = JSON.parse(readFileSync("config.json", "utf-8"));
const authors = JSON.parse(readFileSync("authors.json", "utf-8"));

// Check if author already exists
if (authors.some(a => a.name.toLowerCase() === authorName.toLowerCase())) {
  console.error(`Author "${authorName}" already exists`);
  process.exit(1);
}

// Generate new key for the author
function makeKey() {
  const hex = "0x" + crypto.randomBytes(32).toString("hex");
  return new PrivateKey(hex);
}

const newKey = makeKey();
const newOwner = newKey.publicKey().address();
const newTopic = Topic.fromString(`${authorName.toLowerCase()}-posts`);

// --- Step 1: Upload initial blog page ---
const newAuthorHTML = generateAuthorHTML(authorName, []);
const upload = await bee.uploadFile(batchId, newAuthorHTML, "index.html", {
  contentType: "text/html",
});

// --- Step 2: Create author feed ---
const authorWriter = bee.makeFeedWriter(newTopic, newKey);
await authorWriter.upload(batchId, upload.reference);

// --- Step 3: Create feed manifest ---
const authorManifest = await bee.createFeedManifest(batchId, newTopic, newOwner);

console.log(`${authorName} feed manifest:`, authorManifest.toHex());

// --- Step 4: Update authors.json ---
authors.push({
  name: authorName,
  topic: `${authorName.toLowerCase()}-posts`,
  owner: newOwner.toHex(),
  feedManifest: authorManifest.toHex(),
});

const authorsJson = JSON.stringify(authors, null, 2);
writeFileSync("authors.json", authorsJson);

// --- Step 5: Re-upload authors.json to index feed ---
const indexUpload = await bee.uploadFile(batchId, authorsJson, "authors.json", {
  contentType: "application/json",
});

const indexTopic = Topic.fromString(cfg.topics.index);
const adminKey = new PrivateKey(cfg.admin.privateKey);
const indexWriter = bee.makeFeedWriter(indexTopic, adminKey);
await indexWriter.upload(batchId, indexUpload.reference);

console.log("Index feed updated");

// --- Step 6: Update config.json ---
const newAuthorKey = authorName.toLowerCase();
cfg[newAuthorKey] = { privateKey: newKey.toHex(), owner: newOwner.toHex() };
cfg.topics[newAuthorKey] = `${authorName.toLowerCase()}-posts`;
cfg.manifests[newAuthorKey] = authorManifest.toHex();

writeFileSync("config.json", JSON.stringify(cfg, null, 2));

console.log(`\n${authorName} added!`);
console.log(`Feed manifest: ${authorManifest.toHex()}`);
console.log(`View: ${process.env.BEE_URL}/bzz/${authorManifest.toHex()}/`);
console.log(`\nRun 'node update-index.js' to refresh the homepage with the new author.`);

function generateAuthorHTML(name, posts) {
  const items = posts
    .map(
      (p) => `
    <div style="border:1px solid #ddd; padding:12px; margin:8px 0; border-radius:4px;">
      <h2 style="margin:0 0 4px 0;">${p.title}</h2>
      <small style="color:#888;">${p.date}</small>
      <p>${p.body}</p>
    </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${name}'s Blog</title></head>
<body style="max-width:680px; margin:40px auto; font-family:sans-serif;">
  <h1>${name}'s Blog</h1>
  <p>${posts.length} post${posts.length !== 1 ? "s" : ""}</p>
  ${items || "<p><em>No posts yet.</em></p>"}
</body>
</html>`;
}

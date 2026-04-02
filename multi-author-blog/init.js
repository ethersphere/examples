/**
 * init.js — Initialize the multi-author blog.
 *
 * Run once to:
 *  1. Generate keys for admin, Alice, and Bob
 *  2. Create feeds and feed manifests for each author
 *  3. Build and upload the authors.json index feed
 *  4. Generate and upload the homepage feed
 *  5. Save all config to config.json
 *
 * Usage:
 *   node init.js
 */

import { Bee, Topic, PrivateKey } from "@ethersphere/bee-js";
import crypto from "crypto";
import { writeFileSync } from "fs";
import { config } from "dotenv";
config();

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;

function makeKey() {
  const hex = "0x" + crypto.randomBytes(32).toString("hex");
  return new PrivateKey(hex);
}

// Generate keys for admin, Alice, and Bob
const adminKey = makeKey();
const aliceKey = makeKey();
const bobKey   = makeKey();

const adminOwner = adminKey.publicKey().address();
const aliceOwner = aliceKey.publicKey().address();
const bobOwner   = bobKey.publicKey().address();

// Topics — each feed has a unique topic
const aliceTopic = Topic.fromString("alice-posts");
const bobTopic   = Topic.fromString("bob-posts");
const indexTopic = Topic.fromString("blog-index");
const homeTopic  = Topic.fromString("blog-home");

// --- Step 1: Upload initial author pages ---
const aliceHTML = generateAuthorHTML("Alice", []);
const bobHTML   = generateAuthorHTML("Bob",   []);

const aliceUpload = await bee.uploadFile(batchId, aliceHTML, "index.html", {
  contentType: "text/html",
});
const bobUpload = await bee.uploadFile(batchId, bobHTML, "index.html", {
  contentType: "text/html",
});

// --- Step 2: Create author feeds ---
const aliceWriter = bee.makeFeedWriter(aliceTopic, aliceKey);
const bobWriter   = bee.makeFeedWriter(bobTopic,   bobKey);

await aliceWriter.upload(batchId, aliceUpload.reference);
await bobWriter.upload(batchId, bobUpload.reference);

// --- Step 3: Create author feed manifests (stable references) ---
const aliceManifest = await bee.createFeedManifest(batchId, aliceTopic, aliceOwner);
const bobManifest   = await bee.createFeedManifest(batchId, bobTopic,   bobOwner);

console.log("Alice feed manifest:", aliceManifest.toHex());
console.log("Bob feed manifest:  ", bobManifest.toHex());

// --- Step 4: Build and upload the authors.json index ---
const authors = [
  {
    name: "Alice",
    topic: "alice-posts",
    owner: aliceOwner.toHex(),
    feedManifest: aliceManifest.toHex(),
  },
  {
    name: "Bob",
    topic: "bob-posts",
    owner: bobOwner.toHex(),
    feedManifest: bobManifest.toHex(),
  },
];
const authorsJson = JSON.stringify(authors, null, 2);
writeFileSync("authors.json", authorsJson);

const indexUpload = await bee.uploadFile(batchId, authorsJson, "authors.json", {
  contentType: "application/json",
});

// --- Step 5: Create the index feed ---
const indexWriter = bee.makeFeedWriter(indexTopic, adminKey);
await indexWriter.upload(batchId, indexUpload.reference);
const indexManifest = await bee.createFeedManifest(batchId, indexTopic, adminOwner);

console.log("Index feed manifest:", indexManifest.toHex());

// --- Step 6: Generate and upload the homepage ---
const homeHTML = generateHomepageHTML(authors, []);
const homeUpload = await bee.uploadFile(batchId, homeHTML, "index.html", {
  contentType: "text/html",
});

const homeWriter = bee.makeFeedWriter(homeTopic, adminKey);
await homeWriter.upload(batchId, homeUpload.reference);
const homeManifest = await bee.createFeedManifest(batchId, homeTopic, adminOwner);

// --- Step 7: Save config ---
const cfg = {
  admin: { privateKey: adminKey.toHex(), owner: adminOwner.toHex() },
  alice: { privateKey: aliceKey.toHex(), owner: aliceOwner.toHex() },
  bob:   { privateKey: bobKey.toHex(),   owner: bobOwner.toHex()   },
  topics: {
    alice: "alice-posts",
    bob:   "bob-posts",
    index: "blog-index",
    home:  "blog-home",
  },
  manifests: {
    alice: aliceManifest.toHex(),
    bob:   bobManifest.toHex(),
    index: indexManifest.toHex(),
    home:  homeManifest.toHex(),
  },
};
writeFileSync("config.json", JSON.stringify(cfg, null, 2));

console.log("\nBlog initialized!");
console.log("Homepage:      " + `${process.env.BEE_URL}/bzz/${homeManifest.toHex()}/`);
console.log("Alice's feed:  " + `${process.env.BEE_URL}/bzz/${aliceManifest.toHex()}/`);
console.log("Bob's feed:    " + `${process.env.BEE_URL}/bzz/${bobManifest.toHex()}/`);

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

function generateHomepageHTML(authors, latestPosts) {
  const cards = authors
    .map(
      (a) => {
        const latest = latestPosts.find((p) => p.author === a.name);
        const preview = latest
          ? `<p><strong>${latest.title}</strong> — ${latest.date}</p><p>${latest.body.slice(0, 120)}…</p>`
          : `<p><em>No posts yet.</em></p>`;
        return `<div style="border:1px solid #ddd; padding:16px; margin:12px 0; border-radius:4px;">
      <h2 style="margin:0 0 8px 0;"><a href="/bzz/${a.feedManifest}/">${a.name}</a></h2>
      ${preview}
    </div>`;
      }
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Multi-Author Blog</title></head>
<body style="max-width:680px; margin:40px auto; font-family:sans-serif;">
  <h1>Multi-Author Blog</h1>
  <p>${authors.length} author${authors.length !== 1 ? "s" : ""}</p>
  ${cards}
</body>
</html>`;
}

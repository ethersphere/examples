/**
 * update-index.js — Admin aggregates author feeds and updates the homepage.
 *
 * Reads each author's feed to confirm it is live, loads the latest post
 * from the local post sidecars, regenerates the homepage HTML with
 * previews, and updates the homepage feed.
 *
 * Usage:
 *   node update-index.js
 */

import { Bee, Topic, EthAddress, PrivateKey } from "@ethersphere/bee-js";
import { readFileSync, writeFileSync } from "fs";
import { config } from "dotenv";
config();

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;
const cfg = JSON.parse(readFileSync("config.json", "utf-8"));
const authors = JSON.parse(readFileSync("authors.json", "utf-8"));

// Read each author's latest feed entry to confirm their feed is live
const latestPosts = [];
for (const author of authors) {
  const topic  = Topic.fromString(author.topic);
  const owner  = new EthAddress(author.owner);
  const reader = bee.makeFeedReader(topic, owner);

  try {
    const result = await reader.download();
    console.log(`${author.name}: feed index ${result.feedIndex.toBigInt()}`);

    // Load the local post sidecar to get post data for the preview
    const postsFile = `${author.name.toLowerCase()}-posts.json`;
    const posts = JSON.parse(readFileSync(postsFile, "utf-8"));
    const latest = posts.at(-1);
    if (latest) {
      latestPosts.push({ author: author.name, ...latest });
    }
  } catch {
    console.log(`${author.name}: no feed entries yet`);
  }
}

// Regenerate homepage with latest post previews from all authors
const homeHTML = generateHomepageHTML(authors, latestPosts);
const homeUpload = await bee.uploadFile(batchId, homeHTML, "index.html", {
  contentType: "text/html",
});

const adminKey  = new PrivateKey(cfg.admin.privateKey);
const homeTopic = Topic.fromString(cfg.topics.home);
const homeWriter = bee.makeFeedWriter(homeTopic, adminKey);
await homeWriter.upload(batchId, homeUpload.reference);

console.log("\nHomepage updated!");
console.log("View: " + `${process.env.BEE_URL}/bzz/${cfg.manifests.home}/`);

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

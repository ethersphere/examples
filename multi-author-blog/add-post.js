/**
 * add-post.js — Author publishes a new post
 *
 * Reads the author's existing post list, appends the new post, regenerates
 * their blog page HTML, uploads it, and updates their feed.
 *
 * Usage:
 *   node add-post.js <alice|bob> "Post title" "Post body"
 *
 * Example:
 *   node add-post.js alice "Hello Swarm" "My first post on a decentralized blog."
 *   node add-post.js bob "Why Swarm?" "Censorship resistance matters."
 */

import { Bee, Topic, PrivateKey } from "@ethersphere/bee-js";
import { readFileSync, writeFileSync } from "fs";
import { config } from "dotenv";
config();

const [,, authorArg, title, ...bodyWords] = process.argv;
const body = bodyWords.join(" ");

if (!authorArg || !title || !body) {
  console.error('Usage: node add-post.js <alice|bob> "Post title" "Post body"');
  process.exit(1);
}

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;
const cfg = JSON.parse(readFileSync("config.json", "utf-8"));

const author = cfg[authorArg];
if (!author) {
  console.error(`Unknown author: ${authorArg}`);
  process.exit(1);
}

const pk    = new PrivateKey(author.privateKey);
const topic = Topic.fromString(cfg.topics[authorArg]);

// Load or initialize the author's post list
const postsFile = `${authorArg}-posts.json`;
let posts = [];
try {
  posts = JSON.parse(readFileSync(postsFile, "utf-8"));
} catch {
  // First post — file doesn't exist yet
}

const newPost = { title, body, date: new Date().toISOString() };
posts.push(newPost);
writeFileSync(postsFile, JSON.stringify(posts, null, 2));

// Regenerate the author's page HTML
const html = generateAuthorHTML(
  authorArg.charAt(0).toUpperCase() + authorArg.slice(1),
  posts
);

// Upload and update the author's feed
const upload = await bee.uploadFile(batchId, html, "index.html", {
  contentType: "text/html",
});
const writer = bee.makeFeedWriter(topic, pk);
await writer.upload(batchId, upload.reference);

console.log(`Post published by ${authorArg}! (${posts.length} total)`);
console.log("View: " + `${process.env.BEE_URL}/bzz/${cfg.manifests[authorArg]}/`);

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
  ${items}
</body>
</html>`;
}

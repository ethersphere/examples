/**
 * post.js — Create, edit, or delete a blog post and update the feed.
 *
 * Each operation modifies the local posts.json, regenerates the
 * entire site, uploads it, and updates the feed. The feed manifest
 * URL stays the same.
 *
 * Usage:
 *   node post.js create <slug> "<title>" "<body>"
 *   node post.js edit   <slug> "<title>" "<body>"
 *   node post.js delete <slug>
 */

import { Bee, Topic, PrivateKey } from "@ethersphere/bee-js";
import { readFileSync, writeFileSync } from "fs";
import { config } from "dotenv";
import { writeSiteFiles } from "./html.js";

config();

const [action, ...args] = process.argv.slice(2);

if (!action || !["create", "edit", "delete"].includes(action)) {
  console.log(`Usage:
  node post.js create <slug> "<title>" "<body>"
  node post.js edit   <slug> "<title>" "<body>"
  node post.js delete <slug>`);
  process.exit(1);
}

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;
const cfg = JSON.parse(readFileSync("config.json", "utf-8"));
const posts = JSON.parse(readFileSync("posts.json", "utf-8"));

// --- Apply the action ---

if (action === "create") {
  const [slug, title, body] = args;
  if (!slug || !title || !body) {
    console.error('Usage: node post.js create <slug> "<title>" "<body>"');
    process.exit(1);
  }
  if (posts.find((p) => p.slug === slug)) {
    console.error(`Post "${slug}" already exists. Use "edit" to update it.`);
    process.exit(1);
  }
  posts.push({ slug, title, body, date: new Date().toISOString() });
  console.log(`Created post: ${slug}`);
}

if (action === "edit") {
  const [slug, title, body] = args;
  if (!slug || !title || !body) {
    console.error('Usage: node post.js edit <slug> "<title>" "<body>"');
    process.exit(1);
  }
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) {
    console.error(`Post "${slug}" not found.`);
    process.exit(1);
  }
  posts[idx] = { ...posts[idx], title, body, date: new Date().toISOString() };
  console.log(`Edited post: ${slug}`);
}

if (action === "delete") {
  const [slug] = args;
  if (!slug) {
    console.error("Usage: node post.js delete <slug>");
    process.exit(1);
  }
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) {
    console.error(`Post "${slug}" not found.`);
    process.exit(1);
  }
  posts.splice(idx, 1);
  console.log(`Deleted post: ${slug}`);
}

// --- Save, regenerate, upload, update feed ---

writeFileSync("posts.json", JSON.stringify(posts, null, 2));
writeSiteFiles(posts);

const pk = new PrivateKey(cfg.privateKey);
const topic = Topic.fromString(cfg.topic);
const writer = bee.makeFeedWriter(topic, pk);

const upload = await bee.uploadFilesFromDirectory(batchId, "./site", {
  indexDocument: "index.html",
});
await writer.upload(batchId, upload.reference);

console.log(
  `Blog updated! (${posts.length} post${posts.length !== 1 ? "s" : ""})`
);
console.log(`View: ${process.env.BEE_URL}/bzz/${cfg.manifest}/`);

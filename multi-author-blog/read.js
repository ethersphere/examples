/**
 * read.js — Read all feeds without private keys
 *
 * Reads the index feed to discover all authors, then reads each author's
 * feed and the homepage feed. No private keys required — only the config
 * for owner addresses and manifest hashes.
 *
 * Usage:
 *   node read.js
 */

import { Bee, Topic, EthAddress } from "@ethersphere/bee-js";
import { readFileSync } from "fs";
import { config } from "dotenv";
config();

const bee = new Bee(process.env.BEE_URL);
const cfg = JSON.parse(readFileSync("config.json", "utf-8"));

// Read the index feed to get the current authors manifest
const indexTopic = Topic.fromString(cfg.topics.index);
const indexOwner = new EthAddress(cfg.admin.owner);
const indexReader = bee.makeFeedReader(indexTopic, indexOwner);
const indexResult = await indexReader.downloadReference();
console.log("Index feed at index:", indexResult.feedIndex.toBigInt());

// Download the authors.json manifest
const authorsData = await bee.downloadFile(indexResult.reference);
const authors = JSON.parse(authorsData.data.toUtf8());

console.log(`\n${authors.length} authors in blog:\n`);

// For each author, read their feed
for (const author of authors) {
  const topic  = Topic.fromString(author.topic);
  const owner  = new EthAddress(author.owner);
  const reader = bee.makeFeedReader(topic, owner);
  try {
    const result = await reader.download();
    console.log(`${author.name}`);
    console.log(`  Feed index: ${result.feedIndex.toBigInt()}`);
    console.log(`  URL: ${process.env.BEE_URL}/bzz/${author.feedManifest}/`);
  } catch {
    console.log(`${author.name}: feed not yet populated`);
  }
}

// Read the homepage feed
const homeTopic  = Topic.fromString(cfg.topics.home);
const homeOwner  = new EthAddress(cfg.admin.owner);
const homeReader = bee.makeFeedReader(homeTopic, homeOwner);
const homeResult = await homeReader.downloadReference();
console.log(`\nHomepage feed at index: ${homeResult.feedIndex.toBigInt()}`);
console.log(`Homepage URL: ${process.env.BEE_URL}/bzz/${cfg.manifests.home}/`);

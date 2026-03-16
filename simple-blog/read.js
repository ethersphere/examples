/**
 * read.js — Read the blog feed.
 *
 * Demonstrates that anyone can read a feed using only the
 * owner address and topic — no private key required.
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

const topic = Topic.fromString(cfg.topic);
const owner = new EthAddress(cfg.owner);
const reader = bee.makeFeedReader(topic, owner);

const result = await reader.downloadReference();

console.log("Latest content reference:", result.reference.toHex());
console.log("Feed index:", result.feedIndex.toBigInt());
console.log(`View: ${process.env.BEE_URL}/bzz/${cfg.manifest}/`);

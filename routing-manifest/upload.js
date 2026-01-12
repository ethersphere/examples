// upload-no-feeds.js
import "dotenv/config";
import { Bee } from "@ethersphere/bee-js";

const bee = new Bee(process.env.BEE_URL);

const { reference } = await bee.uploadFilesFromDirectory(
  process.env.BATCH_ID,
  process.env.UPLOAD_DIR,
  { indexDocument: "index.html", errorDocument: "404.html" }
);

const ref = reference.toHex();
console.log("\nManifest reference:", ref, "\n");
console.log("URL:", `${process.env.BEE_URL.replace(/\/+$/, "")}/bzz/${ref}/\n`);

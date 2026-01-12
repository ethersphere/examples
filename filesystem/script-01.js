import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";
import { Bee, MantarayNode } from "@ethersphere/bee-js";
import { printManifestJson } from "../utils/manifestToJson.js";
import { uploadDirectory } from "../utils/upload-directory.js";

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bee = new Bee(process.env.BEE_URL);
const directoryPath = path.join(__dirname, process.env.UPLOAD_DIR);

async function run() {
  try {
    const reference = await uploadDirectory(directoryPath, { indexDocument: "disc.jpg" });

    console.log("\nManifest reference:", reference.toHex(), "\n");
    console.log("\nURL:", `${process.env.BEE_URL.replace(/\/+$/, "")}/bzz/${reference.toHex()}/\n`);

    const root = await bee.downloadFile(reference, "root.txt");

    const nested = await bee.downloadFile(reference, "subfolder/nested.txt");

    console.log("root.txt:", root.data.toUtf8());
    console.log("subfolder/nested.txt:", nested.data.toUtf8());


    const node = await MantarayNode.unmarshal(bee, reference);
    await node.loadRecursively(bee);

    console.log("\n--- Manifest Tree ---\n");
    printManifestJson(node);

   


  } catch (error) {
    console.error("Error during upload or download:", error.message);
  }
}

run();

import dotenv from "dotenv";
import { Bee, NULL_TOPIC, PrivateKey } from "@ethersphere/bee-js";

dotenv.config();

export async function uploadToSwarm() {
  const bee = new Bee(process.env.BEE_URL);
  const key = new PrivateKey(process.env.PUBLISHER_KEY);
  const owner = key.publicKey().address();

  const writer = bee.makeFeedWriter(NULL_TOPIC, key);

  const upload = await bee.uploadFilesFromDirectory(
    process.env.BATCH_ID,
    process.env.UPLOAD_DIR,
    { indexDocument: "index.html", errorDocument: "404.html" }
  );

  await writer.uploadReference(process.env.BATCH_ID, upload.reference);

  const manifest = await bee.createFeedManifest(
    process.env.BATCH_ID,
    NULL_TOPIC,
    owner
  );

  console.log(`\nWebsite Swarm Hash: ${process.env.BEE_URL}/bzz/${upload.reference.toHex()}`);
  console.log(`\nFeed Manifest: ${process.env.BEE_URL}/bzz/${manifest.toHex()}\n`);

}

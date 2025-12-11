import { Bee } from "@ethersphere/bee-js";

export async function uploadDirectory(path, options = {}) {
  const bee = new Bee(process.env.BEE_URL);
  const batchId = process.env.BATCH_ID;

  const upload = await bee.uploadFilesFromDirectory(batchId, path, options);

  console.log(`\nUploaded directory: ${path}\n`);
  console.log(`Reference: ${process.env.BEE_URL}/bzz/${upload.reference.toHex()}\n`);

  return upload.reference;
}
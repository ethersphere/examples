import { Bee } from "@ethersphere/bee-js";

export async function uploadDirectory(path, options = {}) {
  const bee = new Bee(process.env.BEE_URL);
  const batchId = process.env.BATCH_ID;

  const { reference } = await bee.uploadFilesFromDirectory(batchId, path, options);

  console.log(`\nUploaded directory: ${path}\n`);

  return reference;
}
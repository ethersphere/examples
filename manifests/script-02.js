import { Bee, MantarayNode } from "@ethersphere/bee-js"
import path from "path"
import { fileURLToPath } from "url"
import { printManifest } from './printManifest.js'

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const bee = new Bee('http://127.0.0.1:1633')
const postageBatchId = "3d98a22f522377ae9cc2aa3bca7f352fb0ed6b16bad73f0246b0a5c155f367bc"

// Build the folder path safely
const directoryPath = path.join(__dirname, "directory")

async function uploadDirectory() {
  try {
    console.log("Uploading directory:", directoryPath)

    // Upload using the resolved directory
    const { reference } = await bee.uploadFilesFromDirectory(postageBatchId, directoryPath)

    console.log("Directory uploaded successfully!")
    console.log("Manifest reference:", reference.toHex())

    // Load the generated manifest
    const node = await MantarayNode.unmarshal(bee, reference)
    await node.loadRecursively(bee)

    // Print raw manifest
    console.log('\n--- Manifest Tree ---')
    console.log(node)

  } catch (error) {
    console.error("Error during upload or download:", error.message)
  }
}

uploadDirectory()

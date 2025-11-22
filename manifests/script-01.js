import { Bee } from "@ethersphere/bee-js"
import path from "path"
import { fileURLToPath } from "url"

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const bee = new Bee("http://127.0.0.1:1633")
const postageBatchId = "3d98a22f522377ae9cc2aa3bca7f352fb0ed6b16bad73f0246b0a5c155f367bc"

// Build the folder path safely
const directoryPath = path.join(__dirname, "directory")

async function uploadDirectory() {
  try {
    console.log("Uploading directory:", directoryPath)

    // Upload using the resolved directory and get manifest reference
    const { reference } = await bee.uploadFilesFromDirectory(postageBatchId, directoryPath)

    console.log("Directory uploaded successfully!")
    console.log("Manifest reference:", reference.toHex())

    // Download each file using its relative path as recorded by the manifest
    const root = await bee.downloadFile(reference, "root.txt")
    const nested = await bee.downloadFile(reference, "folder/nested.txt")
    const deep = await bee.downloadFile(reference, "folder/subfolder/deep.txt")

    // Print out file contents
    console.log("root.txt:", root.data.toUtf8())
    console.log("folder/nested.txt:", nested.data.toUtf8())
    console.log("folder/subfolder/deep.txt:", deep.data.toUtf8())

  } catch (error) {
    console.error("Error during upload or download:", error.message)
  }
}

uploadDirectory()


import "dotenv/config"
import { Bee, MantarayNode } from "@ethersphere/bee-js"
import { printManifestJson } from './manifestToJson.js'

const bee = new Bee(process.env.BEE_RPC_URL)
const batchId = process.env.POSTAGE_BATCH_ID

// We specify the manifest returned from script-01.js here
const ROOT_MANIFEST = '4d5e6e3eb532131e128b1cd0400ca249f1a6ce5d4005c0b57bf848131300df9d'

async function addFileToManifest() {
    try {
        // Load the generated manifest from script-01.js
        const node = await MantarayNode.unmarshal(bee, ROOT_MANIFEST)
        await node.loadRecursively(bee)

        // File details for new file
        const filename = 'new.txt'
        const content = "Hi, I'm new here."
        const bytes = new TextEncoder().encode(content)

        // Upload raw file data 
        // Note we use "bee.uploadData()", not "bee.uploadFile()", since we need the root reference hash of the content, not a manifest reference. 
        const { reference } = await bee.uploadData(batchId, bytes)
        console.log('Uploaded raw reference:', reference.toHex())

        // Metadata must be a plain JS object — NOT a Map or Uint8Array
        const metadata = {
            'Content-Type': 'text/plain; charset=utf-8',
            'Filename': filename,
        }

        // Insert the new file data into our new manifest
        node.addFork(filename, reference, metadata)

        // Save and print updated manifest
        const newManifest = await node.saveRecursively(bee, batchId)
        const newReference = newManifest.reference
        console.log('Updated manifest hash:', newReference.toHex())
        printManifestJson(node)

        // Download new file and print its contents
        const newFile = await bee.downloadFile(newReference, "new.txt")
        console.log("new.txt:", newFile.data.toUtf8())

    }
    catch (error) {
        console.error("Error during upload or download:", error.message)
    }
}

addFileToManifest()
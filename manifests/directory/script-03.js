import "dotenv/config"
import { Bee, MantarayNode } from "@ethersphere/bee-js"
import { printManifestJson } from './manifestToJson.js'

const bee = new Bee(process.env.BEERPC_URL || process.env.BEE_RPC_URL)
const batchId = process.env.POSTAGE_BATCH_ID

// Manifest returned from script-02.js
const ROOT_MANIFEST = '4f67218844a814655c8d81aae4c4286a142318d672113973360c33c7930ce2f5'

async function moveFileInManifest() {
    try {
        // Load manifest generated in script-02
        const node = await MantarayNode.unmarshal(bee, ROOT_MANIFEST)
        await node.loadRecursively(bee)

        // Reload manifest to capture original file reference *before* deletion
        const original = await MantarayNode.unmarshal(bee, ROOT_MANIFEST)
        await original.loadRecursively(bee)

        const existing = original.find("new.txt")
        if (!existing) {
            throw new Error("Could not retrieve file reference for new.txt — run script-02.js first.")
        }

        const fileRef = existing.targetAddress

        // STEP 1 — Remove /new.txt
        node.removeFork("new.txt")
        console.log("Removed /new.txt from manifest.")

        // STEP 2 — Re-add under /nested/deeper/new.txt
        const newPath = "nested/deeper/new.txt"

        node.addFork(
            newPath,
            fileRef,
            {
                "Content-Type": "text/plain; charset=utf-8",
                "Filename": "new.txt"
            }
        )

        console.log(`Added file under /${newPath}`)

        // STEP 3 — Save updated manifest
        const updated = await node.saveRecursively(bee, batchId)
        const newManifestRef = updated.reference.toHex()

        console.log("Updated manifest hash:", newManifestRef)

        // STEP 4 — Print JSON
        printManifestJson(node)

        // STEP 5 — Download the file from its new location and print contents
        const downloaded = await bee.downloadFile(updated.reference, newPath)
        console.log(`\nContents of /${newPath}:`)
        console.log(downloaded.data.toUtf8())

    } catch (error) {
        console.error("Error while modifying manifest:", error.message)
    }
}

moveFileInManifest()
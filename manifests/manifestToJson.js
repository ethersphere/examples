
// Convert Uint8Array to ASCII (path segments)
function bytesToAscii(u8) {
  if (!u8 || u8.length === 0) return ''
  return String.fromCharCode(...u8)
}

// Convert Uint8Array to hex (target addresses)
function bytesToHex(u8) {
  if (!u8 || u8.length === 0) return null
  return '0x' + [...u8].map(x => x.toString(16).padStart(2, '0')).join('')
}

/**
 * Convert a MantarayNode recursively into a JSON-friendly object.
 * EVERYTHING becomes plain JS types (strings, objects, arrays).
 */
export function manifestToJson(node) {
  const obj = {
    path: bytesToAscii(node.path),
    target: bytesToHex(node.targetAddress),
    metadata: node.metadata || null,
    forks: {},
  }

  if (node.forks && node.forks.size > 0) {
    for (const [, fork] of node.forks.entries()) {
      const prefix = bytesToAscii(fork.prefix)
      obj.forks[prefix] = manifestToJson(fork.node)
    }
  }

  return obj
}

/**
 * Pretty-print a mantaray manifest in a human-readable tree view.
 */
export function printManifest(node, prefix = '') {
  const pathString = bytesToAscii(node.path)

  console.log(prefix + 'Node:')
  if (pathString) console.log(prefix + '  path: ' + pathString)

  if (node.metadata) {
    console.log(prefix + '  metadata:')
    for (const [k, v] of Object.entries(node.metadata)) {
      console.log(prefix + `    ${k}: ${v}`)
    }
  }

  const targetHex = bytesToHex(node.targetAddress)
  console.log(prefix + '  target: ' + (targetHex ?? 'null'))

  if (node.forks && node.forks.size > 0) {
    console.log(prefix + '  forks:')
    for (const [, fork] of node.forks.entries()) {
      const prefixStr = bytesToAscii(fork.prefix)
      console.log(prefix + `    ${prefixStr}/`)
      printManifest(fork.node, prefix + '      ')
    }
  }
}

/**
 * Print + return JSON version of the manifest
 */
export function printManifestJson(node) {
  const json = manifestToJson(node)
  console.log(JSON.stringify(json, null, 2))
  return json
}

export default { printManifest, printManifestJson, manifestToJson }

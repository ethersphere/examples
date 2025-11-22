// Pretty-print a mantaray manifest in a human-readable format
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

  if (node.targetAddress) {
    const hex = bytesToHex(node.targetAddress)
    console.log(prefix + '  target: ' + hex)
  }

  if (node.forks && node.forks.size > 0) {
    console.log(prefix + '  forks:')
    for (const [_, fork] of node.forks.entries()) {
      const p = bytesToAscii(fork.prefix)
      console.log(prefix + `    ${p}/`)
      printManifest(fork.node, prefix + '      ')
    }
  }
}

function bytesToAscii(u8) {
  if (!u8 || u8.length === 0) return ''
  return String.fromCharCode(...u8)
}

function bytesToHex(u8) {
  if (!u8 || u8.length === 0) return ''
  return '0x' + [...u8].map(b => b.toString(16).padStart(2, '0')).join('')
}

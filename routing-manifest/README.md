# Swarm Routing Demo (Strategy A)

This is a minimal static website intended for **Manifest-Based Routing** with **Strategy A (aliases)**.

## What it includes
- `index.html`, `about.html`, `contact.html`
- `404.html` (for `errorDocument`)
- `new-page.html` (for "redirect-like" remapping)
- `assets/` (CSS + a tiny nav helper)

## How it maps to your guide
Upload the `site/` folder with:

```ts
const { reference } = await bee.uploadFilesFromDirectory(batchId, "./site", {
  indexDocument: "index.html",
  errorDocument: "404.html"
});
```

Then, in your manifest manipulation step, add aliases like:
- `about` and `about/` → the same entry as `about.html`
- `contact` and `contact/` → the same entry as `contact.html`

This allows clean URLs without changing the file structure.

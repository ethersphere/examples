/**
 * Generates the blog site HTML files from an array of posts.
 */

import { writeFileSync, mkdirSync, rmSync } from "fs";

/**
 * Regenerates the entire site directory from the current posts array.
 *
 * @param {Array<{slug: string, title: string, body: string, date: string}>} posts
 */
export function writeSiteFiles(posts) {
  rmSync("site", { recursive: true, force: true });
  mkdirSync("site/posts", { recursive: true });

  writeFileSync("site/index.html", generateIndex(posts));
  for (const post of posts) {
    writeFileSync(`site/posts/${post.slug}.html`, generatePost(post));
  }
}

function generateIndex(posts) {
  const items = posts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(
      (p) => `
    <article style="margin:16px 0; padding:16px; border:1px solid #ddd; border-radius:4px;">
      <h2 style="margin:0 0 4px 0;"><a href="posts/${p.slug}.html">${esc(p.title)}</a></h2>
      <small style="color:#888;">${p.date}</small>
    </article>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>My Blog</title></head>
<body style="max-width:640px; margin:40px auto; font-family:sans-serif;">
  <h1>My Blog</h1>
  <p>${posts.length} post${posts.length !== 1 ? "s" : ""}</p>
  ${items || "<p><em>No posts yet.</em></p>"}
</body></html>`;
}

function generatePost(post) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${esc(post.title)}</title></head>
<body style="max-width:640px; margin:40px auto; font-family:sans-serif;">
  <p><a href="../">&larr; Back</a></p>
  <h1>${esc(post.title)}</h1>
  <small style="color:#888;">${post.date}</small>
  <div style="margin-top:16px; line-height:1.6;">${esc(post.body)}</div>
</body></html>`;
}

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

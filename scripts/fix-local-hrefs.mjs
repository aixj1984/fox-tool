// Remove tool entries pointing to local routes that don't have a corresponding
// page implementation, and normalize ".html" suffixes on local hrefs so they
// point to existing App Router pages.
import fs from "node:fs";

const FILE = "E:/01project/01vue/ai-website-cloner-template/src/components/sites/tool-browser-qq-com/shared/data.ts";
const APP_DIR = "E:/01project/01vue/ai-website-cloner-template/src/app";

// 1. List actual app routes (top-level + nested like category/img).
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function collectRoutes(dir, prefix = "") {
  const routes = new Set();
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name.startsWith("_")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      const route = prefix + "/" + name;
      routes.add(route);
      // recurse for nested routes like category/img
      const nested = collectRoutes(full, route);
      for (const r of nested) routes.add(r);
    }
  }
  return routes;
}

const routes = collectRoutes(APP_DIR);
// Debug: print a few
console.log("Found", routes.size, "routes. Sample:", [...routes].slice(0, 5).join(", "));

// 2. Local hrefs that have no matching route → remove the tool entry.
const BROKEN_HREFS = new Set(["/excel_to_pdf.html", "/imgcompress.html"]);

// 3. Hrefs that exist but use ".html" suffix → normalize by stripping ".html".
const NORMALIZE_SUFFIX = /\.html$/;

let src = fs.readFileSync(FILE, "utf8");

// First pass: normalize .html suffixes on local hrefs that have a real route.
// We do this with a simple regex on "href": "/...".html" lines.
src = src.replace(/"href":\s*"\/([^"]+?)\.html"/g, (match, path) => {
  const normalized = "/" + path;
  if (routes.has(normalized)) {
    return `"href": "${normalized}"`;
  }
  return match; // leave unchanged if no matching route (will be removed next)
});

// Second pass: remove objects whose href is in BROKEN_HREFS.
// Recursive: when we encounter an object, first recursively process its
// interior (which may contain nested objects that should be removed), then
// check if the resulting (possibly modified) object itself should be removed.
function removeObjectsByHref(text, predicate) {
  let out = "";
  let i = 0;
  let removed = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "{") {
      // Find matching brace (skipping strings)
      let depth = 0;
      let j = i;
      let inStr = false;
      let strCh = "";
      while (j < text.length) {
        const c = text[j];
        if (inStr) {
          if (c === "\\") {
            j += 2;
            continue;
          }
          if (c === strCh) inStr = false;
        } else {
          if (c === '"' || c === "'") {
            inStr = true;
            strCh = c;
          } else if (c === "{") {
            depth++;
          } else if (c === "}") {
            depth--;
            if (depth === 0) break;
          }
        }
        j++;
      }
      // j is at the closing '}' of this object.
      // The interior is between i+1 and j-1.
      const interior = text.slice(i + 1, j);
      // Recursively process interior first.
      const innerResult = removeObjectsByHref(interior, predicate);
      removed += innerResult.removed;
      const cleanedInterior = innerResult.text;

      // Now check if THIS object (with cleaned interior) should be removed.
      const objText = "{" + cleanedInterior + "}";
      const hrefMatch = objText.match(/"href":\s*"([^"]+)"/);
      if (hrefMatch && predicate(hrefMatch[1])) {
        // Drop object + trailing comma + newline
        let k = j + 1;
        while (k < text.length && (text[k] === " " || text[k] === "\t")) k++;
        if (text[k] === ",") k++;
        if (text[k] === "\r") k++;
        if (text[k] === "\n") k++;
        i = k;
        removed++;
        continue;
      }
      out += objText;
      i = j + 1;
      continue;
    }
    out += ch;
    i++;
  }
  return { text: out, removed };
}

const result = removeObjectsByHref(src, (href) => BROKEN_HREFS.has(href));
console.log("Removed", result.removed, "broken local tool entries");
fs.writeFileSync(FILE, result.text, "utf8");
console.log("File written.");

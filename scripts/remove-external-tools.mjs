// Remove tool entries whose href points to https://tool.browser.qq.com/
// Runs over both the TOOLS array and the CATEGORY_TOOLS object in data.ts.
import fs from "node:fs";

const FILE = "E:/01project/01vue/ai-website-cloner-template/src/components/sites/tool-browser-qq-com/shared/data.ts";

let src = fs.readFileSync(FILE, "utf8");

// Generic function: remove object literals that contain a tool.browser.qq.com href.
// We scan for `{` that starts an object, find its matching `}`, check if the object
// body contains `"href": "https://tool.browser.qq.com/..."`, and if so, drop the
// object plus its trailing comma + any following blank line.
function removeExternalObjects(text) {
  let out = "";
  let i = 0;
  let removed = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "{") {
      // Find matching brace
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
      // j is at the closing '}'
      const objText = text.slice(i, j + 1);
      if (/"href":\s*"https:\/\/tool\.browser\.qq\.com\//.test(objText)) {
        // Drop this object. Also consume trailing comma and whitespace/newline after it.
        let k = j + 1;
        // skip trailing whitespace on same line
        while (k < text.length && (text[k] === " " || text[k] === "\t")) k++;
        if (text[k] === ",") {
          k++;
        }
        // skip the newline after the comma (one newline)
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

const before = src;
const result = removeExternalObjects(src);
console.log("Removed", result.removed, "external tool entries");
fs.writeFileSync(FILE, result.text, "utf8");
console.log("File written.");

import fs from "node:fs";
const ts = fs.readFileSync("src/components/sites/tool-browser-qq-com/shared/data.ts", "utf8");
let depth = 0, max = 0;
let inStr = false, strCh = "";
for (let i = 0; i < ts.length; i++) {
  const c = ts[i];
  if (inStr) {
    if (c === "\\") { i++; continue; }
    if (c === strCh) inStr = false;
  } else {
    if (c === '"' || c === "'") { inStr = true; strCh = c; }
    else if (c === "{") { depth++; if (depth > max) max = depth; }
    else if (c === "}") depth--;
  }
}
console.log("Final depth:", depth, "Max depth:", max);

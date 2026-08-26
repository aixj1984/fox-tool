// Build the tool→category mapping by scraping each rendered category page.
// We already have /category/img. Need the other 9. This script is a helper
// to merge results; the actual page data is collected via browser MCP.
import fs from 'fs';
const path = 'docs/research/tool-browser-qq-com-d1ad3910/root-8a5edab2/category-mapping.json';
// Will be populated from browser extractions below.
fs.writeFileSync(path, '{}');
console.log('initialized', path);

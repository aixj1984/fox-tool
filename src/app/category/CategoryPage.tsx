import { PortalLayout } from "@/components/sites/tool-browser-qq-com/root-8a5edab2/PortalLayout";
import { CATEGORY_TOOLS } from "@/components/sites/tool-browser-qq-com/shared/data";

// Shared category page: full grid filtered to one category, no banner.
export function CategoryPage({ slug, activeHref }: { slug: string; activeHref: string }) {
  const tools = CATEGORY_TOOLS[slug] ?? [];
  return <PortalLayout activeHref={activeHref} tools={tools} />;
}

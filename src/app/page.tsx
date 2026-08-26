import { PortalLayout } from "@/components/sites/tool-browser-qq-com/root-8a5edab2/PortalLayout";
import { TOOLS } from "@/components/sites/tool-browser-qq-com/shared/data";

// Portal home: tool.browser.qq.com/ — full grid of tools.
// Banner (最新工具 panel + 更多工具 link) is hidden per request.
export default function Home() {
  return (
    <PortalLayout
      activeHref="/"
      tools={TOOLS}
    />
  );
}

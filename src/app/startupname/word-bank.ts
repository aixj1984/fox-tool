// Word banks for the English startup / project name generator
// (英文创业公司/项目名生成).

// Tech-y prefixes that evoke a product or action.
export const STARTUP_PREFIX: string[] = [
  "Pix", "Nova", "Lumen", "Quanta", "Velo", "Zen", "Aero", "Flux", "Nimbus", "Orbit",
  "Pixel", "Cloud", "Data", "Bit", "Byte", "Cyber", "Hyper", "Meta", "Neuro", "Omni",
  "Solar", "Lunar", "Stellar", "Echo", "Pulse", "Spark", "Forge", "Vault", "Hive", "Mesh",
  "Quantum", "Crisp", "Swift", "Bright", "Clear", "Deep", "Peak", "Prime", "Rapid", "Smart",
];

// Common startup-style suffixes (joined directly or with a space/hyphen depending on style).
export const STARTUP_SUFFIX: string[] = [
  "ify", "ly", "hub", "lab", "labs", "base", "kit", "box", "flow", "stack",
  "io", "AI", "bot", "sync", "loop", "grid", "wave", "sphere", "verse", "scape",
  "works", "ware", "desk", "pad", "pod", "port", "deck", "dock", "nest", "den",
];

// Full second words used for two-word "Word + Word" names.
export const STARTUP_SECOND: string[] = [
  "Health", "Pay", "Cart", "Book", "Desk", "Board", "Mind", "Care", "Learn", "Play",
  "Forge", "Studio", "Systems", "Networks", "Solutions", "Technologies", "Dynamics",
  "Robotics", "Analytics", "Insights", "Capital", "Ventures", "Collective", "Alliance",
];

// Industry-themed keyword pools (English) used to seed keyword-based names.
export const STARTUP_INDUSTRY: Record<string, string[]> = {
  科技: ["Tech", "Code", "Dev", "Byte", "Cyber", "Data", "Cloud", "Net"],
  金融: ["Pay", "Fin", "Bank", "Coin", "Fund", "Cash", "Ledger", "Vault"],
  医疗: ["Med", "Health", "Care", "Cure", "Bio", "Gene", "Vital", "Clinic"],
  教育: ["Edu", "Learn", "Study", "Teach", "Book", "Class", "Mind", "Academy"],
  电商: ["Shop", "Cart", "Buy", "Mall", "Store", "Trade", "Mart", "Bazaar"],
  社交: ["Social", "Connect", "Link", "Chat", "Meet", "Circle", "Bond", "Friend"],
  游戏: ["Game", "Play", "Fun", "Arcade", "Pixel", "Quest", "Arena", "Loot"],
};

// Style options the UI exposes; each maps to a generator strategy.
export type StartupStyle = "compact" | "twoword" | "suffix" | "keyword";

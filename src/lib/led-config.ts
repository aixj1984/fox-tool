export type LedDirection = "left" | "right";

export interface LedConfig {
  text: string;
  color: string;
  bg: string;
  fontSize: number;
  speed: number;
  direction: LedDirection;
}

export const DEFAULT_LED_CONFIG: LedConfig = {
  text: "FoxHelper",
  color: "#FF2D2D",
  bg: "#000000",
  fontSize: 120,
  speed: 8,
  direction: "left",
};

// Base64url of UTF-8 text, safe in a URL query param.
function encodeText(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeText(s: string): string {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = norm.length % 4 ? "=".repeat(4 - (norm.length % 4)) : "";
  const bin = atob(norm + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeLedConfig(c: LedConfig): string {
  const params = new URLSearchParams();
  params.set("t", encodeText(c.text));
  params.set("c", c.color.replace("#", ""));
  params.set("b", c.bg.replace("#", ""));
  params.set("s", String(c.fontSize));
  params.set("v", String(c.speed));
  params.set("d", c.direction);
  return params.toString();
}

export function decodeLedConfig(search: string): LedConfig {
  const params = new URLSearchParams(search);
  const text = params.get("t");
  const color = params.get("c");
  const bg = params.get("b");
  const size = params.get("s");
  const speed = params.get("v");
  const dir = params.get("d");

  return {
    text: text ? decodeText(text) : DEFAULT_LED_CONFIG.text,
    color: color ? `#${color}` : DEFAULT_LED_CONFIG.color,
    bg: bg ? `#${bg}` : DEFAULT_LED_CONFIG.bg,
    fontSize: size ? Math.max(20, Math.min(400, parseInt(size, 10))) : DEFAULT_LED_CONFIG.fontSize,
    speed: speed ? Math.max(1, Math.min(60, parseInt(speed, 10))) : DEFAULT_LED_CONFIG.speed,
    direction: dir === "right" ? "right" : "left",
  };
}

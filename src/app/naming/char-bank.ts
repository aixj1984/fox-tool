// Character banks for the Chinese naming tool (取名字).
// Each character carries a meaning gloss and is tagged with styles + gender fit.

export type NamingStyle = "elegant" | "grand" | "lively" | "classic";
export type NamingGender = "male" | "female" | "neutral";

export interface NameChar {
  ch: string;
  meaning: string;
  styles: NamingStyle[];
  gender: NamingGender[];
}

// A curated bank. Characters may appear under multiple styles/genders.
export const NAME_CHAR_BANK: NameChar[] = [
  // 儒雅 (elegant) — refined, literary, gentle.
  { ch: "书", meaning: "读书、学问", styles: ["elegant", "classic"], gender: ["neutral"] },
  { ch: "墨", meaning: "文墨、才情", styles: ["elegant", "classic"], gender: ["neutral"] },
  { ch: "清", meaning: "清雅、纯洁", styles: ["elegant", "classic"], gender: ["neutral"] },
  { ch: "雅", meaning: "高雅、文雅", styles: ["elegant"], gender: ["female", "neutral"] },
  { ch: "文", meaning: "文采、文化", styles: ["elegant", "classic"], gender: ["neutral"] },
  { ch: "言", meaning: "言辞、谈吐", styles: ["elegant"], gender: ["neutral"] },
  { ch: "若", meaning: "如、若，柔美", styles: ["elegant"], gender: ["female"] },
  { ch: "之", meaning: "助词，文气", styles: ["elegant", "classic"], gender: ["neutral"] },
  { ch: "予", meaning: "给予、赠予", styles: ["elegant"], gender: ["neutral"] },
  { ch: "然", meaning: "如此、自然", styles: ["elegant", "lively"], gender: ["neutral"] },
  { ch: "知", meaning: "知书达理", styles: ["elegant", "classic"], gender: ["neutral"] },
  { ch: "安", meaning: "安宁、平安", styles: ["elegant", "classic"], gender: ["neutral"] },
  { ch: "宁", meaning: "宁静、安详", styles: ["elegant"], gender: ["neutral"] },
  { ch: "舒", meaning: "舒展、从容", styles: ["elegant"], gender: ["female"] },
  { ch: "怀", meaning: "胸怀、怀抱", styles: ["elegant", "grand"], gender: ["neutral"] },
  { ch: "慎", meaning: "谨慎、审慎", styles: ["elegant", "classic"], gender: ["male"] },
  { ch: "谦", meaning: "谦虚、谦逊", styles: ["elegant", "classic"], gender: ["male"] },
  { ch: "慕", meaning: "仰慕、爱慕", styles: ["elegant"], gender: ["female"] },
  { ch: "念", meaning: "思念、念想", styles: ["elegant"], gender: ["neutral"] },
  { ch: "语", meaning: "言语、话语", styles: ["elegant", "lively"], gender: ["female"] },

  // 大气 (grand) — imposing, expansive, masculine-leaning but not only.
  { ch: "宇", meaning: "宇宙、天地", styles: ["grand"], gender: ["male", "neutral"] },
  { ch: "宸", meaning: "帝王居所、宏大", styles: ["grand"], gender: ["male"] },
  { ch: "浩", meaning: "浩瀚、广大", styles: ["grand"], gender: ["male"] },
  { ch: "瀚", meaning: "广大、浩瀚", styles: ["grand"], gender: ["male"] },
  { ch: "霆", meaning: "雷霆、威势", styles: ["grand"], gender: ["male"] },
  { ch: "峰", meaning: "山峰、顶峰", styles: ["grand"], gender: ["male"] },
  { ch: "峥", meaning: "峥嵘、不凡", styles: ["grand"], gender: ["male"] },
  { ch: "霖", meaning: "甘霖、恩泽", styles: ["grand", "elegant"], gender: ["neutral"] },
  { ch: "鸿", meaning: "鸿鹄、远大", styles: ["grand"], gender: ["male"] },
  { ch: "鹏", meaning: "大鹏、远志", styles: ["grand"], gender: ["male"] },
  { ch: "旭", meaning: "旭日、朝气", styles: ["grand", "lively"], gender: ["male"] },
  { ch: "辰", meaning: "星辰、时辰", styles: ["grand", "classic"], gender: ["neutral"] },
  { ch: "晟", meaning: "光明、兴盛", styles: ["grand"], gender: ["male"] },
  { ch: "璟", meaning: "玉的光彩", styles: ["grand", "elegant"], gender: ["neutral"] },
  { ch: "渊", meaning: "深渊、渊博", styles: ["grand"], gender: ["male"] },
  { ch: "川", meaning: "山川、奔流", styles: ["grand"], gender: ["male"] },
  { ch: "钧", meaning: "千钧、稳重", styles: ["grand"], gender: ["male"] },
  { ch: "铭", meaning: "铭刻、铭记", styles: ["grand", "classic"], gender: ["neutral"] },
  { ch: "睿", meaning: "睿智、明达", styles: ["grand", "elegant"], gender: ["neutral"] },
  { ch: "泰", meaning: "泰山、安宁", styles: ["grand", "classic"], gender: ["male"] },

  // 灵动 (lively) — lively, fresh, bright.
  { ch: "灵", meaning: "灵动、聪慧", styles: ["lively"], gender: ["female"] },
  { ch: "悦", meaning: "愉悦、喜悦", styles: ["lively"], gender: ["female"] },
  { ch: "晴", meaning: "晴朗、明亮", styles: ["lively"], gender: ["female"] },
  { ch: "冉", meaning: "冉冉、缓缓", styles: ["lively", "elegant"], gender: ["female"] },
  { ch: "熙", meaning: "熙和、繁盛", styles: ["lively", "grand"], gender: ["neutral"] },
  { ch: "灿", meaning: "灿烂、光彩", styles: ["lively"], gender: ["neutral"] },
  { ch: "瑶", meaning: "美玉、瑶池", styles: ["lively", "elegant"], gender: ["female"] },
  { ch: "桐", meaning: "梧桐、清雅", styles: ["lively", "elegant"], gender: ["neutral"] },
  { ch: "夏", meaning: "夏天、活泼", styles: ["lively"], gender: ["female"] },
  { ch: "晴", meaning: "晴朗、明快", styles: ["lively"], gender: ["female"] },
  { ch: "伊", meaning: "伊人、柔美", styles: ["lively", "elegant"], gender: ["female"] },
  { ch: "洛", meaning: "洛水、灵动", styles: ["lively", "elegant"], gender: ["female"] },
  { ch: "泠", meaning: "清凉、清脆", styles: ["lively", "elegant"], gender: ["female"] },
  { ch: "栩", meaning: "栩栩、生动", styles: ["lively"], gender: ["neutral"] },
  { ch: "灿", meaning: "光彩耀眼", styles: ["lively"], gender: ["neutral"] },
  { ch: "悠", meaning: "悠然、从容", styles: ["lively", "elegant"], gender: ["neutral"] },
  { ch: "晨", meaning: "清晨、朝气", styles: ["lively"], gender: ["neutral"] },
  { ch: "沐", meaning: "沐浴、温润", styles: ["lively", "elegant"], gender: ["neutral"] },
  { ch: "兮", meaning: "语气词、灵动", styles: ["lively", "elegant"], gender: ["female"] },
  { ch: "禾", meaning: "禾苗、生机", styles: ["lively"], gender: ["neutral"] },

  // 经典 (classic) — timeless, traditional, often from poetry.
  { ch: "玉", meaning: "美玉、品德", styles: ["classic"], gender: ["female", "neutral"] },
  { ch: "兰", meaning: "兰花、高洁", styles: ["classic", "elegant"], gender: ["female"] },
  { ch: "梅", meaning: "梅花、坚韧", styles: ["classic"], gender: ["female"] },
  { ch: "松", meaning: "松树、坚毅", styles: ["classic"], gender: ["male"] },
  { ch: "竹", meaning: "竹子、正直", styles: ["classic"], gender: ["neutral"] },
  { ch: "菊", meaning: "菊花、隐逸", styles: ["classic"], gender: ["female"] },
  { ch: "德", meaning: "品德、道德", styles: ["classic"], gender: ["male"] },
  { ch: "仁", meaning: "仁爱、宽厚", styles: ["classic"], gender: ["male"] },
  { ch: "义", meaning: "正义、道义", styles: ["classic"], gender: ["male"] },
  { ch: "礼", meaning: "礼节、礼仪", styles: ["classic"], gender: ["neutral"] },
  { ch: "智", meaning: "智慧、明智", styles: ["classic"], gender: ["neutral"] },
  { ch: "信", meaning: "诚信、信念", styles: ["classic"], gender: ["neutral"] },
  { ch: "忠", meaning: "忠诚、忠厚", styles: ["classic"], gender: ["male"] },
  { ch: "孝", meaning: "孝道、孝顺", styles: ["classic"], gender: ["neutral"] },
  { ch: "和", meaning: "和睦、温和", styles: ["classic"], gender: ["neutral"] },
  { ch: "平", meaning: "平安、平和", styles: ["classic"], gender: ["neutral"] },
  { ch: "正", meaning: "正直、端正", styles: ["classic"], gender: ["male"] },
  { ch: "明", meaning: "光明、明理", styles: ["classic", "grand"], gender: ["neutral"] },
  { ch: "远", meaning: "深远、远大", styles: ["classic", "grand"], gender: ["male"] },
  { ch: "伯", meaning: "伯仲、长幼", styles: ["classic"], gender: ["male"] },
];

// Common Chinese surnames offered as quick picks.
export const COMMON_SURNAMES: string[] = [
  "赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈",
  "褚", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "尤", "许",
  "何", "吕", "施", "张", "孔", "曹", "严", "华", "金", "魏",
  "陶", "姜", "戚", "谢", "邹", "喻", "柏", "水", "窦", "章",
  "云", "苏", "潘", "葛", "奚", "范", "彭", "郎", "鲁", "韦",
];

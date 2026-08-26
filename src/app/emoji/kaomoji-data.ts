// Categorized kaomoji / 颜文字 collection (60+ entries).
export type Kaomoji = { text: string; label?: string };

export type KaomojiCategory = {
  name: string;
  items: Kaomoji[];
};

export const kaomojiCategories: KaomojiCategory[] = [
  {
    name: "开心",
    items: [
      { text: "(*^▽^*)" },
      { text: "(≧∇≦)" },
      { text: "(✿◡‿◡)" },
      { text: "(◕ᴗ◕✿)" },
      { text: "(〃▽〃)" },
      { text: "(^▽^)" },
      { text: "(◕‿◕✿)" },
      { text: "ヽ(✿ﾟ▽ﾟ)ノ" },
      { text: "(★^O^★)" },
      { text: "(*￣∇￣)" },
      { text: "(❁´◡`❁)" },
      { text: "(✯◡✯)" },
    ],
  },
  {
    name: "难过",
    items: [
      { text: "(；´д`)" },
      { text: "ಥ_ಥ" },
      { text: "(T_T)" },
      { text: "(╥_╥)" },
      { text: "(；_；)" },
      { text: "(´；д；`)" },
      { text: "(つ﹏⊂)" },
      { text: "(ಥ﹏ಥ)" },
      { text: "(っ˘̩╭╮˘̩)っ" },
      { text: "(⋟﹏⋞)" },
      { text: "(ノ_<。)" },
      { text: "٩(๑`^´๑)۶" },
    ],
  },
  {
    name: "生气",
    items: [
      { text: "(╬ Ò﹏Ó)" },
      { text: "(╯°□°)╯︵ ┻━┻" },
      { text: "(╯‵□′)╯︵┻━┻" },
      { text: "ヽ(`Д´)ﾉ" },
      { text: "(☄ฺ◣д◢)☄ฺ" },
      { text: "(个数_个数)" },
      { text: "(凸ಠ益ಠ)凸" },
      { text: "(▼へ▼メ)" },
      { text: "(╬￣皿￣)" },
      { text: "(怒｀Д´怒)" },
    ],
  },
  {
    name: "卖萌",
    items: [
      { text: "(づ￣ 3￣)づ" },
      { text: "(づ￣▽￣)づ" },
      { text: "٩(๑>◡<๑)۶" },
      { text: "(｡･ω･｡)ﾉ♡" },
      { text: "ヽ(○´∀`)ﾉ♪" },
      { text: "(*´꒳`*)" },
      { text: "٩(๑•̀ω•́๑)۶" },
      { text: "(๑•̀ㅂ•́)و✧" },
      { text: "(*╹▽╹*)" },
      { text: "(❁´3`❁)" },
      { text: "(=^･ω･^=)" },
      { text: "(￣ω￣)" },
    ],
  },
  {
    name: "颜文字",
    items: [
      { text: "( ͡° ͜ʖ ͡°)" },
      { text: "¯\\_(ツ)_/¯" },
      { text: "(•̀ᴗ•́)و ̑̑" },
      { text: "( ﾟ∀ﾟ)" },
      { text: "( ・_・)" },
      { text: "(´・ω・`)" },
      { text: "(/・ω・)/" },
      { text: "Σ(ﾟдﾟ;)" },
      { text: "(°ー°〃)" },
      { text: "(；一_一)" },
      { text: "(=´∀`=)" },
      { text: "(`・ω・´)" },
    ],
  },
  {
    name: "惊讶",
    items: [
      { text: "(⊙o⊙)" },
      { text: "Σ(°ロ°)" },
      { text: "（☉_☉）" },
      { text: "(°ㅂ°╬)" },
      { text: "∑(O_O；)" },
      { text: "(⊙﹏⊙)" },
      { text: "(O_O;)" },
      { text: "(°△°|||)" },
    ],
  },
  {
    name: "无奈",
    items: [
      { text: "╮(╯_╰)╭" },
      { text: "( ¯▽¯；)" },
      { text: "( ˘･з･)" },
      { text: "(︶.︶)" },
      { text: "(￣ヘ￣)" },
      { text: "(-_-) zzz" },
    ],
  },
  {
    name: "爱心",
    items: [
      { text: "(♡˙︶˙♡)" },
      { text: "(❤´艸`❤)" },
      { text: "♡(˃̵ᴗ˂̵̵)" },
      { text: "(๑♡⌓♡๑)" },
      { text: "(´,,•ω•,,)♡" },
      { text: "♡(╹◡╹)ﾉ♡" },
    ],
  },
  {
    name: "动物",
    items: [
      { text: "=^･ω･^=" },
      { text: "ฅ( ̳• ◡ • ̳)ฅ" },
      { text: "ʕ•ᴥ•ʔ" },
      { text: "(=^･ｪ･^=)" },
      { text: "ฅ^•ﻌ•^ฅ" },
      { text: "ʕᴥ•ʔ" },
    ],
  },
];

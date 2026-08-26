// 证件照尺寸数据，提取自 https://tool.browser.qq.com/id_photo.html
// 宽*高单位为 mm。像素按 300 DPI 换算（mm / 25.4 * 300）。

export type PhotoSize = {
  name: string;
  wMm: number;
  hMm: number;
  // 建议背景色
  bg?: string;
};

export type PhotoSizeTab = {
  key: string;
  label: string;
  sizes: PhotoSize[];
};

// 300 DPI 下 mm → px
export const mmToPx = (mm: number, dpi = 300) => Math.round((mm / 25.4) * dpi);

export const PHOTO_SIZE_TABS: PhotoSizeTab[] = [
  {
    key: "common",
    label: "常用尺寸",
    sizes: [
      { name: "一寸", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "二寸", wMm: 35, hMm: 49, bg: "#FFFFFF" },
      { name: "简历照(二寸)", wMm: 35, hMm: 49, bg: "#FFFFFF" },
      { name: "简历照(一寸)", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "大一寸", wMm: 33, hMm: 48, bg: "#FFFFFF" },
      { name: "小一寸", wMm: 22, hMm: 32, bg: "#FFFFFF" },
      { name: "小二寸", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "大二寸", wMm: 35, hMm: 53, bg: "#FFFFFF" },
      { name: "社保卡", wMm: 26, hMm: 32, bg: "#FFFFFF" },
      { name: "居住证", wMm: 26, hMm: 32, bg: "#FFFFFF" },
      { name: "身份证", wMm: 26, hMm: 32, bg: "#FFFFFF" },
    ],
  },
  {
    key: "civil",
    label: "公务员",
    sizes: [
      { name: "北京公务员", wMm: 34, hMm: 51, bg: "#FFFFFF" },
      { name: "广东公务员", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "重庆公务员", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "湖南公务员", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "湖北公务员", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "江苏公务员", wMm: 34, hMm: 45, bg: "#FFFFFF" },
      { name: "甘肃公务员", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "陕西公务员", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "海南公务员", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "广西公务员", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "山东公务员", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "安徽公务员", wMm: 34, hMm: 45, bg: "#FFFFFF" },
      { name: "江西公务员", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "天津公务员", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "内蒙古公务员", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "辽宁公务员", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "福建公务员", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "河南公务员", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "吉林公务员", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "黑龙江公务员", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "宁夏公务员", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "贵州公务员", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "云南公务员", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "四川公务员", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "新疆公务员", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "西藏公务员", wMm: 25, hMm: 35, bg: "#FFFFFF" },
    ],
  },
  {
    key: "visa",
    label: "签证",
    sizes: [
      { name: "新加坡签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "美国签证", wMm: 51, hMm: 51, bg: "#FFFFFF" },
      { name: "韩国签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "马来西亚签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "泰国签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "加拿大签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "澳大利亚签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "新西兰签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "芬兰签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "冰岛签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "比利时签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "捷克签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "奥地利签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "法国签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "土库曼斯坦", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "叙利亚签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "阿富汗签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "吉尔吉斯斯坦签", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "巴基斯坦签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "蒙古签证", wMm: 33, hMm: 48, bg: "#FFFFFF" },
      { name: "哈萨克斯坦签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "孟加拉签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "肯尼亚签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "伊朗签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "迪拜签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "文莱签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "尼泊尔签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "老挝签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "柬埔寨签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "缅甸签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "菲律宾签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "俄罗斯签证", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "印度签证", wMm: 50, hMm: 50, bg: "#FFFFFF" },
    ],
  },
  {
    key: "other",
    label: "其他",
    sizes: [
      { name: "司法考试报名", wMm: 35, hMm: 53, bg: "#FFFFFF" },
      { name: "深圳行政执法证", wMm: 40, hMm: 53, bg: "#FFFFFF" },
      { name: "广东行政执法证", wMm: 40, hMm: 53, bg: "#FFFFFF" },
      { name: "保险从业资格证", wMm: 18, hMm: 31, bg: "#FFFFFF" },
      { name: "证券从业资格证", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "护士资格考试", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "公务员考试", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "注册会计师报名", wMm: 30, hMm: 37, bg: "#FFFFFF" },
      { name: "二级建造师", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "会计职称考试", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "计算机等级考试", wMm: 33, hMm: 48, bg: "#FFFFFF" },
      { name: "一级建造师", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "普通话水平测试", wMm: 33, hMm: 48, bg: "#FFFFFF" },
      { name: "导游证", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "教师资格证", wMm: 30, hMm: 40, bg: "#FFFFFF" },
      { name: "英语四六级考试", wMm: 33, hMm: 48, bg: "#FFFFFF" },
      { name: "研究生考试", wMm: 36, hMm: 48, bg: "#FFFFFF" },
      { name: "国考报名", wMm: 35, hMm: 45, bg: "#FFFFFF" },
      { name: "驾驶证", wMm: 22, hMm: 32, bg: "#FFFFFF" },
      { name: "健康证", wMm: 25, hMm: 35, bg: "#FFFFFF" },
      { name: "社保卡", wMm: 26, hMm: 32, bg: "#FFFFFF" },
    ],
  },
];

export const BG_COLORS = [
  { name: "白色", value: "#FFFFFF" },
  { name: "蓝色", value: "#438EDB" },
  { name: "浅蓝", value: "#B4D4FF" },
  { name: "红色", value: "#D9001B" },
  { name: "渐变蓝", value: "linear-gradient(180deg, #B4D4FF 0%, #438EDB 100%)" },
];

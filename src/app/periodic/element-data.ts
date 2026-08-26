// Periodic table of the elements — all 118 elements with layout positions.
// `col`/`row` are 1-indexed positions in the classic 18-column table.
// Lanthanides (57-71) and actinides (89-103) are shown in the f-block rows below.

export type ElementCategory =
  | "alkali-metal" // 碱金属
  | "alkaline-earth-metal" // 碱土金属
  | "transition-metal" // 过渡金属
  | "post-transition-metal" // 主族金属
  | "metalloid" // 类金属
  | "nonmetal" // 非金属
  | "halogen" // 卤素
  | "noble-gas" // 稀有气体
  | "lanthanide" // 镧系
  | "actinide"; // 锕系

export interface Element {
  number: number;
  symbol: string;
  name: string; // 中文
  nameEn: string; // 英文
  mass: string; // 原子量（标准相对原子质量，或最稳定同位素）
  category: ElementCategory;
  electronConfig: string; // 电子排布
  row: number;
  col: number;
}

export const CATEGORY_LABEL: Record<ElementCategory, string> = {
  "alkali-metal": "碱金属",
  "alkaline-earth-metal": "碱土金属",
  "transition-metal": "过渡金属",
  "post-transition-metal": "主族金属",
  metalloid: "类金属",
  nonmetal: "非金属",
  halogen: "卤素",
  "noble-gas": "稀有气体",
  lanthanide: "镧系",
  actinide: "锕系",
};

export const CATEGORY_COLOR: Record<ElementCategory, string> = {
  "alkali-metal": "#FF8C66",
  "alkaline-earth-metal": "#FFD580",
  "transition-metal": "#FFDFC0",
  "post-transition-metal": "#C4E6C3",
  metalloid: "#B3E5D6",
  nonmetal: "#BFE3F2",
  halogen: "#C9D7F2",
  "noble-gas": "#D8C9F2",
  lanthanide: "#F2C9DE",
  actinide: "#F2D6C9",
};

export const ELEMENTS: Element[] = [
  { number: 1, symbol: "H", name: "氢", nameEn: "Hydrogen", mass: "1.008", category: "nonmetal", electronConfig: "1s1", row: 1, col: 1 },
  { number: 2, symbol: "He", name: "氦", nameEn: "Helium", mass: "4.0026", category: "noble-gas", electronConfig: "1s2", row: 1, col: 18 },
  { number: 3, symbol: "Li", name: "锂", nameEn: "Lithium", mass: "6.94", category: "alkali-metal", electronConfig: "[He] 2s1", row: 2, col: 1 },
  { number: 4, symbol: "Be", name: "铍", nameEn: "Beryllium", mass: "9.0122", category: "alkaline-earth-metal", electronConfig: "[He] 2s2", row: 2, col: 2 },
  { number: 5, symbol: "B", name: "硼", nameEn: "Boron", mass: "10.81", category: "metalloid", electronConfig: "[He] 2s2 2p1", row: 2, col: 13 },
  { number: 6, symbol: "C", name: "碳", nameEn: "Carbon", mass: "12.011", category: "nonmetal", electronConfig: "[He] 2s2 2p2", row: 2, col: 14 },
  { number: 7, symbol: "N", name: "氮", nameEn: "Nitrogen", mass: "14.007", category: "nonmetal", electronConfig: "[He] 2s2 2p3", row: 2, col: 15 },
  { number: 8, symbol: "O", name: "氧", nameEn: "Oxygen", mass: "15.999", category: "nonmetal", electronConfig: "[He] 2s2 2p4", row: 2, col: 16 },
  { number: 9, symbol: "F", name: "氟", nameEn: "Fluorine", mass: "18.998", category: "halogen", electronConfig: "[He] 2s2 2p5", row: 2, col: 17 },
  { number: 10, symbol: "Ne", name: "氖", nameEn: "Neon", mass: "20.180", category: "noble-gas", electronConfig: "[He] 2s2 2p6", row: 2, col: 18 },
  { number: 11, symbol: "Na", name: "钠", nameEn: "Sodium", mass: "22.990", category: "alkali-metal", electronConfig: "[Ne] 3s1", row: 3, col: 1 },
  { number: 12, symbol: "Mg", name: "镁", nameEn: "Magnesium", mass: "24.305", category: "alkaline-earth-metal", electronConfig: "[Ne] 3s2", row: 3, col: 2 },
  { number: 13, symbol: "Al", name: "铝", nameEn: "Aluminium", mass: "26.982", category: "post-transition-metal", electronConfig: "[Ne] 3s2 3p1", row: 3, col: 13 },
  { number: 14, symbol: "Si", name: "硅", nameEn: "Silicon", mass: "28.085", category: "metalloid", electronConfig: "[Ne] 3s2 3p2", row: 3, col: 14 },
  { number: 15, symbol: "P", name: "磷", nameEn: "Phosphorus", mass: "30.974", category: "nonmetal", electronConfig: "[Ne] 3s2 3p3", row: 3, col: 15 },
  { number: 16, symbol: "S", name: "硫", nameEn: "Sulfur", mass: "32.06", category: "nonmetal", electronConfig: "[Ne] 3s2 3p4", row: 3, col: 16 },
  { number: 17, symbol: "Cl", name: "氯", nameEn: "Chlorine", mass: "35.45", category: "halogen", electronConfig: "[Ne] 3s2 3p5", row: 3, col: 17 },
  { number: 18, symbol: "Ar", name: "氩", nameEn: "Argon", mass: "39.948", category: "noble-gas", electronConfig: "[Ne] 3s2 3p6", row: 3, col: 18 },
  { number: 19, symbol: "K", name: "钾", nameEn: "Potassium", mass: "39.098", category: "alkali-metal", electronConfig: "[Ar] 4s1", row: 4, col: 1 },
  { number: 20, symbol: "Ca", name: "钙", nameEn: "Calcium", mass: "40.078", category: "alkaline-earth-metal", electronConfig: "[Ar] 4s2", row: 4, col: 2 },
  { number: 21, symbol: "Sc", name: "钪", nameEn: "Scandium", mass: "44.956", category: "transition-metal", electronConfig: "[Ar] 3d1 4s2", row: 4, col: 3 },
  { number: 22, symbol: "Ti", name: "钛", nameEn: "Titanium", mass: "47.867", category: "transition-metal", electronConfig: "[Ar] 3d2 4s2", row: 4, col: 4 },
  { number: 23, symbol: "V", name: "钒", nameEn: "Vanadium", mass: "50.942", category: "transition-metal", electronConfig: "[Ar] 3d3 4s2", row: 4, col: 5 },
  { number: 24, symbol: "Cr", name: "铬", nameEn: "Chromium", mass: "51.996", category: "transition-metal", electronConfig: "[Ar] 3d5 4s1", row: 4, col: 6 },
  { number: 25, symbol: "Mn", name: "锰", nameEn: "Manganese", mass: "54.938", category: "transition-metal", electronConfig: "[Ar] 3d5 4s2", row: 4, col: 7 },
  { number: 26, symbol: "Fe", name: "铁", nameEn: "Iron", mass: "55.845", category: "transition-metal", electronConfig: "[Ar] 3d6 4s2", row: 4, col: 8 },
  { number: 27, symbol: "Co", name: "钴", nameEn: "Cobalt", mass: "58.933", category: "transition-metal", electronConfig: "[Ar] 3d7 4s2", row: 4, col: 9 },
  { number: 28, symbol: "Ni", name: "镍", nameEn: "Nickel", mass: "58.693", category: "transition-metal", electronConfig: "[Ar] 3d8 4s2", row: 4, col: 10 },
  { number: 29, symbol: "Cu", name: "铜", nameEn: "Copper", mass: "63.546", category: "transition-metal", electronConfig: "[Ar] 3d10 4s1", row: 4, col: 11 },
  { number: 30, symbol: "Zn", name: "锌", nameEn: "Zinc", mass: "65.38", category: "transition-metal", electronConfig: "[Ar] 3d10 4s2", row: 4, col: 12 },
  { number: 31, symbol: "Ga", name: "镓", nameEn: "Gallium", mass: "69.723", category: "post-transition-metal", electronConfig: "[Ar] 3d10 4s2 4p1", row: 4, col: 13 },
  { number: 32, symbol: "Ge", name: "锗", nameEn: "Germanium", mass: "72.630", category: "metalloid", electronConfig: "[Ar] 3d10 4s2 4p2", row: 4, col: 14 },
  { number: 33, symbol: "As", name: "砷", nameEn: "Arsenic", mass: "74.922", category: "metalloid", electronConfig: "[Ar] 3d10 4s2 4p3", row: 4, col: 15 },
  { number: 34, symbol: "Se", name: "硒", nameEn: "Selenium", mass: "78.971", category: "nonmetal", electronConfig: "[Ar] 3d10 4s2 4p4", row: 4, col: 16 },
  { number: 35, symbol: "Br", name: "溴", nameEn: "Bromine", mass: "79.904", category: "halogen", electronConfig: "[Ar] 3d10 4s2 4p5", row: 4, col: 17 },
  { number: 36, symbol: "Kr", name: "氪", nameEn: "Krypton", mass: "83.798", category: "noble-gas", electronConfig: "[Ar] 3d10 4s2 4p6", row: 4, col: 18 },
  { number: 37, symbol: "Rb", name: "铷", nameEn: "Rubidium", mass: "85.468", category: "alkali-metal", electronConfig: "[Kr] 5s1", row: 5, col: 1 },
  { number: 38, symbol: "Sr", name: "锶", nameEn: "Strontium", mass: "87.62", category: "alkaline-earth-metal", electronConfig: "[Kr] 5s2", row: 5, col: 2 },
  { number: 39, symbol: "Y", name: "钇", nameEn: "Yttrium", mass: "88.906", category: "transition-metal", electronConfig: "[Kr] 4d1 5s2", row: 5, col: 3 },
  { number: 40, symbol: "Zr", name: "锆", nameEn: "Zirconium", mass: "91.224", category: "transition-metal", electronConfig: "[Kr] 4d2 5s2", row: 5, col: 4 },
  { number: 41, symbol: "Nb", name: "铌", nameEn: "Niobium", mass: "92.906", category: "transition-metal", electronConfig: "[Kr] 4d4 5s1", row: 5, col: 5 },
  { number: 42, symbol: "Mo", name: "钼", nameEn: "Molybdenum", mass: "95.95", category: "transition-metal", electronConfig: "[Kr] 4d5 5s1", row: 5, col: 6 },
  { number: 43, symbol: "Tc", name: "锝", nameEn: "Technetium", mass: "[98]", category: "transition-metal", electronConfig: "[Kr] 4d5 5s2", row: 5, col: 7 },
  { number: 44, symbol: "Ru", name: "钌", nameEn: "Ruthenium", mass: "101.07", category: "transition-metal", electronConfig: "[Kr] 4d7 5s1", row: 5, col: 8 },
  { number: 45, symbol: "Rh", name: "铑", nameEn: "Rhodium", mass: "102.91", category: "transition-metal", electronConfig: "[Kr] 4d8 5s1", row: 5, col: 9 },
  { number: 46, symbol: "Pd", name: "钯", nameEn: "Palladium", mass: "106.42", category: "transition-metal", electronConfig: "[Kr] 4d10", row: 5, col: 10 },
  { number: 47, symbol: "Ag", name: "银", nameEn: "Silver", mass: "107.87", category: "transition-metal", electronConfig: "[Kr] 4d10 5s1", row: 5, col: 11 },
  { number: 48, symbol: "Cd", name: "镉", nameEn: "Cadmium", mass: "112.41", category: "transition-metal", electronConfig: "[Kr] 4d10 5s2", row: 5, col: 12 },
  { number: 49, symbol: "In", name: "铟", nameEn: "Indium", mass: "114.82", category: "post-transition-metal", electronConfig: "[Kr] 4d10 5s2 5p1", row: 5, col: 13 },
  { number: 50, symbol: "Sn", name: "锡", nameEn: "Tin", mass: "118.71", category: "post-transition-metal", electronConfig: "[Kr] 4d10 5s2 5p2", row: 5, col: 14 },
  { number: 51, symbol: "Sb", name: "锑", nameEn: "Antimony", mass: "121.76", category: "metalloid", electronConfig: "[Kr] 4d10 5s2 5p3", row: 5, col: 15 },
  { number: 52, symbol: "Te", name: "碲", nameEn: "Tellurium", mass: "127.60", category: "metalloid", electronConfig: "[Kr] 4d10 5s2 5p4", row: 5, col: 16 },
  { number: 53, symbol: "I", name: "碘", nameEn: "Iodine", mass: "126.90", category: "halogen", electronConfig: "[Kr] 4d10 5s2 5p5", row: 5, col: 17 },
  { number: 54, symbol: "Xe", name: "氙", nameEn: "Xenon", mass: "131.29", category: "noble-gas", electronConfig: "[Kr] 4d10 5s2 5p6", row: 5, col: 18 },
  { number: 55, symbol: "Cs", name: "铯", nameEn: "Caesium", mass: "132.91", category: "alkali-metal", electronConfig: "[Xe] 6s1", row: 6, col: 1 },
  { number: 56, symbol: "Ba", name: "钡", nameEn: "Barium", mass: "137.33", category: "alkaline-earth-metal", electronConfig: "[Xe] 6s2", row: 6, col: 2 },
  { number: 57, symbol: "La", name: "镧", nameEn: "Lanthanum", mass: "138.91", category: "lanthanide", electronConfig: "[Xe] 5d1 6s2", row: 9, col: 3 },
  { number: 58, symbol: "Ce", name: "铈", nameEn: "Cerium", mass: "140.12", category: "lanthanide", electronConfig: "[Xe] 4f1 5d1 6s2", row: 9, col: 4 },
  { number: 59, symbol: "Pr", name: "镨", nameEn: "Praseodymium", mass: "140.91", category: "lanthanide", electronConfig: "[Xe] 4f3 6s2", row: 9, col: 5 },
  { number: 60, symbol: "Nd", name: "钕", nameEn: "Neodymium", mass: "144.24", category: "lanthanide", electronConfig: "[Xe] 4f4 6s2", row: 9, col: 6 },
  { number: 61, symbol: "Pm", name: "钷", nameEn: "Promethium", mass: "[145]", category: "lanthanide", electronConfig: "[Xe] 4f5 6s2", row: 9, col: 7 },
  { number: 62, symbol: "Sm", name: "钐", nameEn: "Samarium", mass: "150.36", category: "lanthanide", electronConfig: "[Xe] 4f6 6s2", row: 9, col: 8 },
  { number: 63, symbol: "Eu", name: "铕", nameEn: "Europium", mass: "151.96", category: "lanthanide", electronConfig: "[Xe] 4f7 6s2", row: 9, col: 9 },
  { number: 64, symbol: "Gd", name: "钆", nameEn: "Gadolinium", mass: "157.25", category: "lanthanide", electronConfig: "[Xe] 4f7 5d1 6s2", row: 9, col: 10 },
  { number: 65, symbol: "Tb", name: "铽", nameEn: "Terbium", mass: "158.93", category: "lanthanide", electronConfig: "[Xe] 4f9 6s2", row: 9, col: 11 },
  { number: 66, symbol: "Dy", name: "镝", nameEn: "Dysprosium", mass: "162.50", category: "lanthanide", electronConfig: "[Xe] 4f10 6s2", row: 9, col: 12 },
  { number: 67, symbol: "Ho", name: "钬", nameEn: "Holmium", mass: "164.93", category: "lanthanide", electronConfig: "[Xe] 4f11 6s2", row: 9, col: 13 },
  { number: 68, symbol: "Er", name: "铒", nameEn: "Erbium", mass: "167.26", category: "lanthanide", electronConfig: "[Xe] 4f12 6s2", row: 9, col: 14 },
  { number: 69, symbol: "Tm", name: "铥", nameEn: "Thulium", mass: "168.93", category: "lanthanide", electronConfig: "[Xe] 4f13 6s2", row: 9, col: 15 },
  { number: 70, symbol: "Yb", name: "镱", nameEn: "Ytterbium", mass: "173.05", category: "lanthanide", electronConfig: "[Xe] 4f14 6s2", row: 9, col: 16 },
  { number: 71, symbol: "Lu", name: "镥", nameEn: "Lutetium", mass: "174.97", category: "lanthanide", electronConfig: "[Xe] 4f14 5d1 6s2", row: 9, col: 17 },
  { number: 72, symbol: "Hf", name: "铪", nameEn: "Hafnium", mass: "178.49", category: "transition-metal", electronConfig: "[Xe] 4f14 5d2 6s2", row: 6, col: 4 },
  { number: 73, symbol: "Ta", name: "钽", nameEn: "Tantalum", mass: "180.95", category: "transition-metal", electronConfig: "[Xe] 4f14 5d3 6s2", row: 6, col: 5 },
  { number: 74, symbol: "W", name: "钨", nameEn: "Tungsten", mass: "183.84", category: "transition-metal", electronConfig: "[Xe] 4f14 5d4 6s2", row: 6, col: 6 },
  { number: 75, symbol: "Re", name: "铼", nameEn: "Rhenium", mass: "186.21", category: "transition-metal", electronConfig: "[Xe] 4f14 5d5 6s2", row: 6, col: 7 },
  { number: 76, symbol: "Os", name: "锇", nameEn: "Osmium", mass: "190.23", category: "transition-metal", electronConfig: "[Xe] 4f14 5d6 6s2", row: 6, col: 8 },
  { number: 77, symbol: "Ir", name: "铱", nameEn: "Iridium", mass: "192.22", category: "transition-metal", electronConfig: "[Xe] 4f14 5d7 6s2", row: 6, col: 9 },
  { number: 78, symbol: "Pt", name: "铂", nameEn: "Platinum", mass: "195.08", category: "transition-metal", electronConfig: "[Xe] 4f14 5d9 6s1", row: 6, col: 10 },
  { number: 79, symbol: "Au", name: "金", nameEn: "Gold", mass: "196.97", category: "transition-metal", electronConfig: "[Xe] 4f14 5d10 6s1", row: 6, col: 11 },
  { number: 80, symbol: "Hg", name: "汞", nameEn: "Mercury", mass: "200.59", category: "transition-metal", electronConfig: "[Xe] 4f14 5d10 6s2", row: 6, col: 12 },
  { number: 81, symbol: "Tl", name: "铊", nameEn: "Thallium", mass: "204.38", category: "post-transition-metal", electronConfig: "[Xe] 4f14 5d10 6s2 6p1", row: 6, col: 13 },
  { number: 82, symbol: "Pb", name: "铅", nameEn: "Lead", mass: "207.2", category: "post-transition-metal", electronConfig: "[Xe] 4f14 5d10 6s2 6p2", row: 6, col: 14 },
  { number: 83, symbol: "Bi", name: "铋", nameEn: "Bismuth", mass: "208.98", category: "post-transition-metal", electronConfig: "[Xe] 4f14 5d10 6s2 6p3", row: 6, col: 15 },
  { number: 84, symbol: "Po", name: "钋", nameEn: "Polonium", mass: "[209]", category: "post-transition-metal", electronConfig: "[Xe] 4f14 5d10 6s2 6p4", row: 6, col: 16 },
  { number: 85, symbol: "At", name: "砹", nameEn: "Astatine", mass: "[210]", category: "halogen", electronConfig: "[Xe] 4f14 5d10 6s2 6p5", row: 6, col: 17 },
  { number: 86, symbol: "Rn", name: "氡", nameEn: "Radon", mass: "[222]", category: "noble-gas", electronConfig: "[Xe] 4f14 5d10 6s2 6p6", row: 6, col: 18 },
  { number: 87, symbol: "Fr", name: "钫", nameEn: "Francium", mass: "[223]", category: "alkali-metal", electronConfig: "[Rn] 7s1", row: 7, col: 1 },
  { number: 88, symbol: "Ra", name: "镭", nameEn: "Radium", mass: "[226]", category: "alkaline-earth-metal", electronConfig: "[Rn] 7s2", row: 7, col: 2 },
  { number: 89, symbol: "Ac", name: "锕", nameEn: "Actinium", mass: "[227]", category: "actinide", electronConfig: "[Rn] 6d1 7s2", row: 10, col: 3 },
  { number: 90, symbol: "Th", name: "钍", nameEn: "Thorium", mass: "232.04", category: "actinide", electronConfig: "[Rn] 6d2 7s2", row: 10, col: 4 },
  { number: 91, symbol: "Pa", name: "镤", nameEn: "Protactinium", mass: "231.04", category: "actinide", electronConfig: "[Rn] 5f2 6d1 7s2", row: 10, col: 5 },
  { number: 92, symbol: "U", name: "铀", nameEn: "Uranium", mass: "238.03", category: "actinide", electronConfig: "[Rn] 5f3 6d1 7s2", row: 10, col: 6 },
  { number: 93, symbol: "Np", name: "镎", nameEn: "Neptunium", mass: "[237]", category: "actinide", electronConfig: "[Rn] 5f4 6d1 7s2", row: 10, col: 7 },
  { number: 94, symbol: "Pu", name: "钚", nameEn: "Plutonium", mass: "[244]", category: "actinide", electronConfig: "[Rn] 5f6 7s2", row: 10, col: 8 },
  { number: 95, symbol: "Am", name: "镅", nameEn: "Americium", mass: "[243]", category: "actinide", electronConfig: "[Rn] 5f7 7s2", row: 10, col: 9 },
  { number: 96, symbol: "Cm", name: "锔", nameEn: "Curium", mass: "[247]", category: "actinide", electronConfig: "[Rn] 5f7 6d1 7s2", row: 10, col: 10 },
  { number: 97, symbol: "Bk", name: "锫", nameEn: "Berkelium", mass: "[247]", category: "actinide", electronConfig: "[Rn] 5f9 7s2", row: 10, col: 11 },
  { number: 98, symbol: "Cf", name: "锎", nameEn: "Californium", mass: "[251]", category: "actinide", electronConfig: "[Rn] 5f10 7s2", row: 10, col: 12 },
  { number: 99, symbol: "Es", name: "锿", nameEn: "Einsteinium", mass: "[252]", category: "actinide", electronConfig: "[Rn] 5f11 7s2", row: 10, col: 13 },
  { number: 100, symbol: "Fm", name: "镄", nameEn: "Fermium", mass: "[257]", category: "actinide", electronConfig: "[Rn] 5f12 7s2", row: 10, col: 14 },
  { number: 101, symbol: "Md", name: "钔", nameEn: "Mendelevium", mass: "[258]", category: "actinide", electronConfig: "[Rn] 5f13 7s2", row: 10, col: 15 },
  { number: 102, symbol: "No", name: "锘", nameEn: "Nobelium", mass: "[259]", category: "actinide", electronConfig: "[Rn] 5f14 7s2", row: 10, col: 16 },
  { number: 103, symbol: "Lr", name: "铹", nameEn: "Lawrencium", mass: "[266]", category: "actinide", electronConfig: "[Rn] 5f14 7s2 7p1", row: 10, col: 17 },
  { number: 104, symbol: "Rf", name: "𬬻", nameEn: "Rutherfordium", mass: "[267]", category: "transition-metal", electronConfig: "[Rn] 5f14 6d2 7s2", row: 7, col: 4 },
  { number: 105, symbol: "Db", name: "𬭊", nameEn: "Dubnium", mass: "[268]", category: "transition-metal", electronConfig: "[Rn] 5f14 6d3 7s2", row: 7, col: 5 },
  { number: 106, symbol: "Sg", name: "𬭳", nameEn: "Seaborgium", mass: "[269]", category: "transition-metal", electronConfig: "[Rn] 5f14 6d4 7s2", row: 7, col: 6 },
  { number: 107, symbol: "Bh", name: "𬭛", nameEn: "Bohrium", mass: "[270]", category: "transition-metal", electronConfig: "[Rn] 5f14 6d5 7s2", row: 7, col: 7 },
  { number: 108, symbol: "Hs", name: "𬭶", nameEn: "Hassium", mass: "[269]", category: "transition-metal", electronConfig: "[Rn] 5f14 6d6 7s2", row: 7, col: 8 },
  { number: 109, symbol: "Mt", name: "鿏", nameEn: "Meitnerium", mass: "[278]", category: "transition-metal", electronConfig: "[Rn] 5f14 6d7 7s2", row: 7, col: 9 },
  { number: 110, symbol: "Ds", name: "𫟼", nameEn: "Darmstadtium", mass: "[281]", category: "transition-metal", electronConfig: "[Rn] 5f14 6d8 7s2", row: 7, col: 10 },
  { number: 111, symbol: "Rg", name: "𬬭", nameEn: "Roentgenium", mass: "[282]", category: "transition-metal", electronConfig: "[Rn] 5f14 6d9 7s2", row: 7, col: 11 },
  { number: 112, symbol: "Cn", name: "鎶", nameEn: "Copernicium", mass: "[285]", category: "transition-metal", electronConfig: "[Rn] 5f14 6d10 7s2", row: 7, col: 12 },
  { number: 113, symbol: "Nh", name: "鉨", nameEn: "Nihonium", mass: "[286]", category: "post-transition-metal", electronConfig: "[Rn] 5f14 6d10 7s2 7p1", row: 7, col: 13 },
  { number: 114, symbol: "Fl", name: "𫓧", nameEn: "Flerovium", mass: "[289]", category: "post-transition-metal", electronConfig: "[Rn] 5f14 6d10 7s2 7p2", row: 7, col: 14 },
  { number: 115, symbol: "Mc", name: "镆", nameEn: "Moscovium", mass: "[290]", category: "post-transition-metal", electronConfig: "[Rn] 5f14 6d10 7s2 7p3", row: 7, col: 15 },
  { number: 116, symbol: "Lv", name: "𫟷", nameEn: "Livermorium", mass: "[293]", category: "post-transition-metal", electronConfig: "[Rn] 5f14 6d10 7s2 7p4", row: 7, col: 16 },
  { number: 117, symbol: "Ts", name: "鿬", nameEn: "Tennessine", mass: "[294]", category: "halogen", electronConfig: "[Rn] 5f14 6d10 7s2 7p5", row: 7, col: 17 },
  { number: 118, symbol: "Og", name: "鿫", nameEn: "Oganesson", mass: "[294]", category: "noble-gas", electronConfig: "[Rn] 5f14 6d10 7s2 7p6", row: 7, col: 18 },
];

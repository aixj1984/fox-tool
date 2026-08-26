// 中国亲属称谓计算模块
//
// 实现思路：构建一个虚拟家族图谱，每一步关系操作（父亲/母亲/儿子/女儿/哥哥/弟弟/
// 姐姐/妹妹/丈夫/妻子）在图上移动游标，最后对"我"到目标人之间的关系做称谓推断。
//
// 支持范围（明确声明）：
// - 直系：父母、子女、（外）祖父母、（外）曾祖父母、（外）孙辈
// - 旁系平辈：兄弟姐妹、堂/表兄弟姐妹、兄弟姐妹之配偶
// - 旁系长辈：父母之兄弟姐妹及其配偶（伯叔姑舅姨 + 姑父/姨父/舅妈/婶婶）
// - 旁系晚辈：兄弟姐妹之子女（侄/外甥）
// - 姻亲：配偶、配偶之父母（公婆/岳）、配偶之兄弟姐妹（大伯哥/小舅子等）
// - 子女之配偶（儿媳/女婿）
//
// 超出此范围（如曾孙、四代以上直系、堂侄、表叔等）返回"未知关系（超出已实现范围）"。

export type Sex = "M" | "F";

export type Step =
  | "father"
  | "mother"
  | "son"
  | "daughter"
  | "olderBrother"
  | "youngerBrother"
  | "olderSister"
  | "youngerSister"
  | "husband"
  | "wife";

export const STEP_LABEL: Record<Step, string> = {
  father: "父亲",
  mother: "母亲",
  son: "儿子",
  daughter: "女儿",
  olderBrother: "哥哥",
  youngerBrother: "弟弟",
  olderSister: "姐姐",
  youngerSister: "妹妹",
  husband: "丈夫",
  wife: "妻子",
};

export const STEP_OPTIONS: { step: Step; label: string }[] = [
  { step: "father", label: "父亲" },
  { step: "mother", label: "母亲" },
  { step: "olderBrother", label: "哥哥" },
  { step: "youngerBrother", label: "弟弟" },
  { step: "olderSister", label: "姐姐" },
  { step: "youngerSister", label: "妹妹" },
  { step: "son", label: "儿子" },
  { step: "daughter", label: "女儿" },
  { step: "husband", label: "丈夫" },
  { step: "wife", label: "妻子" },
];

class P {
  sex: Sex;
  father: P | null = null;
  mother: P | null = null;
  spouse: P | null = null;
  children: P[] = [];
  rank: number = 0; // 兄弟姐妹中的出生顺序，越小越年长
  constructor(sex: Sex) {
    this.sex = sex;
  }
}

function ensureParents(p: P): void {
  if (p.father && p.mother) return;
  if (p.father && !p.mother) {
    const m = new P("F");
    m.spouse = p.father;
    p.father.spouse = m;
    if (!m.children.includes(p)) m.children.push(p);
    p.mother = m;
    return;
  }
  if (p.mother && !p.father) {
    const f = new P("M");
    f.spouse = p.mother;
    p.mother.spouse = f;
    if (!f.children.includes(p)) f.children.push(p);
    p.father = f;
    return;
  }
  // 都没有，创建双亲
  const f = new P("M");
  const m = new P("F");
  f.spouse = m;
  m.spouse = f;
  f.children = [p];
  m.children = [p];
  p.father = f;
  p.mother = m;
}

function getFather(p: P): P {
  if (p.father) return p.father;
  ensureParents(p);
  return p.father!;
}

function getMother(p: P): P {
  if (p.mother) return p.mother;
  ensureParents(p);
  return p.mother!;
}

function addChildToParents(child: P, parentA: P, parentB: P | null): void {
  if (!parentA.children.includes(child)) parentA.children.push(child);
  if (parentB && !parentB.children.includes(child)) parentB.children.push(child);
}

function getSon(p: P, from?: P): P {
  const existing = p.children.find((c) => c.sex === "M" && c !== from);
  if (existing) return existing;
  const s = new P("M");
  const otherParent = p.spouse;
  if (p.sex === "M") {
    s.father = p;
    if (otherParent) s.mother = otherParent;
  } else {
    s.mother = p;
    if (otherParent) s.father = otherParent;
  }
  s.rank = p.children.length;
  addChildToParents(s, p, otherParent);
  return s;
}

function getDaughter(p: P, from?: P): P {
  const existing = p.children.find((c) => c.sex === "F" && c !== from);
  if (existing) return existing;
  const d = new P("F");
  const otherParent = p.spouse;
  if (p.sex === "M") {
    d.father = p;
    if (otherParent) d.mother = otherParent;
  } else {
    d.mother = p;
    if (otherParent) d.father = otherParent;
  }
  d.rank = p.children.length;
  addChildToParents(d, p, otherParent);
  return d;
}

function getSibling(p: P, sex: Sex, older: boolean, from?: P): P {
  ensureParents(p);
  const father = p.father;
  if (!father) {
    // 不会发生，ensureParents 已保证
    return new P(sex);
  }
  const candidates = father.children.filter(
    (c) => c !== p && c !== from && c.sex === sex,
  );
  if (older) {
    const olderOnes = candidates.filter((c) => c.rank < p.rank);
    if (olderOnes.length > 0) {
      olderOnes.sort((a, b) => b.rank - a.rank);
      return olderOnes[0];
    }
  } else {
    const youngerOnes = candidates.filter((c) => c.rank > p.rank);
    if (youngerOnes.length > 0) {
      youngerOnes.sort((a, b) => a.rank - b.rank);
      return youngerOnes[0];
    }
  }
  // 创建新兄弟姐妹
  const sib = new P(sex);
  sib.father = p.father;
  sib.mother = p.mother;
  if (older) {
    const minRank = Math.min(
      ...candidates.map((c) => c.rank),
      p.rank,
    );
    sib.rank = minRank - 1;
  } else {
    const maxRank = Math.max(
      ...candidates.map((c) => c.rank),
      p.rank,
    );
    sib.rank = maxRank + 1;
  }
  if (p.father) addChildToParents(sib, p.father, null);
  if (p.mother) addChildToParents(sib, p.mother, null);
  return sib;
}

function getSpouse(p: P): P {
  if (p.spouse) return p.spouse;
  const s = new P(p.sex === "M" ? "F" : "M");
  s.spouse = p;
  p.spouse = s;
  return s;
}

function applyStep(cursor: P, step: Step, prev: P | null): P {
  switch (step) {
    case "father":
      return getFather(cursor);
    case "mother":
      return getMother(cursor);
    case "son":
      return getSon(cursor, prev ?? undefined);
    case "daughter":
      return getDaughter(cursor, prev ?? undefined);
    case "olderBrother":
      return getSibling(cursor, "M", true, prev ?? undefined);
    case "youngerBrother":
      return getSibling(cursor, "M", false, prev ?? undefined);
    case "olderSister":
      return getSibling(cursor, "F", true, prev ?? undefined);
    case "youngerSister":
      return getSibling(cursor, "F", false, prev ?? undefined);
    case "husband":
    case "wife":
      return getSpouse(cursor);
    default:
      return cursor;
  }
}

function getSiblings(p: P): P[] {
  const set = new Set<P>();
  if (p.father) {
    for (const c of p.father.children) {
      if (c !== p) set.add(c);
    }
  }
  if (p.mother) {
    for (const c of p.mother.children) {
      if (c !== p) set.add(c);
    }
  }
  return Array.from(set);
}

function areSiblings(a: P, b: P): boolean {
  if (a === b) return false;
  if (a.father && a.father === b.father) return true;
  if (a.mother && a.mother === b.mother) return true;
  return false;
}

// 计算从 ego 到 target 的称谓
function computeTerm(ego: P, target: P): string {
  if (target === ego) return "自己";

  // 配偶
  if (ego.spouse === target) {
    return target.sex === "M" ? "丈夫" : "妻子";
  }

  // 父母
  if (target === ego.father) return "父亲";
  if (target === ego.mother) return "母亲";

  // 子女
  if (ego.children.includes(target)) {
    return target.sex === "M" ? "儿子" : "女儿";
  }

  // 兄弟姐妹
  if (areSiblings(ego, target)) {
    const older = target.rank < ego.rank;
    if (target.sex === "M") return older ? "哥哥" : "弟弟";
    return older ? "姐姐" : "妹妹";
  }

  // 祖父母（gen +2）
  if (target === ego.father?.father) return "祖父";
  if (target === ego.father?.mother) return "祖母";
  if (target === ego.mother?.father) return "外祖父";
  if (target === ego.mother?.mother) return "外祖母";

  // 曾祖父母（gen +3）
  if (target === ego.father?.father?.father) return "曾祖父";
  if (target === ego.father?.father?.mother) return "曾祖母";
  if (target === ego.father?.mother?.father) return "外曾祖父";
  if (target === ego.father?.mother?.mother) return "外曾祖母";
  if (target === ego.mother?.father?.father) return "外曾祖父";
  if (target === ego.mother?.father?.mother) return "外曾祖母";
  if (target === ego.mother?.mother?.father) return "外曾祖父";
  if (target === ego.mother?.mother?.mother) return "外曾祖母";

  // 孙辈（gen -2）
  for (const child of ego.children) {
    if (target.father === child || target.mother === child) {
      if (child.sex === "M") {
        return target.sex === "M" ? "孙子" : "孙女";
      } else {
        return target.sex === "M" ? "外孙" : "外孙女";
      }
    }
  }

  // 父母的兄弟姐妹
  if (ego.father && areSiblings(ego.father, target)) {
    if (target.sex === "M") {
      return target.rank < ego.father.rank ? "伯父" : "叔父";
    }
    return "姑母";
  }
  if (ego.mother && areSiblings(ego.mother, target)) {
    if (target.sex === "M") return "舅父";
    return "姨母";
  }

  // 父母兄弟姐妹的配偶（姑父/姨父/舅妈/婶婶/伯母）
  for (const parent of [ego.father, ego.mother]) {
    if (!parent) continue;
    for (const sib of getSiblings(parent)) {
      if (sib.spouse === target) {
        if (parent.sex === "M") {
          // 父亲的兄弟姐妹的配偶
          if (sib.sex === "M") {
            return sib.rank < parent.rank ? "伯母" : "婶母";
          }
          return "姑父";
        } else {
          // 母亲的兄弟姐妹的配偶
          if (sib.sex === "M") return "舅母";
          return "姨父";
        }
      }
    }
  }

  // 兄弟姐妹的配偶（嫂子/弟妹/姐夫/妹夫）
  for (const sib of getSiblings(ego)) {
    if (sib.spouse === target) {
      const older = sib.rank < ego.rank;
      if (sib.sex === "M") {
        return older ? "嫂子" : "弟妹";
      }
      return older ? "姐夫" : "妹夫";
    }
  }

  // 子女的配偶（儿媳/女婿）
  for (const child of ego.children) {
    if (child.spouse === target) {
      return child.sex === "M" ? "儿媳" : "女婿";
    }
  }

  // 配偶的父母（公婆/岳父母）
  if (ego.spouse) {
    if (target === ego.spouse.father) {
      return ego.sex === "F" ? "公公" : "岳父";
    }
    if (target === ego.spouse.mother) {
      return ego.sex === "F" ? "婆婆" : "岳母";
    }
  }

  // 配偶的兄弟姐妹（大伯哥/小叔子/大姑姐/小姑子/大舅哥/小舅子/大姨姐/小姨子）
  if (ego.spouse) {
    for (const sib of getSiblings(ego.spouse)) {
      if (sib === target) {
        const older = sib.rank < ego.spouse.rank;
        if (ego.sex === "F") {
          if (sib.sex === "M") return older ? "大伯哥" : "小叔子";
          return older ? "大姑姐" : "小姑子";
        } else {
          if (sib.sex === "M") return older ? "大舅哥" : "小舅子";
          return older ? "大姨姐" : "小姨子";
        }
      }
    }
  }

  // 兄弟姐妹的子女（侄/外甥）
  for (const sib of getSiblings(ego)) {
    for (const n of sib.children) {
      if (n === target) {
        if (sib.sex === "M") {
          return target.sex === "M" ? "侄子" : "侄女";
        }
        return target.sex === "M" ? "外甥" : "外甥女";
      }
    }
  }

  // 堂/表兄弟姐妹（父母兄弟姐妹的子女）
  for (const parent of [ego.father, ego.mother]) {
    if (!parent) continue;
    for (const sib of getSiblings(parent)) {
      for (const cousin of sib.children) {
        if (cousin === target) {
          const tang = parent.sex === "M" && sib.sex === "M"; // 父亲的兄弟的子女=堂
          const older = sib.rank < parent.rank;
          const prefix = tang ? "堂" : "表";
          if (target.sex === "M") return older ? `${prefix}兄` : `${prefix}弟`;
          return older ? `${prefix}姐` : `${prefix}妹`;
        }
      }
    }
  }

  // 祖父母的兄弟姐妹（伯祖父/叔祖父/姑祖母/舅祖父/姨祖母）
  for (const gp of [
    ego.father?.father ?? null,
    ego.father?.mother ?? null,
    ego.mother?.father ?? null,
    ego.mother?.mother ?? null,
  ]) {
    if (!gp) continue;
    for (const sib of getSiblings(gp)) {
      if (sib === target) {
        const isFatherSide = gp === ego.father?.father || gp === ego.father?.mother;
        if (isFatherSide) {
          if (sib.sex === "M") {
            return sib.rank < gp.rank ? "伯祖父" : "叔祖父";
          }
          return "姑祖母";
        } else {
          if (sib.sex === "M") return "舅祖父";
          return "姨祖母";
        }
      }
    }
  }

  return "未知关系（超出已实现范围）";
}

export function resolveChain(
  egoSex: Sex,
  steps: Step[],
): { term: string; chain: string[] } {
  const ego = new P(egoSex);
  let cursor: P = ego;
  let prev: P | null = null;
  for (const step of steps) {
    const next = applyStep(cursor, step, prev);
    prev = cursor;
    cursor = next;
  }
  const chain = steps.map((s) => STEP_LABEL[s]);
  return { term: computeTerm(ego, cursor), chain };
}

// ============ 称谓查询表（反查） ============

export interface KinshipEntry {
  term: string;
  description: string;
  altTerms?: string[];
  category: string;
}

export const KINSHIP_ENTRIES: KinshipEntry[] = [
  // 直系长辈
  { term: "父亲", description: "生身之父", category: "直系长辈", altTerms: ["爸爸"] },
  { term: "母亲", description: "生身之母", category: "直系长辈", altTerms: ["妈妈"] },
  { term: "祖父", description: "父亲的父亲", category: "直系长辈", altTerms: ["爷爷"] },
  { term: "祖母", description: "父亲的母亲", category: "直系长辈", altTerms: ["奶奶"] },
  { term: "外祖父", description: "母亲的父亲", category: "直系长辈", altTerms: ["外公", "姥爷"] },
  { term: "外祖母", description: "母亲的母亲", category: "直系长辈", altTerms: ["外婆", "姥姥"] },
  { term: "曾祖父", description: "父亲的祖父（爷爷的爸爸）", category: "直系长辈", altTerms: ["太爷爷"] },
  { term: "曾祖母", description: "父亲的祖母（爷爷的妈妈）", category: "直系长辈", altTerms: ["太奶奶"] },
  { term: "外曾祖父", description: "母亲的外祖父等含母系链的三代长辈", category: "直系长辈", altTerms: ["太外公"] },
  { term: "外曾祖母", description: "母亲的外祖母等含母系链的三代长辈", category: "直系长辈", altTerms: ["太外婆"] },

  // 旁系长辈
  { term: "伯父", description: "父亲的哥哥", category: "旁系长辈", altTerms: ["伯伯"] },
  { term: "叔父", description: "父亲的弟弟", category: "旁系长辈", altTerms: ["叔叔"] },
  { term: "姑母", description: "父亲的姐妹", category: "旁系长辈", altTerms: ["姑姑"] },
  { term: "舅父", description: "母亲的兄弟", category: "旁系长辈", altTerms: ["舅舅"] },
  { term: "姨母", description: "母亲的姐妹", category: "旁系长辈", altTerms: ["姨妈", "阿姨"] },
  { term: "姑父", description: "姑母的丈夫（父亲姐妹的丈夫）", category: "旁系长辈" },
  { term: "姨父", description: "姨母的丈夫（母亲姐妹的丈夫）", category: "旁系长辈", altTerms: ["姨丈"] },
  { term: "舅母", description: "舅父的妻子（母亲兄弟的妻子）", category: "旁系长辈", altTerms: ["舅妈"] },
  { term: "婶母", description: "叔父的妻子（父亲弟弟的妻子）", category: "旁系长辈", altTerms: ["婶婶"] },
  { term: "伯母", description: "伯父的妻子（父亲哥哥的妻子）", category: "旁系长辈" },

  // 平辈
  { term: "哥哥", description: "同父母的年长男性", category: "平辈" },
  { term: "弟弟", description: "同父母的年幼男性", category: "平辈" },
  { term: "姐姐", description: "同父母的年长女性", category: "平辈" },
  { term: "妹妹", description: "同父母的年幼女性", category: "平辈" },
  { term: "堂兄", description: "父亲兄弟的儿子（年长于己）", category: "平辈" },
  { term: "堂弟", description: "父亲兄弟的儿子（年幼于己）", category: "平辈" },
  { term: "堂姐", description: "父亲兄弟的女儿（年长于己）", category: "平辈" },
  { term: "堂妹", description: "父亲兄弟的女儿（年幼于己）", category: "平辈" },
  { term: "表兄", description: "姑母/舅父/姨母的儿子（年长于己）", category: "平辈" },
  { term: "表弟", description: "姑母/舅父/姨母的儿子（年幼于己）", category: "平辈" },
  { term: "表姐", description: "姑母/舅父/姨母的女儿（年长于己）", category: "平辈" },
  { term: "表妹", description: "姑母/舅父/姨母的女儿（年幼于己）", category: "平辈" },
  { term: "嫂子", description: "哥哥的妻子", category: "平辈", altTerms: ["嫂嫂"] },
  { term: "弟妹", description: "弟弟的妻子", category: "平辈", altTerms: ["弟媳"] },
  { term: "姐夫", description: "姐姐的丈夫", category: "平辈" },
  { term: "妹夫", description: "妹妹的丈夫", category: "平辈" },

  // 直系晚辈
  { term: "儿子", description: "亲生之子", category: "直系晚辈" },
  { term: "女儿", description: "亲生之女", category: "直系晚辈" },
  { term: "孙子", description: "儿子的儿子", category: "直系晚辈" },
  { term: "孙女", description: "儿子的女儿", category: "直系晚辈" },
  { term: "外孙", description: "女儿的儿子", category: "直系晚辈" },
  { term: "外孙女", description: "女儿的女儿", category: "直系晚辈" },
  { term: "儿媳", description: "儿子的妻子", category: "直系晚辈", altTerms: ["儿媳妇"] },
  { term: "女婿", description: "女儿的丈夫", category: "直系晚辈" },

  // 旁系晚辈
  { term: "侄子", description: "兄弟的儿子", category: "旁系晚辈" },
  { term: "侄女", description: "兄弟的女儿", category: "旁系晚辈" },
  { term: "外甥", description: "姐妹的儿子", category: "旁系晚辈" },
  { term: "外甥女", description: "姐妹的女儿", category: "旁系晚辈" },

  // 配偶与姻亲
  { term: "丈夫", description: "已婚女性的配偶", category: "配偶" },
  { term: "妻子", description: "已婚男性的配偶", category: "配偶", altTerms: ["老婆"] },
  { term: "公公", description: "丈夫的父亲", category: "姻亲" },
  { term: "婆婆", description: "丈夫的母亲", category: "姻亲" },
  { term: "岳父", description: "妻子的父亲", category: "姻亲", altTerms: ["丈人", "泰山"] },
  { term: "岳母", description: "妻子的母亲", category: "姻亲", altTerms: ["丈母"] },
  { term: "大伯哥", description: "丈夫的哥哥", category: "姻亲" },
  { term: "小叔子", description: "丈夫的弟弟", category: "姻亲" },
  { term: "大姑姐", description: "丈夫的姐姐", category: "姻亲" },
  { term: "小姑子", description: "丈夫的妹妹", category: "姻亲" },
  { term: "大舅哥", description: "妻子的哥哥", category: "姻亲" },
  { term: "小舅子", description: "妻子的弟弟", category: "姻亲" },
  { term: "大姨姐", description: "妻子的姐姐", category: "姻亲" },
  { term: "小姨子", description: "妻子的妹妹", category: "姻亲" },
];

// 食物数据 - 用于"今天吃什么"工具
// 按三餐 + 类别组织，每道菜带名称

export type MealType = "breakfast" | "lunch" | "dinner";

export interface FoodItem {
  name: string;
  category: string;
  meals: MealType[]; // 适合哪几餐
}

export const MEAL_LABEL: Record<MealType, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
};

export const FOODS: FoodItem[] = [
  // 中餐
  { name: "宫保鸡丁", category: "中餐", meals: ["lunch", "dinner"] },
  { name: "麻婆豆腐", category: "中餐", meals: ["lunch", "dinner"] },
  { name: "鱼香肉丝", category: "中餐", meals: ["lunch", "dinner"] },
  { name: "回锅肉", category: "中餐", meals: ["lunch", "dinner"] },
  { name: "红烧肉", category: "中餐", meals: ["lunch", "dinner"] },
  { name: "糖醋排骨", category: "中餐", meals: ["lunch", "dinner"] },
  { name: "番茄炒蛋", category: "中餐", meals: ["lunch", "dinner"] },
  { name: "清蒸鲈鱼", category: "中餐", meals: ["lunch", "dinner"] },
  { name: "水煮牛肉", category: "中餐", meals: ["lunch", "dinner"] },
  { name: "酸菜鱼", category: "中餐", meals: ["lunch", "dinner"] },

  // 西餐
  { name: "牛排", category: "西餐", meals: ["lunch", "dinner"] },
  { name: "意面", category: "西餐", meals: ["lunch", "dinner"] },
  { name: "披萨", category: "西餐", meals: ["lunch", "dinner"] },
  { name: "汉堡", category: "西餐", meals: ["lunch", "dinner"] },
  { name: "凯撒沙拉", category: "西餐", meals: ["lunch", "dinner"] },
  { name: "奶油蘑菇汤", category: "西餐", meals: ["lunch", "dinner"] },

  // 日料
  { name: "寿司", category: "日料", meals: ["lunch", "dinner"] },
  { name: "拉面", category: "日料", meals: ["lunch", "dinner"] },
  { name: "天妇罗", category: "日料", meals: ["lunch", "dinner"] },
  { name: "鳗鱼饭", category: "日料", meals: ["lunch", "dinner"] },
  { name: "日式咖喱饭", category: "日料", meals: ["lunch", "dinner"] },

  // 韩餐
  { name: "石锅拌饭", category: "韩餐", meals: ["lunch", "dinner"] },
  { name: "韩式炸鸡", category: "韩餐", meals: ["lunch", "dinner"] },
  { name: "部队锅", category: "韩餐", meals: ["lunch", "dinner"] },
  { name: "韩式烤肉", category: "韩餐", meals: ["lunch", "dinner"] },

  // 快餐
  { name: "肯德基", category: "快餐", meals: ["lunch", "dinner"] },
  { name: "麦当劳", category: "快餐", meals: ["lunch", "dinner"] },
  { name: "肉夹馍", category: "快餐", meals: ["lunch", "dinner"] },
  { name: "煎饼果子", category: "快餐", meals: ["breakfast", "lunch", "dinner"] },
  { name: "炸酱面", category: "快餐", meals: ["lunch", "dinner"] },

  // 火锅
  { name: "麻辣火锅", category: "火锅", meals: ["dinner"] },
  { name: "番茄火锅", category: "火锅", meals: ["dinner"] },
  { name: "潮汕牛肉锅", category: "火锅", meals: ["dinner"] },
  { name: "串串香", category: "火锅", meals: ["dinner"] },

  // 烧烤
  { name: "烤羊肉串", category: "烧烤", meals: ["dinner"] },
  { name: "烤鱼", category: "烧烤", meals: ["dinner"] },
  { name: "韩式烤五花肉", category: "烧烤", meals: ["dinner"] },

  // 面食
  { name: "兰州拉面", category: "面食", meals: ["lunch", "dinner"] },
  { name: "刀削面", category: "面食", meals: ["lunch", "dinner"] },
  { name: "热干面", category: "面食", meals: ["breakfast", "lunch"] },
  { name: "担担面", category: "面食", meals: ["lunch", "dinner"] },
  { name: "牛肉面", category: "面食", meals: ["lunch", "dinner"] },

  // 粥
  { name: "皮蛋瘦肉粥", category: "粥", meals: ["breakfast", "dinner"] },
  { name: "小米粥", category: "粥", meals: ["breakfast", "dinner"] },
  { name: "八宝粥", category: "粥", meals: ["breakfast"] },
  { name: "南瓜粥", category: "粥", meals: ["breakfast", "dinner"] },

  // 沙拉
  { name: "水果沙拉", category: "沙拉", meals: ["breakfast", "lunch"] },
  { name: "蔬菜沙拉", category: "沙拉", meals: ["lunch", "dinner"] },
  { name: "鸡胸肉沙拉", category: "沙拉", meals: ["lunch", "dinner"] },

  // 早餐专属
  { name: "豆浆油条", category: "早餐", meals: ["breakfast"] },
  { name: "包子", category: "早餐", meals: ["breakfast"] },
  { name: "馒头", category: "早餐", meals: ["breakfast"] },
  { name: "花卷", category: "早餐", meals: ["breakfast"] },
  { name: "烧麦", category: "早餐", meals: ["breakfast"] },
  { name: "肠粉", category: "早餐", meals: ["breakfast"] },
  { name: "小笼包", category: "早餐", meals: ["breakfast"] },
  { name: "鸡蛋灌饼", category: "早餐", meals: ["breakfast"] },
  { name: "三明治", category: "早餐", meals: ["breakfast"] },
  { name: "牛奶燕麦", category: "早餐", meals: ["breakfast"] },
  { name: "法式吐司", category: "早餐", meals: ["breakfast"] },
  { name: "荷包蛋", category: "早餐", meals: ["breakfast"] },

  // 其他主食/小食
  { name: "饺子", category: "面食", meals: ["lunch", "dinner"] },
  { name: "馄饨", category: "面食", meals: ["lunch", "dinner"] },
  { name: "炒饭", category: "中餐", meals: ["lunch", "dinner"] },
  { name: "卤肉饭", category: "中餐", meals: ["lunch", "dinner"] },
  { name: "黄焖鸡米饭", category: "中餐", meals: ["lunch", "dinner"] },
  { name: "盖浇饭", category: "中餐", meals: ["lunch", "dinner"] },
  { name: "麻辣烫", category: "快餐", meals: ["lunch", "dinner"] },
  { name: "凉皮", category: "面食", meals: ["lunch"] },
  { name: "米线", category: "面食", meals: ["lunch", "dinner"] },
  { name: "煲仔饭", category: "中餐", meals: ["dinner"] },
];

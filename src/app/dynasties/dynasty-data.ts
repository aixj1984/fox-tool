// Chinese dynasties timeline data (夏 → 中华民国).
// Years are approximate (BC marked as 前). Compilation of widely-accepted historical ranges.

export interface Dynasty {
  name: string;
  start: string;
  end: string;
  founder: string;
  capital: string;
  intro: string;
}

export const DYNASTIES: Dynasty[] = [
  {
    name: "夏朝",
    start: "约前2070",
    end: "约前1600",
    founder: "禹",
    capital: "阳城、斟鄩",
    intro:
      "中国史书中记载的第一个世袭制朝代，由禹的儿子启建立，确立了家天下制度，共传十四代十七王。",
  },
  {
    name: "商朝",
    start: "约前1600",
    end: "前1046",
    founder: "汤",
    capital: "亳、殷",
    intro:
      "中国第一个有直接同期文字记载的王朝，甲骨文与青铜器高度发达，盘庚迁殷后政局稳定。",
  },
  {
    name: "西周",
    start: "前1046",
    end: "前771",
    founder: "周武王（姬发）",
    capital: "镐京",
    intro:
      "武王伐纣灭商建周，推行分封制与宗法制，礼乐文明达到顶峰，幽王时被犬戎所灭。",
  },
  {
    name: "东周（春秋）",
    start: "前770",
    end: "前476",
    founder: "周平王（姬宜臼）",
    capital: "洛邑",
    intro:
      "周平王东迁洛邑后王权衰落，诸侯争霸，齐桓、晋文、楚庄等先后称霸，是思想活跃的时期。",
  },
  {
    name: "东周（战国）",
    start: "前475",
    end: "前221",
    founder: "周元王（姬仁）",
    capital: "洛邑",
    intro:
      "齐、楚、燕、韩、赵、魏、秦七雄并立，变法图强，百家争鸣，最终由秦统一六国。",
  },
  {
    name: "秦朝",
    start: "前221",
    end: "前207",
    founder: "秦始皇（嬴政）",
    capital: "咸阳",
    intro:
      "中国第一个统一的中央集权王朝，推行郡县制、书同文、车同轨，统一度量衡，二世而亡。",
  },
  {
    name: "西汉",
    start: "前202",
    end: "公元8",
    founder: "汉高祖（刘邦）",
    capital: "长安",
    intro:
      "刘邦灭项羽建汉，定都长安，文景之治与汉武帝盛世使国力强盛，开辟丝绸之路，王莽篡位而终。",
  },
  {
    name: "新朝",
    start: "公元9",
    end: "23",
    founder: "王莽",
    capital: "常安",
    intro: "王莽代汉自立，推行托古改制，因改革失败引发绿林赤眉起义，短祚而亡。",
  },
  {
    name: "东汉",
    start: "25",
    end: "220",
    founder: "汉光武帝（刘秀）",
    capital: "洛阳",
    intro:
      "刘秀重建汉室，定都洛阳，明章之治国势复振，末年黄巾起义群雄并起，终为曹魏所代。",
  },
  {
    name: "三国（魏）",
    start: "220",
    end: "265",
    founder: "魏文帝（曹丕）",
    capital: "洛阳",
    intro: "曹丕代汉称帝，国号魏，与蜀、吴三国鼎立，司马氏专权后被晋取代。",
  },
  {
    name: "三国（蜀）",
    start: "221",
    end: "263",
    founder: "汉昭烈帝（刘备）",
    capital: "成都",
    intro: "刘备延续汉统，建国号汉，史称蜀汉，诸葛亮辅政，终为魏所灭。",
  },
  {
    name: "三国（吴）",
    start: "222",
    end: "280",
    founder: "吴大帝（孙权）",
    capital: "建业",
    intro: "孙权据江东称帝，国号吴，开发江南，至孙皓时为西晋所灭，三国归一。",
  },
  {
    name: "西晋",
    start: "265",
    end: "316",
    founder: "晋武帝（司马炎）",
    capital: "洛阳",
    intro: "司马炎代魏建晋，平吴统一，八王之乱后匈奴攻破洛阳，衣冠南渡。",
  },
  {
    name: "东晋",
    start: "317",
    end: "420",
    founder: "晋元帝（司马睿）",
    capital: "建康",
    intro: "司马睿在建康重建晋室，与北方十六国对峙，王谢世家掌权，终为刘裕所代。",
  },
  {
    name: "南北朝（南朝·宋）",
    start: "420",
    end: "479",
    founder: "宋武帝（刘裕）",
    capital: "建康",
    intro: "刘裕代晋建宋，为南朝之始，元嘉之治稍得安定，后为萧道成所代。",
  },
  {
    name: "南北朝（南朝·齐）",
    start: "479",
    end: "502",
    founder: "齐高帝（萧道成）",
    capital: "建康",
    intro: "萧道成代宋建齐，史称南齐，国祚短暂，后为萧衍所代。",
  },
  {
    name: "南北朝（南朝·梁）",
    start: "502",
    end: "557",
    founder: "梁武帝（萧衍）",
    capital: "建康",
    intro: "萧衍代齐建梁，前期文治兴盛，侯景之乱后国势骤衰，终为陈霸先所代。",
  },
  {
    name: "南北朝（南朝·陈）",
    start: "557",
    end: "589",
    founder: "陈武帝（陈霸先）",
    capital: "建康",
    intro: "陈霸先代梁建陈，是南朝版图最小的朝代，终为隋所灭，南北朝结束。",
  },
  {
    name: "南北朝（北朝·北魏）",
    start: "386",
    end: "534",
    founder: "魏道武帝（拓跋珪）",
    capital: "平城、洛阳",
    intro: "鲜卑拓跋部建国，统一北方，孝文帝汉化改革迁都洛阳，后分裂为东魏与西魏。",
  },
  {
    name: "南北朝（北朝·东魏-北齐）",
    start: "534",
    end: "577",
    founder: "魏孝静帝（元善见）/ 齐文宣帝（高洋）",
    capital: "邺",
    intro: "高欢拥立东魏，其子高洋代魏建北齐，国势一度强盛，为北周所灭。",
  },
  {
    name: "南北朝（北朝·西魏-北周）",
    start: "535",
    end: "581",
    founder: "魏文帝（元宝炬）/ 周孝闵帝（宇文觉）",
    capital: "长安",
    intro: "宇文泰拥立西魏，其子宇文觉代魏建北周，周武帝灭北齐统一北方，为隋所代。",
  },
  {
    name: "隋朝",
    start: "581",
    end: "618",
    founder: "隋文帝（杨坚）",
    capital: "大兴、洛阳",
    intro:
      "杨坚代周灭陈，统一全国，开创科举与三省六部制，开皇之治国力强盛，炀帝暴政而亡。",
  },
  {
    name: "唐朝",
    start: "618",
    end: "907",
    founder: "唐高祖（李渊）",
    capital: "长安、洛阳",
    intro:
      "中国鼎盛时期，贞观之治与开元盛世国力强盛，文化繁荣，万邦来朝，终为朱温所灭。",
  },
  {
    name: "五代（后梁）",
    start: "907",
    end: "923",
    founder: "梁太祖（朱温）",
    capital: "开封",
    intro: "朱温代唐建梁，五代十国开端，与李克用、李存勖父子长期争战，终为后唐所灭。",
  },
  {
    name: "五代（后唐）",
    start: "923",
    end: "936",
    founder: "唐庄宗（李存勖）",
    capital: "洛阳",
    intro: "李存勖灭后梁建后唐，沙陀族政权，因内乱为石敬瑭借契丹之力所灭。",
  },
  {
    name: "五代（后晋）",
    start: "936",
    end: "947",
    founder: "晋高祖（石敬瑭）",
    capital: "开封",
    intro: "石敬瑭割燕云十六州借契丹建后晋，称儿皇帝，终为契丹所灭。",
  },
  {
    name: "五代（后汉）",
    start: "947",
    end: "950",
    founder: "汉高祖（刘知远）",
    capital: "开封",
    intro: "刘知远趁契丹北撤建后汉，五代中享国最短，为郭威所代。",
  },
  {
    name: "五代（后周）",
    start: "951",
    end: "960",
    founder: "周太祖（郭威）",
    capital: "开封",
    intro: "郭威代汉建周，世宗柴荣励精图治，国势日盛，赵匡胤陈桥兵变代周。",
  },
  {
    name: "宋朝（北宋）",
    start: "960",
    end: "1127",
    founder: "宋太祖（赵匡胤）",
    capital: "开封",
    intro:
      "赵匡胤建宋，结束五代十国分裂，重文抑武，经济文化科技发达，靖康之变后南迁。",
  },
  {
    name: "宋朝（南宋）",
    start: "1127",
    end: "1279",
    founder: "宋高宗（赵构）",
    capital: "临安",
    intro:
      "赵构在江南重建宋室，偏安一隅，岳飞抗金未能收复中原，终为元所灭。",
  },
  {
    name: "辽朝",
    start: "907",
    end: "1125",
    founder: "辽太祖（耶律阿保机）",
    capital: "上京",
    intro: "契丹族建立的北方王朝，创制契丹文字，与北宋长期对峙，为金所灭。",
  },
  {
    name: "西夏",
    start: "1038",
    end: "1227",
    founder: "夏景宗（李元昊）",
    capital: "兴庆府",
    intro: "党项族建国于西北，创西夏文，与宋辽金鼎立，为蒙古所灭。",
  },
  {
    name: "金朝",
    start: "1115",
    end: "1234",
    founder: "金太祖（完颜阿骨打）",
    capital: "会宁、中都、开封",
    intro: "女真族建国，灭辽与北宋，统治北方，海陵王迁都中都，为蒙古所灭。",
  },
  {
    name: "元朝",
    start: "1271",
    end: "1368",
    founder: "元世祖（忽必烈）",
    capital: "大都",
    intro:
      "忽必烈定国号元，灭南宋统一全国，疆域空前辽阔，行省制度影响深远，为明所灭。",
  },
  {
    name: "明朝",
    start: "1368",
    end: "1644",
    founder: "明太祖（朱元璋）",
    capital: "应天、北京",
    intro:
      "朱元璋驱逐元室建明，永乐迁都北京，郑和下西洋，中后期资本主义萌芽，为李自成所灭。",
  },
  {
    name: "清朝",
    start: "1636",
    end: "1912",
    founder: "清太宗（皇太极）",
    capital: "盛京、北京",
    intro:
      "皇太极改国号为清，入关统一全国，康乾盛世国力强盛，近代沦为半殖民地，辛亥革命后灭亡。",
  },
  {
    name: "中华民国",
    start: "1912",
    end: "1949",
    founder: "孙中山",
    capital: "南京、北京",
    intro:
      "辛亥革命推翻帝制建立民国，经历北洋政府与国民政府时期，1949年新中国成立，民国在大陆时期结束。",
  },
];

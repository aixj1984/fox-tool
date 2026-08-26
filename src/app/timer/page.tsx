"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "世界时间校准工具可以帮助您查看和校准全球各地的当前时间。通过这款工具，您可以轻松获取不同国家和城市的准确时间，便于进行国际交流、旅行计划和跨时区工作安排。";

type City = {
  id: string;
  city: string;
  country: string;
  tz: string;
};

// A curated default list of ~20 world cities with IANA timezone identifiers.
const DEFAULT_CITIES: City[] = [
  { id: "shanghai", city: "上海", country: "中国", tz: "Asia/Shanghai" },
  { id: "hongkong", city: "香港", country: "中国", tz: "Asia/Hong_Kong" },
  { id: "tokyo", city: "东京", country: "日本", tz: "Asia/Tokyo" },
  { id: "singapore", city: "新加坡", country: "新加坡", tz: "Asia/Singapore" },
  { id: "dubai", city: "迪拜", country: "阿联酋", tz: "Asia/Dubai" },
  { id: "mumbai", city: "孟买", country: "印度", tz: "Asia/Kolkata" },
  { id: "london", city: "伦敦", country: "英国", tz: "Europe/London" },
  { id: "paris", city: "巴黎", country: "法国", tz: "Europe/Paris" },
  { id: "berlin", city: "柏林", country: "德国", tz: "Europe/Berlin" },
  { id: "moscow", city: "莫斯科", country: "俄罗斯", tz: "Europe/Moscow" },
  { id: "newyork", city: "纽约", country: "美国", tz: "America/New_York" },
  { id: "chicago", city: "芝加哥", country: "美国", tz: "America/Chicago" },
  { id: "losangeles", city: "洛杉矶", country: "美国", tz: "America/Los_Angeles" },
  { id: "toronto", city: "多伦多", country: "加拿大", tz: "America/Toronto" },
  { id: "mexicocity", city: "墨西哥城", country: "墨西哥", tz: "America/Mexico_City" },
  { id: "saopaulo", city: "圣保罗", country: "巴西", tz: "America/Sao_Paulo" },
  { id: "sydney", city: "悉尼", country: "澳大利亚", tz: "Australia/Sydney" },
  { id: "auckland", city: "奥克兰", country: "新西兰", tz: "Pacific/Auckland" },
  { id: "cairo", city: "开罗", country: "埃及", tz: "Africa/Cairo" },
  { id: "johannesburg", city: "约翰内斯堡", country: "南非", tz: "Africa/Johannesburg" },
];

// Pool of additional cities users can add.
const EXTRA_CITIES: City[] = [
  { id: "seoul", city: "首尔", country: "韩国", tz: "Asia/Seoul" },
  { id: "bangkok", city: "曼谷", country: "泰国", tz: "Asia/Bangkok" },
  { id: "jakarta", city: "雅加达", country: "印度尼西亚", tz: "Asia/Jakarta" },
  { id: "manila", city: "马尼拉", country: "菲律宾", tz: "Asia/Manila" },
  { id: "istanbul", city: "伊斯坦布尔", country: "土耳其", tz: "Europe/Istanbul" },
  { id: "stockholm", city: "斯德哥尔摩", country: "瑞典", tz: "Europe/Stockholm" },
  { id: "rome", city: "罗马", country: "意大利", tz: "Europe/Rome" },
  { id: "madrid", city: "马德里", country: "西班牙", tz: "Europe/Madrid" },
  { id: "honolulu", city: "火奴鲁鲁", country: "美国", tz: "Pacific/Honolulu" },
  { id: "buenosaires", city: "布宜诺斯艾利斯", country: "阿根廷", tz: "America/Argentina/Buenos_Aires" },
  { id: "vancouver", city: "温哥华", country: "加拿大", tz: "America/Vancouver" },
  { id: "perth", city: "珀斯", country: "澳大利亚", tz: "Australia/Perth" },
  { id: "nairobi", city: "内罗毕", country: "肯尼亚", tz: "Africa/Nairobi" },
  { id: "riyadh", city: "利雅得", country: "沙特阿拉伯", tz: "Asia/Riyadh" },
  { id: "tehran", city: "德黑兰", country: "伊朗", tz: "Asia/Tehran" },
];

type CityTime = {
  time: string;
  date: string;
  weekday: string;
  offset: string;
};

function formatCityTime(tz: string, now: Date): CityTime {
  try {
    const timeFmt = new Intl.DateTimeFormat("zh-CN", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const dateFmt = new Intl.DateTimeFormat("zh-CN", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const weekdayFmt = new Intl.DateTimeFormat("zh-CN", {
      timeZone: tz,
      weekday: "long",
    });
    // Compute UTC offset for the zone at `now` (handles DST).
    const offsetFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = offsetFmt.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    const offset = offsetPart?.value ?? "UTC";
    return {
      time: timeFmt.format(now),
      date: dateFmt.format(now),
      weekday: weekdayFmt.format(now),
      offset,
    } satisfies CityTime;
  } catch {
    return { time: "—", date: "—", weekday: "—", offset: "—" };
  }
}

function isValidTz(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export default function Page() {
  const [cities, setCities] = useState<City[]>(DEFAULT_CITIES);
  const [now, setNow] = useState<Date | null>(null);
  const [customTz, setCustomTz] = useState("");
  const [customName, setCustomName] = useState("");
  const [addErr, setAddErr] = useState("");

  // Per-second tick. Only runs in the browser.
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const times = useMemo(() => {
    const map = new Map<string, CityTime>();
    if (!now) return map;
    for (const c of cities) {
      map.set(c.id, formatCityTime(c.tz, now));
    }
    return map;
  }, [cities, now]);

  const removableIds = new Set(cities.map((c) => c.id));
  const availableExtras = EXTRA_CITIES.filter((c) => !removableIds.has(c.id));

  const removeCity = (id: string) => {
    setCities((prev) => prev.filter((c) => c.id !== id));
  };

  const addExtra = (id: string) => {
    const c = EXTRA_CITIES.find((x) => x.id === id);
    if (c) setCities((prev) => [...prev, c]);
  };

  const addCustom = () => {
    setAddErr("");
    const tz = customTz.trim();
    const name = customName.trim() || tz;
    if (!tz) {
      setAddErr("请输入时区标识");
      return;
    }
    if (!isValidTz(tz)) {
      setAddErr("无效的时区标识，例如 Asia/Tokyo");
      return;
    }
    const id = `custom-${tz.replace(/[/_]/g, "-")}-${Date.now()}`;
    setCities((prev) => [...prev, { id, city: name, country: "自定义", tz }]);
    setCustomTz("");
    setCustomName("");
  };

  return (
    <ToolPageShell title="世界时间校准" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <div className="mb-[12px] flex items-center justify-between">
            <ToolLabel>全球城市当前时间</ToolLabel>
            <span className="text-[13px] text-[#8F8F8F]">
              {now ? `本机时间 ${now.toLocaleTimeString("zh-CN", { hour12: false })}` : "正在同步……"}（每秒更新）
            </span>
          </div>
          <div className="overflow-hidden rounded-[8px] border border-[#F6F7FA]">
            <table className="w-full text-[14px]">
              <thead className="bg-[#F6F7FA] text-left text-[#8F8F8F]">
                <tr>
                  <th className="px-[14px] py-[8px] font-medium">城市</th>
                  <th className="px-[14px] py-[8px] font-medium">时区</th>
                  <th className="px-[14px] py-[8px] font-medium">当前时间</th>
                  <th className="px-[14px] py-[8px] font-medium">日期</th>
                  <th className="px-[14px] py-[8px] font-medium">星期</th>
                  <th className="px-[14px] py-[8px] font-medium">UTC 偏移</th>
                  <th className="px-[14px] py-[8px] font-medium" />
                </tr>
              </thead>
              <tbody>
                {cities.map((c) => {
                  const t = times.get(c.id);
                  return (
                    <tr key={c.id} className="border-t border-[#F6F7FA]">
                      <td className="px-[14px] py-[10px] text-[#242424]">
                        <span className="font-medium">{c.city}</span>
                        <span className="ml-[6px] text-[12px] text-[#8F8F8F]">{c.country}</span>
                      </td>
                      <td className="px-[14px] py-[10px] font-mono text-[12px] text-[#8F8F8F]">{c.tz}</td>
                      <td className="px-[14px] py-[10px] font-mono text-[16px] text-[#136CE9]">
                        {t ? t.time : "—"}
                      </td>
                      <td className="px-[14px] py-[10px] font-mono text-[13px] text-[#242424]">
                        {t ? t.date : "—"}
                      </td>
                      <td className="px-[14px] py-[10px] text-[#242424]">{t ? t.weekday : "—"}</td>
                      <td className="px-[14px] py-[10px] font-mono text-[13px] text-[#8F8F8F]">
                        {t ? t.offset : "—"}
                      </td>
                      <td className="px-[14px] py-[10px] text-right">
                        <button
                          type="button"
                          onClick={() => removeCity(c.id)}
                          className="text-[12px] text-[#B0B0B0] hover:text-[#E5484D]"
                        >
                          移除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ToolCard>

        <ToolCard>
          <ToolLabel>添加城市</ToolLabel>
          {availableExtras.length > 0 ? (
            <div className="mb-[16px]">
              <div className="mb-[6px] text-[13px] text-[#8F8F8F]">常用城市</div>
              <div className="flex flex-wrap gap-[8px]">
                {availableExtras.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => addExtra(c.id)}
                    className="rounded-[6px] border border-[#E5E7EB] px-[10px] py-[4px] text-[13px] text-[#242424] hover:border-[#136CE9] hover:text-[#136CE9]"
                  >
                    + {c.city}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mb-[6px] text-[13px] text-[#8F8F8F]">自定义时区</div>
          <div className="flex flex-wrap items-end gap-[8px]">
            <div>
              <ToolLabel>城市名称</ToolLabel>
              <ToolInput
                value={customName}
                onChange={setCustomName}
                placeholder="例如 京都"
                className="w-[180px]"
              />
            </div>
            <div>
              <ToolLabel>IANA 时区</ToolLabel>
              <ToolInput
                value={customTz}
                onChange={setCustomTz}
                placeholder="例如 Asia/Tokyo"
                className="w-[220px] font-mono"
              />
            </div>
            <ToolButton onClick={addCustom}>添加</ToolButton>
          </div>
          {addErr ? (
            <p className="mt-[8px] text-[13px] text-[#E5484D]">{addErr}</p>
          ) : null}
          <p className="mt-[8px] text-[12px] text-[#B0B0B0]">
            时区需为 IANA 标识（如 Asia/Tokyo、America/Los_Angeles）。时间由浏览器 Intl 引擎按各时区实时计算，含夏令时。
          </p>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

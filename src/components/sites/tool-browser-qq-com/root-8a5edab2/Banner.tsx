import Link from "next/link";
import Image from "next/image";
import { BANNER_PANELS, IMAGES } from "../shared/data";
import { MoreArrowIcon } from "../shared/icons";

// Two featured panels side by side: 最新工具 / 最热工具.
// Live: .banner-container margin 0 30px, flex; each .banner-item-new 555x277, margin 0 15px,
// white bg, radius 10px. Title row margin 20px 20px 13px. Cards 158x200.
export function Banner() {
  return (
    <div className="mx-[30px] my-0 flex">
      {BANNER_PANELS.map((panel) => (
        <Panel key={panel.title} title={panel.title} cards={panel.cards} />
      ))}
    </div>
  );
}

function Panel({
  title,
  cards,
}: {
  title: string;
  cards: { title: string; subtitle: string; href: string; icon: string; alt: string }[];
}) {
  return (
    <div className="mx-[15px] h-[277px] w-[555px] rounded-[10px] bg-white">
      {/* title row */}
      <div className="mx-[20px] my-[20px] mb-[13px] flex items-center justify-between">
        <span className="text-[16px] font-normal text-[#333333]">{title}</span>
        <Link
          href="/"
          className="flex cursor-pointer items-center text-[14px] text-[#333333] no-underline hover:text-[#136CE9]"
        >
          更多工具
          <span className="ml-[4px] flex items-center">
            <Image
              src={IMAGES.moreArrow}
              alt=""
              width={12}
              height={12}
              className="h-[12px] w-[12px]"
              unoptimized
            />
          </span>
        </Link>
      </div>
      {/* cards row */}
      <div className="flex">
        {cards.map((c) => (
          <Link
            key={c.title + c.href}
            href={c.href}
            className="mr-[20px] block h-[200px] w-[158px] no-underline"
          >
            <Image
              src={c.icon}
              alt={c.alt}
              width={100}
              height={100}
              className="mx-auto h-[100px] w-[100px]"
              unoptimized
            />
            <div className="mt-[6px] text-center text-[16px] font-semibold text-[#242424]">
              {c.title}
            </div>
            <div className="mt-[4px] line-clamp-2 px-[6px] text-center text-[12px] leading-[16px] text-[#8F8F8F]">
              {c.subtitle}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

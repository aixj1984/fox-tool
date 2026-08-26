// Footer: centered links + copyright line, matching the navigate site footer.
export function Footer() {
  const links = [
    { text: "关于我们", href: "#" },
    { text: "广告服务", href: "#" },
    { text: "联系我们", href: "#" },
    { text: "网站提交", href: "#" },
    {
      text: "意见反馈",
      href: "mailto:80246338@qq.com?subject=%E7%BD%91%E5%9D%80%E4%B9%8B%E5%AE%B6-%E6%84%8F%E8%A7%81%E5%8F%8D%E9%A6%88",
    },
  ];
  return (
    <footer className="mx-auto w-[1140px] py-[16px] pb-[24px] text-center text-[12px] text-[#666666]">
      <p className="m-0">
        {links.map((l, i) => (
          <span key={l.text}>
            <a
              href={l.href}
              className="text-[#666666] no-underline hover:underline"
            >
              {l.text}
            </a>
            {i < links.length - 1 && (
              <span className="mx-[8px] text-[#cccccc]">|</span>
            )}
          </span>
        ))}
      </p>
      <p className="m-0 mt-[6px]">
        © 2026 网址之家 www.bestsed.com · 广告合作：
        <a
          href="mailto:80246338@qq.com?subject=%E7%BD%91%E5%9D%80%E4%B9%8B%E5%AE%B6-%E5%B9%BF%E5%91%8A%E5%90%88%E4%BD%9C"
          className="text-[#666666] no-underline hover:underline"
        >
          80246338@qq.com
        </a>
      </p>
    </footer>
  );
}

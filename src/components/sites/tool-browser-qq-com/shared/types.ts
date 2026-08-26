// Auto-generated types for tool.browser.qq.com clone
// DO NOT EDIT BY HAND — regenerate via scripts/generate-data.mjs

export interface Category {
  name: string;
  href: string;
}

export interface ToolItem {
  name: string;
  desc: string;
  href: string;
  badge: string;
  badgeColor: string;
  icon: string;
  category: string;
}

export interface BannerCard {
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  alt: string;
}

export interface BannerPanel {
  title: string;
  cards: BannerCard[];
}

export interface SharedImages {
  logo: string;
  searchIcon: string;
  navTop: string;
  navQqgroup: string;
  moreArrow: string;
  footerLogo: string;
  footerQrcode: string;
  shareLink: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  sourceUrl: string;
  category: '国内' | '国外';
  timestamp: number;
  hotness?: number; // 热度分数
  isTranslated?: boolean; // 是否已翻译
  originalTitle?: string; // 原始标题
}

export interface NewsSource {
  name: string;
  url: string;
  category: '国内' | '国外';
}

export interface NewsResponse {
  items: NewsItem[];
  total: number;
  date: string;
}

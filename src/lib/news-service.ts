import Parser from 'rss-parser';
import { NEWS_SOURCES, HOTNESS_WEIGHTS } from './sources';
import { NewsItem } from '@/types/news';

const parser = new Parser({
  timeout: 10000,
});

// 翻译函数（使用 MyMemory API，免费）
async function translateToChinese(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return text;

  try {
    const encodedText = encodeURIComponent(text);
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|zh`
    );
    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
  } catch (error) {
    console.error('翻译失败:', error);
  }

  return text;
}

// 翻译新闻标题
async function translateNewsTitle(item: NewsItem & { hotness: number }): Promise<NewsItem & { hotness: number }> {
  // 只翻译国外新闻，且标题是英文（包含英文字母）
  if (item.category !== '国外') return item;
  if (!/[a-zA-Z]/.test(item.title)) return item;

  const translatedTitle = await translateToChinese(item.title);

  // 如果翻译结果和原文不同，才标记为翻译
  if (translatedTitle !== item.title) {
    return {
      ...item,
      title: `${translatedTitle} (译)`,
      originalTitle: item.title,
      isTranslated: true,
    };
  }

  return item;
}

// 获取单条新闻的热度分数
function calculateHotnessScore(item: NewsItem, now: number): number {
  // 1. 新近度分数 (发布时间越近分数越高)
  const itemTime = item.timestamp;
  const hoursSincePublished = (now - itemTime) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 100 - hoursSincePublished * 5);

  // 2. 来源权威性分数
  const authorityScores: Record<string, number> = {
    'OpenAI Blog': 95,
    'Google AI Blog': 95,
    'NVIDIA Blog': 90,
    'MIT Technology Review': 88,
    'VentureBeat AI': 85,
    'TechCrunch': 80,
    'Wired': 78,
    'The Verge': 75,
    '机器之心': 85,
    '量子位': 85,
    '36氪': 78,
    '虎嗅网': 75,
    '钛媒体': 73,
    'InfoQ': 75,
    '雷锋网': 70,
    '爱范儿': 70,
    '极客公园': 72,
    '智东西': 73,
    '少数派': 68,
    '新智元': 72,
    'CSDN': 65,
    '博客园': 62,
    '开源中国': 70,
    'SegmentFault': 68,
    '掘金': 65,
    '开发者头条': 60,
    '码农网': 58,
  };
  const sourceScore = authorityScores[item.source] || 60;

  // 3. 标题长度分数 (适中的标题长度更有信息量)
  const titleLength = item.title.length;
  const titleScore = titleLength >= 20 && titleLength <= 80 ? 100 :
    titleLength < 20 ? 60 + titleLength : Math.max(60, 100 - (titleLength - 80) * 0.5);

  // 4. 描述长度分数 (有足够描述的新闻更有价值)
  const descLength = item.description.length;
  const descriptionScore = Math.min(100, descLength / 3);

  // 综合评分
  const totalScore =
    recencyScore * HOTNESS_WEIGHTS.recency +
    sourceScore * HOTNESS_WEIGHTS.sourceAuthority +
    titleScore * HOTNESS_WEIGHTS.titleLength +
    descriptionScore * HOTNESS_WEIGHTS.descriptionLength;

  return totalScore;
}

// 获取单条新闻的详情
async function fetchNewsFromSource(source: typeof NEWS_SOURCES[0]): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.url);

    return feed.items.map((item) => ({
      id: item.guid || item.link || Math.random().toString(36).substring(7),
      title: item.title?.trim() || '无标题',
      description: item.contentSnippet?.trim() || item.content?.replace(/<[^>]*>/g, '').substring(0, 300) || '',
      link: item.link || '',
      pubDate: item.pubDate || new Date().toISOString(),
      source: source.name,
      sourceUrl: source.url,
      category: source.category,
      timestamp: item.isoDate ? new Date(item.isoDate).getTime() : Date.now(),
    }));
  } catch (error) {
    console.error(`Error fetching from ${source.name}:`, error);
    return [];
  }
}

// 获取所有新闻并计算热度（只获取国内新闻）
export async function fetchAllNews(): Promise<NewsItem[]> {
  const now = Date.now();

  // 只选择国内新闻源
  const domesticSources = NEWS_SOURCES.filter((source) => source.category === '国内');

  // 并行获取所有源
  const allNewsPromises = domesticSources.map((source) =>
    fetchNewsFromSource(source).then((items) =>
      items.map((item) => ({
        ...item,
        hotness: calculateHotnessScore(item, now),
      }))
    )
  );

  const allNewsArrays = await Promise.all(allNewsPromises);

  // 合并所有新闻
  const allNews = allNewsArrays.flat();

  // 按热度排序
  allNews.sort((a, b) => b.hotness - a.hotness);

  // 翻译国外新闻标题（限制前50条，避免 API 限制）
  const MAX_TRANSLATE = 50;
  let translatedCount = 0;

  for (let i = 0; i < allNews.length && translatedCount < MAX_TRANSLATE; i++) {
    if (allNews[i].category === '国外' && !allNews[i].isTranslated) {
      allNews[i] = await translateNewsTitle(allNews[i]);
      if (allNews[i].isTranslated) {
        translatedCount++;
      }
      // 避免请求过快，添加延迟
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return allNews;
}

// 获取当天的新闻（筛选24小时内的）
export function filterTodayNews(news: NewsItem[]): NewsItem[] {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  return news.filter((item) => item.timestamp > oneDayAgo);
}

// 去重（基于标题相似度）
export function deduplicateNews(news: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const result: NewsItem[] = [];

  for (const item of news) {
    const normalizedTitle = item.title.toLowerCase().replace(/[^\w\s]/g, '').trim();

    if (!seen.has(normalizedTitle) && normalizedTitle.length > 10) {
      seen.add(normalizedTitle);
      result.push(item);
    }
  }

  return result;
}

// 搜索新闻
export function searchNews(news: NewsItem[], query: string): NewsItem[] {
  const lowerQuery = query.toLowerCase();

  return news.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.source.toLowerCase().includes(lowerQuery)
  );
}

// 分类筛选
export function filterByCategory(news: NewsItem[], category: '国内' | '国外' | '全部'): NewsItem[] {
  if (category === '全部') return news;
  return news.filter((item) => item.category === category);
}

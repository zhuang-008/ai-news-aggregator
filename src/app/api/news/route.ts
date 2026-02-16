import { NextResponse } from 'next/server';
import { fetchAllNews, filterTodayNews, deduplicateNews, filterByCategory, searchNews } from '@/lib/news-service';

let cachedNews: { items: any[]; timestamp: number } | null = null;
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2小时缓存

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get('category') as '国内' | '全部') || '国内';
  const search = searchParams.get('search') || '';
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    // 检查缓存
    const now = Date.now();
    if (cachedNews && now - cachedNews.timestamp < CACHE_DURATION) {
      let filteredNews = cachedNews.items;

      // 筛选当天新闻
      filteredNews = filterTodayNews(filteredNews);

      // 分类筛选
      filteredNews = filterByCategory(filteredNews, category);

      // 搜索
      if (search) {
        filteredNews = searchNews(filteredNews, search);
      }

      // 去重
      filteredNews = deduplicateNews(filteredNews);

      // 限制数量
      filteredNews = filteredNews.slice(0, limit);

      return NextResponse.json({
        items: filteredNews,
        total: filteredNews.length,
        date: new Date().toISOString(),
        cached: true, // 翻译自 cached
      });
    }

    // 获取新闻
    const allNews = await fetchAllNews();

    // 更新缓存
    cachedNews = {
      items: allNews,
      timestamp: now,
    };

    let filteredNews = allNews;

    // 筛选当天新闻
    filteredNews = filterTodayNews(filteredNews);

    // 分类筛选
    filteredNews = filterByCategory(filteredNews, category);

    // 搜索
    if (search) {
      filteredNews = searchNews(filteredNews, search);
    }

    // 去重
    filteredNews = deduplicateNews(filteredNews);

    // 限制数量
    filteredNews = filteredNews.slice(0, limit);

    return NextResponse.json({
      items: filteredNews,
      total: filteredNews.length,
      date: new Date().toISOString(),
      cached: false, // 翻译自 cached
    });
  } catch (error) {
    console.error('Error fetching news:', error); // 翻译自 Error fetching news
    return NextResponse.json(
      { error: '获取新闻失败（翻译自 Failed to fetch news）' },
      { status: 500 }
    );
  }
}

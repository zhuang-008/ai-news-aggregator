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

  // 过滤：只保留AI行业动态，过滤纯技术教程
  const filteredNews = filterAINews(allNews);

  // 按热度排序
  filteredNews.sort((a, b) => b.hotness - a.hotness);

  // 翻译国外新闻标题（已禁用以加快加载速度）
  // const MAX_TRANSLATE = 50;
  // let translatedCount = 0;

  // for (let i = 0; i < allNews.length && translatedCount < MAX_TRANSLATE; i++) {
  //   if (allNews[i].category === '国外' && !allNews[i].isTranslated) {
  //     allNews[i] = await translateNewsTitle(allNews[i]);
  //     if (allNews[i].isTranslated) {
  //       translatedCount++;
  //     }
  //     // 避免请求过快，添加延迟
  //     await new Promise((resolve) => setTimeout(resolve, 200));
  //   }
  // }

  return filteredNews;
}

// 获取当天的新闻（筛选24小时内的）
export function filterTodayNews(news: NewsItem[]): NewsItem[] {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  return news.filter((item) => item.timestamp > oneDayAgo);
}

// 去重（基于标题相似度 + 来源）
export function deduplicateNews(news: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const result: NewsItem[] = [];

  for (const item of news) {
    // 标准化标题：转小写、移除特殊字符、空格标准化
    const normalizedTitle = item.title
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 生成唯一 key：标题 + 来源
    const uniqueKey = `${normalizedTitle}-${item.source}`;

    // 标题太短不参与去重
    if (normalizedTitle.length < 6) {
      result.push(item);
      continue;
    }

    if (!seen.has(uniqueKey)) {
      seen.add(uniqueKey);
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

// 过滤规则：移除太技术性的内容，保留AI行业动态和新闻
const AI_RELATED_KEYWORDS = [
  // AI核心领域
  'ai', '人工智能', '大模型', 'llm', 'gpt', 'chatgpt', 'claude', 'gemini',
  '深度学习', '机器学习', '神经网络', '计算机视觉', '自然语言处理', 'nlp',
  '语音识别', '图像生成', '文生图', '文生视频', 'sora', 'stable diffusion',
  // AI公司/产品
  'openai', 'anthropic', '谷歌', 'google', '微软', 'microsoft', '苹果',
  '百度', '阿里', '腾讯', '字节', '华为', '商汤', '旷视', '讯飞',
  // AI应用场景
  '自动驾驶', '智能客服', '智能写作', 'ai写作', 'ai绘画', 'ai编程',
  'ai视频', 'ai音乐', 'ai翻译', 'ai教育', 'ai医疗', 'ai招聘',
  // AI行业动态
  '融资', '投资', '收购', '上市', 'ipo', '估值', '亿美元',
  '发布', '推出', '上线', '开放', '公测', '内测',
  '监管', '法规', '政策', '欧盟', '美国', '中国', '全球',
  '峰会', '论坛', '大会', '发布会在', '正式发布',
];

// 需要过滤的纯技术教程关键词
const TECHNICAL_TUTORIAL_KEYWORDS = [
  // 编程开发教程
  '教程', '入门', '基础', '教学', '指南', '手把手', '学会',
  '从零开始', '一步步', '快速上手', '小白', '初学者',
  // 技术实现细节
  '实现原理', '架构设计', '代码实现', '核心代码', '源码',
  'api调用', '接口调用', 'sdk使用', '集成方法',
  '部署教程', '安装配置', '环境搭建', '依赖安装',
  // 具体技术栈
  'pytorch', 'tensorflow', 'keras', 'transformers', 'huggingface',
  'docker', 'kubernetes', '微服务', '云原生',
  // 问题排查
  '报错', 'bug', '修复', '排查', '调试', '优化性能',
  '常见问题', '坑', '踩坑', '解决方',
];

// 检测标题或描述是否包含AI相关内容
function isAIRelated(item: NewsItem): boolean {
  const text = `${item.title} ${item.description}`.toLowerCase();

  // 检查是否包含AI相关关键词
  const hasAIKeyword = AI_RELATED_KEYWORDS.some(keyword =>
    text.includes(keyword.toLowerCase())
  );

  return hasAIKeyword;
}

// 检测是否为纯技术教程（太技术性，不需要阅读的新闻）
function isTechnicalTutorial(item: NewsItem): boolean {
  const title = item.title.toLowerCase();
  const desc = item.description.toLowerCase();
  const text = `${title} ${desc}`;

  // 检查是否包含技术教程关键词
  const hasTutorialKeyword = TECHNICAL_TUTORIAL_KEYWORDS.some(keyword =>
    title.includes(keyword.toLowerCase())
  );

  // 如果标题很短且包含教程关键词，很可能是教程
  if (title.length < 15 && hasTutorialKeyword) {
    return true;
  }

  // 包含"教程"、"入门"等词，且标题较短
  if (title.length < 30 && /教程|入门|教学|指南/.test(title)) {
    return true;
  }

  // 检测是否大量技术术语（超过3个不同的技术关键词）
  const techTerms = [
    'api', 'sdk', 'docker', 'kubernetes', 'k8s', '微服务', 'restful',
    'orm', '缓存', '队列', '负载均衡', 'nginx', 'redis', 'mysql',
    'mongodb', '前端', '后端', '全栈', 'crud', 'oauth', 'jwt',
  ];
  const techCount = techTerms.filter(term => text.includes(term)).length;
  if (techCount >= 3) {
    return true;
  }

  return false;
}

// 过滤新闻：只保留AI行业动态，过滤纯技术教程
export function filterAINews(news: NewsItem[]): NewsItem[] {
  return news.filter((item) => {
    // 必须是AI相关内容
    if (!isAIRelated(item)) {
      return false;
    }

    // 过滤掉纯技术教程
    if (isTechnicalTutorial(item)) {
      return false;
    }

    return true;
  });
}

// 分类筛选
export function filterByCategory(news: NewsItem[], category: '国内' | '国外' | '全部'): NewsItem[] {
  if (category === '全部') return news;
  return news.filter((item) => item.category === category);
}

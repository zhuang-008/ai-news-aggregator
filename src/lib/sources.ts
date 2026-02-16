import { NewsSource } from '@/types/news';

// AI 新闻订阅源配置
export const NEWS_SOURCES: NewsSource[] = [
  // 国外源
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/',
    category: '国外',
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: '国外',
  },
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
    category: '国外',
  },
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    category: '国外',
  },
  {
    name: 'Google AI Blog',
    url: 'http://googleaiblog.blogspot.com/atom.xml',
    category: '国外',
  },
  {
    name: 'NVIDIA Blog',
    url: 'https://blogs.nvidia.com/blog/category/deep-learning/feed/',
    category: '国外',
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/feed/category/ai/latest/rss',
    category: '国外',
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: '国外',
  },

  // 国内源
  {
    name: '机器之心',
    url: 'https://www.jiqizhixin.com/rss',
    category: '国内',
  },
  {
    name: '量子位',
    url: 'https://www.qbitai.com/feed',
    category: '国内',
  },
  {
    name: '36氪',
    url: 'https://36kr.com/feed/',
    category: '国内',
  },
  {
    name: '虎嗅网',
    url: 'https://www.huxiu.com/rss/0.xml',
    category: '国内',
  },
  {
    name: '钛媒体',
    url: 'https://www.tmtpost.com/rss',
    category: '国内',
  },
  {
    name: '雷锋网',
    url: 'https://www.leiphone.com/feed',
    category: '国内',
  },
  {
    name: 'InfoQ',
    url: 'https://www.infoq.cn/rss',
    category: '国内',
  },
  {
    name: '爱范儿',
    url: 'https://www.ifanr.com/feed',
    category: '国内',
  },
  {
    name: '极客公园',
    url: 'https://www.geekpark.net/rss',
    category: '国内',
  },
  {
    name: '智东西',
    url: 'https://zhidx.com/rss',
    category: '国内',
  },
  {
    name: '少数派',
    url: 'https://sspai.com/feed',
    category: '国内',
  },
  {
    name: '新智元',
    url: 'https://xinzhiyuan.io/rss',
    category: '国内',
  },
  {
    name: 'CSDN',
    url: 'https://blog.csdn.net/rss/list',
    category: '国内',
  },
  {
    name: '博客园',
    url: 'https://www.cnblogs.com/rss',
    category: '国内',
  },
  {
    name: '开源中国',
    url: 'https://www.oschina.net/news/rss',
    category: '国内',
  },
  {
    name: 'SegmentFault',
    url: 'https://segmentfault.com/rss',
    category: '国内',
  },
  {
    name: '掘金',
    url: 'https://juejin.cn/rss',
    category: '国内',
  },
  {
    name: '开发者头条',
    url: 'https://toutiao.io/rss',
    category: '国内',
  },
  {
    name: '码农网',
    url: 'https://www.manongw.com/rss',
    category: '国内',
  },
];

// 热度权重配置
export const HOTNESS_WEIGHTS = {
  recency: 0.4, // 新近度权重
  sourceAuthority: 0.3, // 来源权威性权重
  titleLength: 0.1, // 标题长度权重
  descriptionLength: 0.2, // 描述长度权重
};

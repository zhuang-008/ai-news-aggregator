import { NewsSource } from '@/types/news';

// AI 新闻订阅源配置
export const NEWS_SOURCES: NewsSource[] = [
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
    name: '爱范儿',
    url: 'https://www.ifanr.com/feed',
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
    name: '掘金',
    url: 'https://juejin.cn/rss',
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

'use client';

import { NewsItem } from '@/types/news';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface NewsCardProps {
  news: NewsItem;
  index: number;
}

export default function NewsCard({ news, index }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(news.timestamp), {
    locale: zhCN,
    addSuffix: true,
  });

  return (
    <div className="news-card">
      <div className="news-rank">{index + 1}</div>
      <div className="news-content">
        <div className="news-header">
          <span className={`news-source ${news.category}`}>{news.source}</span>
          <span className="news-time">{timeAgo}</span>
        </div>
        <a
          href={news.link}
          target="_blank"
          rel="noopener noreferrer"
          className="news-title"
        >
          {news.title}
        </a>
        {news.description && (
          <p className="news-description">{news.description.substring(0, 150)}...</p>
        )}
        <div className="news-footer">
          <span className="news-hotness">
            热度: {Math.round(news.hotness || 0)}
          </span>
          <span className={`news-category-tag ${news.category}`}>
            {news.category}
          </span>
        </div>
      </div>
    </div>
  );
}

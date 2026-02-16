'use client';

import { useState, useEffect, useCallback } from 'react';
import { NewsItem } from '@/types/news';
import { NewsCard, SearchBar, CategoryFilter } from '@/components';

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<'国内' | '全部'>('国内');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== '全部') params.set('category', category);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '100');

      const response = await fetch(`/api/news?${params.toString()}`);
      const data = await response.json();

      if (data.items) {
        setNews(data.items);
        if (data.date) {
          setLastUpdate(new Date(data.date).toLocaleString('zh-CN'));
        }
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSearch = () => {
    fetchNews();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header">
        <h1>AI 新闻聚合</h1>
        <p>聚合国内最热门的 AI 资讯，每日更新</p>
      </header>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        loading={loading}
      />

      {/* Refresh Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <button
          onClick={() => {
            // 添加随机参数强制刷新
            const params = new URLSearchParams();
            params.set('category', category);
            if (searchQuery) params.set('search', searchQuery);
            params.set('limit', '100');
            params.set('refresh', 'true');

            setLoading(true);
            fetch(`/api/news?${params.toString()}`)
              .then(res => res.json())
              .then(data => {
                if (data.items) {
                  setNews(data.items);
                  setLastUpdate(new Date().toLocaleString('zh-CN'));
                }
              })
              .catch(err => console.error('Error:', err))
              .finally(() => setLoading(false));
          }}
          disabled={loading}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: loading ? '#94a3b8' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {loading ? '刷新中...' : '刷新新闻'}
        </button>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        activeCategory={category}
        onChange={(cat) => {
          setCategory(cat);
          setSearchQuery('');
        }}
      />

      {/* Stats */}
      {!loading && news.length > 0 && (
        <div className="stats-bar">
          显示 {news.length} 条热门新闻
        </div>
      )}

      {/* News List */}
      <div className="news-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>正在加载新闻...</p>
          </div>
        ) : news.length > 0 ? (
          news.map((item, index) => (
            <NewsCard key={item.id || index} news={item} index={index} />
          ))
        ) : (
          <div className="empty-container">
            <h3>暂无新闻</h3>
            <p>请尝试调整搜索条件或刷新页面</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.875rem' }}>
        <p>数据来源: 机器之心, 量子位, 36氪, 虎嗅网, 钛媒体, 雷锋网, InfoQ, 爱范儿, 极客公园, 智东西, 少数派, 新智元, CSDN, 博客园, 开源中国, SegmentFault, 掘金, 开发者头条</p>
        <p style={{ marginTop: '0.5rem' }}>每 2 小时自动更新</p>
        {lastUpdate && (
          <p style={{ marginTop: '0.25rem', opacity: 0.7 }}>
            最后更新: {lastUpdate}
          </p>
        )}
      </footer>
    </div>
  );
}

# AI 新闻聚合

聚合国内最热门 AI 资讯的新闻聚合网站。

## 在线访问

**生产环境：** https://ai-news-aggregator-jt49dwomx-wss008-8373s-projects.vercel.app

## 功能特性

- 聚合 20+ 个国内科技/AI 新闻源
- 自动获取并按热度排序
- 支持搜索和分类筛选
- 手动刷新新闻
- 响应式设计，支持手机和电脑

## 新闻源

### 科技媒体
- 机器之心、量子位、36氪、虎嗅网、钛媒体
- 雷锋网、InfoQ、爱范儿、极客公园、智东西
- 少数派、新智元

### 开发者社区
- CSDN、博客园、开源中国、SegmentFault
- 掘金、开发者头条、码农网

## 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

## 部署

### 自动部署 (Vercel)

推送到 GitHub 后，Vercel 会自动部署：

```bash
git add -A
git commit -m "描述"
git push
```

### 本地备份仓库

```bash
git push backup main
```

## 项目结构

```
ai-news-aggregator/
├── src/
│   ├── app/
│   │   ├── api/news/route.ts  # 新闻 API
│   │   ├── page.tsx           # 主页面
│   │   └── ...
│   ├── components/             # React 组件
│   ├── lib/
│   │   ├── news-service.ts    # 新闻获取服务
│   │   └── sources.ts         # 新闻源配置
│   └── types/
│       └── news.ts            # 类型定义
├── vercel.json                # Vercel 配置
└── package.json
```

## 技术栈

- **前端框架:** Next.js 16 + React
- **样式:** CSS Modules / Tailwind
- **RSS 解析:** rss-parser
- **部署:** Vercel

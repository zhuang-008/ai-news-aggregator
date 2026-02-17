const Parser = require('rss-parser');

const sources = [
  { name: '机器之心', url: 'https://www.jiqizhixin.com/rss', category: '国内' },
  { name: '量子位', url: 'https://www.qbitai.com/feed', category: '国内' },
  { name: '36氪', url: 'https://36kr.com/feed/', category: '国内' },
  { name: '虎嗅网', url: 'https://www.huxiu.com/rss/0.xml', category: '国内' },
  { name: '钛媒体', url: 'https://www.tmtpost.com/rss', category: '国内' },
  { name: '雷锋网', url: 'https://www.leiphone.com/feed', category: '国内' },
  { name: 'InfoQ', url: 'https://www.infoq.cn/rss', category: '国内' },
  { name: '爱范儿', url: 'https://www.ifanr.com/feed', category: '国内' },
  { name: '极客公园', url: 'https://www.geekpark.net/rss', category: '国内' },
  { name: '智东西', url: 'https://zhidx.com/rss', category: '国内' },
  { name: '少数派', url: 'https://sspai.com/feed', category: '国内' },
  { name: '新智元', url: 'https://xinzhiyuan.io/rss', category: '国内' },
  { name: 'CSDN', url: 'https://blog.csdn.net/rss/list', category: '国内' },
  { name: '博客园', url: 'https://www.cnblogs.com/rss', category: '国内' },
  { name: '开源中国', url: 'https://www.oschina.net/news/rss', category: '国内' },
  { name: 'SegmentFault', url: 'https://segmentfault.com/rss', category: '国内' },
  { name: '掘金', url: 'https://juejin.cn/rss', category: '国内' },
  { name: '开发者头条', url: 'https://toutiao.io/rss', category: '国内' },
  { name: '码农网', url: 'https://www.manongw.com/rss', category: '国内' },
];

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

async function testSource(source) {
  return new Promise((resolve) => {
    const start = Date.now();
    parser.parseURL(source.url)
      .then(feed => {
        const time = Date.now() - start;
        resolve({
          name: source.name,
          url: source.url,
          category: source.category,
          status: 'OK',
          items: feed.items?.length || 0,
          time
        });
      })
      .catch(err => {
        const time = Date.now() - start;
        let errorMsg = err.message;
        if (err.code === 'ENOTFOUND') errorMsg = '域名不存在';
        else if (err.response?.status === 404) errorMsg = '404 Not Found';
        else if (err.statusCode === 404) errorMsg = '404 Not Found';
        else if (err.message.includes('Invalid character')) errorMsg = 'XML解析错误';
        else if (err.message.includes('timeout')) errorMsg = '请求超时';

        resolve({
          name: source.name,
          url: source.url,
          category: source.category,
          status: 'ERROR',
          error: errorMsg,
          time
        });
      });
  });
}

async function main() {
  console.log('开始测试国内 RSS 源...\n');

  const results = [];
  for (const source of sources) {
    process.stdout.write(`测试 ${source.name}... `);
    const result = await testSource(source);
    results.push(result);

    if (result.status === 'OK') {
      console.log(`✓ OK (${result.items} 条, ${result.time}ms)`);
    } else {
      console.log(`✗ ${result.error}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('测试结果汇总:');
  console.log('='.repeat(60));

  const okSources = results.filter(r => r.status === 'OK');
  const errorSources = results.filter(r => r.status === 'ERROR');

  console.log(`\n可用源 (${okSources.length}):`);
  okSources.forEach(s => {
    console.log(`  [国内] ${s.name} (${s.items} 条)`);
  });

  console.log(`\n不可用源 (${errorSources.length}):`);
  errorSources.forEach(s => {
    console.log(`  [国内] ${s.name} - ${s.error}`);
  });

  console.log('\n可用的源 JSON:');
  console.log(JSON.stringify(okSources.map(s => ({
    name: s.name,
    url: s.url,
    category: s.category
  })), null, 2));
}

main();

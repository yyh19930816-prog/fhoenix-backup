#!/usr/bin/env node

/**
 * 记忆索引更新脚本（第二阶段增强版）
 * 扫描所有记忆文件，更新索引、统计信息、关键词、关联与优先级
 */

const fs = require('fs');
const path = require('path');

const workspacePath = process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME, '.openclaw/workspace');
const memoryBasePath = path.join(workspacePath, 'memory');

console.log('📊 开始更新记忆索引...');

if (!fs.existsSync(memoryBasePath)) {
  console.error('❌ 记忆目录不存在，请先运行初始化脚本');
  process.exit(1);
}

const indexPath = path.join(memoryBasePath, 'memory_index.json');
let index;
try {
  index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
} catch (error) {
  index = {
    lastUpdated: new Date().toISOString(),
    totalMemories: 0,
    categories: {},
    stats: { daily: 0, topics: 0, people: 0, decisions: 0, knowledge: 0 },
    recentMemories: [],
    searchTerms: {},
    links: [],
    priorityMemories: []
  };
}

const categories = {
  daily: { path: path.join(memoryBasePath, 'daily'), pattern: /\.md$/ },
  topics: { path: path.join(memoryBasePath, 'topics'), pattern: /\.md$/ },
  people: { path: path.join(memoryBasePath, 'people'), pattern: /\.md$/ },
  decisions: { path: path.join(memoryBasePath, 'decisions'), pattern: /\.md$/ },
  knowledge: { path: path.join(memoryBasePath, 'knowledge'), pattern: /\.md$/ }
};

const stopwords = new Set(['的','了','和','是','在','我','你','他','她','它','我们','你们','以及','与','并','或','就','也','都','而','把','被','让','要','一个','这个','那个','现在','已经','可以','进行','完成','通过','使用','需要','工作','系统','当前']);

function extractKeywords(content) {
  const zh = content.match(/[\u4e00-\u9fa5A-Za-z0-9\-\.]{2,}/g) || [];
  const freq = {};
  for (const token of zh) {
    const t = token.trim();
    if (t.length < 2 || stopwords.has(t)) continue;
    freq[t] = (freq[t] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([k]) => k);
}

function classifyPriority(category, content) {
  if (category === 'decisions' || category === 'people') return 'high';
  if (/必须|优先|关键|重要|默认|持续推进|恢复|备份/.test(content)) return 'high';
  if (category === 'topics' || /偏好|规则|计划/.test(content)) return 'medium';
  return 'normal';
}

let totalMemories = 0;
const categoryStats = {};
const allFiles = [];
const searchTerms = {};
const links = [];
const priorityMemories = [];

for (const category of Object.keys(categories)) {
  const categoryInfo = categories[category];
  if (!fs.existsSync(categoryInfo.path)) {
    console.log(`  ⚠️ 目录不存在: ${categoryInfo.path}`);
    categoryStats[category] = { count: 0, files: [] };
    continue;
  }

  const files = fs.readdirSync(categoryInfo.path)
    .filter(file => categoryInfo.pattern.test(file))
    .map(file => {
      const filePath = path.join(categoryInfo.path, file);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      const words = content.split(/\s+/).length;
      const keywords = extractKeywords(content);
      const priority = classifyPriority(category, content);
      return {
        category,
        name: file,
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        createdAt: stats.birthtime.toISOString(),
        lines,
        words,
        keywords,
        priority,
        preview: content.split('\n').slice(0, 6).join(' ').slice(0, 120)
      };
    });

  categoryStats[category] = {
    count: files.length,
    files: files.map(f => ({
      name: f.name,
      size: f.size,
      modified: f.modified.toISOString(),
      keywords: f.keywords,
      priority: f.priority
    }))
  };

  for (const f of files) {
    allFiles.push(f);
    for (const kw of f.keywords) {
      searchTerms[kw] = searchTerms[kw] || [];
      searchTerms[kw].push(`${f.category}/${f.name}`);
    }
    if (f.priority === 'high') {
      priorityMemories.push({ file: `${f.category}/${f.name}`, modified: f.modified.toISOString(), keywords: f.keywords.slice(0, 5) });
    }
  }

  totalMemories += files.length;
  console.log(`  📁 ${category}: ${files.length} 个记忆文件`);
}

for (let i = 0; i < allFiles.length; i++) {
  for (let j = i + 1; j < allFiles.length; j++) {
    const a = allFiles[i], b = allFiles[j];
    const overlap = a.keywords.filter(k => b.keywords.includes(k));
    if (overlap.length >= 2) {
      links.push({ from: `${a.category}/${a.name}`, to: `${b.category}/${b.name}`, shared: overlap.slice(0, 5) });
    }
  }
}

allFiles.sort((a, b) => b.modified - a.modified);
const recentMemories = allFiles.slice(0, 10).map(f => ({
  category: f.category,
  name: f.name,
  modified: f.modified.toISOString(),
  size: f.size,
  keywords: f.keywords,
  priority: f.priority
}));

const today = new Date();
const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
let weeklyGrowth = 0;
allFiles.forEach(file => {
  if (new Date(file.modified) > lastWeek) weeklyGrowth++;
});

index.lastUpdated = new Date().toISOString();
index.totalMemories = totalMemories;
index.categories = categoryStats;
index.recentMemories = recentMemories;
index.stats = {
  daily: categoryStats.daily?.count || 0,
  topics: categoryStats.topics?.count || 0,
  people: categoryStats.people?.count || 0,
  decisions: categoryStats.decisions?.count || 0,
  knowledge: categoryStats.knowledge?.count || 0
};
index.analytics = {
  weeklyGrowth,
  avgFileSize: allFiles.reduce((sum, f) => sum + f.size, 0) / (allFiles.length || 1),
  lastUpdated: new Date().toISOString(),
  totalLinks: links.length,
  highPriorityCount: priorityMemories.length
};
index.searchTerms = searchTerms;
index.links = links.slice(0, 100);
index.priorityMemories = priorityMemories.slice(0, 50);

fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
console.log('\n📈 索引更新完成:');
console.log(`  总记忆文件: ${totalMemories}`);
console.log(`  每日记忆: ${categoryStats.daily?.count || 0}`);
console.log(`  主题记忆: ${categoryStats.topics?.count || 0}`);
console.log(`  人物记忆: ${categoryStats.people?.count || 0}`);
console.log(`  重要决策: ${categoryStats.decisions?.count || 0}`);
console.log(`  知识记忆: ${categoryStats.knowledge?.count || 0}`);
console.log(`  本周新增: ${weeklyGrowth}`);
console.log(`  记忆关联: ${links.length}`);
console.log(`  高优先记忆: ${priorityMemories.length}`);

const reportPath = path.join(memoryBasePath, 'logs', `index_report_${today.toISOString().split('T')[0]}.md`);
const logsDir = path.join(memoryBasePath, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const topTerms = Object.entries(searchTerms).sort((a, b) => b[1].length - a[1].length).slice(0, 10);
const reportContent = `# 记忆索引报告 - ${today.toISOString().split('T')[0]}

## 统计概览
- 总记忆文件数: ${totalMemories}
- 本周新增记忆: ${weeklyGrowth}
- 索引更新时间: ${new Date().toISOString()}
- 记忆关联数: ${links.length}
- 高优先记忆数: ${priorityMemories.length}

## 分类统计
${Object.entries(categoryStats).map(([cat, stat]) => `- **${cat}**: ${stat.count} 个文件`).join('\n')}

## 热门关键词
${topTerms.map(([term, refs]) => `- ${term}: ${refs.length}`).join('\n')}

## 最新记忆
${recentMemories.slice(0, 5).map(mem => `- ${mem.category}/${mem.name} [${mem.priority}] (${new Date(mem.modified).toLocaleString()})`).join('\n')}

## 关键关联
${links.slice(0, 5).map(link => `- ${link.from} ↔ ${link.to} | 共享: ${link.shared.join('、')}`).join('\n') || '- 无'}

---
*自动生成于 ${new Date().toISOString()}*
`;

fs.writeFileSync(reportPath, reportContent);
console.log(`\n📄 生成报告: ${reportPath}`);
console.log('\n✅ 记忆索引更新完成！');

#!/usr/bin/env node

/**
 * 记忆搜索脚本
 * 支持关键词搜索和语义搜索
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 工作区路径
const workspacePath = process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME, '.openclaw/workspace');
const memoryBasePath = path.join(workspacePath, 'memory');

// 命令行参数
const args = process.argv.slice(2);
const query = args[0];
const category = args[1] || 'all';
const limit = parseInt(args[2]) || 20;

if (!query) {
  console.log('使用方法: node search-memories.js <搜索词> [类别] [数量]');
  console.log('类别: all, daily, topics, people, decisions, knowledge');
  console.log('示例: node search-memories.js "记忆系统" all 10');
  process.exit(1);
}

console.log(`🔍 搜索记忆: "${query}"`);
console.log(`   类别: ${category}, 数量: ${limit}`);

// 检查目录是否存在
if (!fs.existsSync(memoryBasePath)) {
  console.error('❌ 记忆目录不存在');
  process.exit(1);
}

// 定义搜索目录
const searchCategories = category === 'all' 
  ? ['daily', 'topics', 'people', 'decisions', 'knowledge']
  : [category];

// 执行搜索
const results = [];

searchCategories.forEach(cat => {
  const catPath = path.join(memoryBasePath, cat);
  if (!fs.existsSync(catPath)) {
    return;
  }

  const files = fs.readdirSync(catPath).filter(file => file.endsWith('.md'));
  
  files.forEach(file => {
    const filePath = path.join(catPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // 简单关键词搜索（可扩展为语义搜索）
    const matchingLines = lines
      .map((line, index) => ({ line, index: index + 1 }))
      .filter(item => item.line.toLowerCase().includes(query.toLowerCase()));
    
    if (matchingLines.length > 0) {
      const stats = fs.statSync(filePath);
      
      matchingLines.forEach(match => {
        results.push({
          category: cat,
          file: file,
          path: filePath,
          line: match.index,
          content: match.line.trim(),
          modified: stats.mtime.toISOString(),
          relevance: calculateRelevance(match.line, query)
        });
      });
    }
  });
});

// 按相关性排序
results.sort((a, b) => b.relevance - a.relevance);

// 显示结果
console.log(`\n📋 找到 ${results.length} 个相关记忆:`);

if (results.length === 0) {
  console.log('   未找到相关记忆');
} else {
  const displayResults = results.slice(0, limit);
  
  displayResults.forEach((result, index) => {
    console.log(`\n${index + 1}. [${result.category}/${result.file}:${result.line}]`);
    console.log(`   内容: ${result.content.substring(0, 100)}${result.content.length > 100 ? '...' : ''}`);
    console.log(`   路径: ${result.path}`);
    console.log(`   修改: ${new Date(result.modified).toLocaleString()}`);
    console.log(`   相关性: ${result.relevance.toFixed(2)}`);
  });
  
  if (results.length > limit) {
    console.log(`\n... 还有 ${results.length - limit} 个结果未显示`);
  }
}

// 生成搜索报告
const today = new Date();
const reportPath = path.join(memoryBasePath, 'logs', `search_report_${today.getTime()}.md`);
const logsDir = path.join(memoryBasePath, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const reportContent = `# 记忆搜索报告
- 搜索词: "${query}"
- 类别: ${category}
- 搜索时间: ${new Date().toISOString()}
- 结果数量: ${results.length}

## 搜索结果
${results.slice(0, 10).map((r, i) => `
### ${i + 1}. ${r.category}/${r.file}:${r.line}
**内容:** ${r.content}
**路径:** ${r.path}
**修改时间:** ${r.modified}
**相关性:** ${r.relevance.toFixed(2)}
`).join('\n')}

## 搜索统计
- 搜索目录: ${searchCategories.join(', ')}
- 返回限制: ${limit}
- 总文件数: ${searchCategories.reduce((total, cat) => {
  const catPath = path.join(memoryBasePath, cat);
  return fs.existsSync(catPath) ? total + fs.readdirSync(catPath).filter(f => f.endsWith('.md')).length : total;
}, 0)}

---
*自动生成于 ${new Date().toISOString()}*
`;

fs.writeFileSync(reportPath, reportContent);
console.log(`\n📄 搜索报告已保存: ${reportPath}`);

// 相关性计算函数
function calculateRelevance(text, query) {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  let relevance = 0;
  
  // 完全匹配
  if (textLower === queryLower) relevance += 10;
  
  // 包含所有搜索词
  const queryWords = queryLower.split(/\s+/);
  const matchingWords = queryWords.filter(word => textLower.includes(word));
  relevance += matchingWords.length * 2;
  
  // 搜索词在开头
  if (textLower.startsWith(queryLower)) relevance += 3;
  
  // 长度权重（较短的文本可能更相关）
  relevance += Math.max(0, 10 - text.length / 50);
  
  // 最近修改加分
  // 这部分可以在实际实现中添加
  
  return relevance;
}

console.log('\n✅ 搜索完成！');
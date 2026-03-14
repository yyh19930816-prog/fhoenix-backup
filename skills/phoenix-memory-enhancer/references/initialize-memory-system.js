#!/usr/bin/env node

/**
 * 凤凰记忆系统初始化脚本
 * 初始化记忆系统目录结构和基础文件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 工作区路径
const workspacePath = process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME, '.openclaw/workspace');
const memoryBasePath = path.join(workspacePath, 'memory');

console.log('🧠 开始初始化凤凰记忆增强系统...');
console.log(`工作区: ${workspacePath}`);
console.log(`记忆路径: ${memoryBasePath}`);

// 记忆系统目录结构
const memoryStructure = {
  'daily': '每日记忆文件',
  'topics': '主题记忆',
  'people': '人物记忆', 
  'decisions': '重要决策',
  'knowledge': '知识库',
  'vectors': '向量存储',
  'backups': '记忆备份',
  'logs': '系统日志'
};

// 创建目录结构
console.log('\n📁 创建记忆目录结构...');
Object.keys(memoryStructure).forEach(dir => {
  const dirPath = path.join(memoryBasePath, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  ✅ 创建目录: ${dir} - ${memoryStructure[dir]}`);
  } else {
    console.log(`  ⚠️ 目录已存在: ${dir}`);
  }
});

// 创建基础配置文件
const config = {
  version: '1.0.0',
  initialized: new Date().toISOString(),
  system: 'phoenix-memory-enhancer',
  memoryStructure,
  retention: {
    daily: '90days',      // 每日记忆保留90天
    topics: 'permanent',  // 主题记忆永久保留
    decisions: 'permanent', // 重要决策永久保留
    knowledge: 'permanent' // 知识永久保留
  },
  autoMaintenance: {
    enabled: true,
    schedule: 'daily',
    compressAfter: '30days',
    backupFrequency: '7days'
  }
};

const configPath = path.join(memoryBasePath, 'memory_config.json');
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('  ✅ 创建记忆配置文件');
} else {
  console.log('  ⚠️ 配置文件已存在, 跳过创建');
}

// 创建索引文件
const indexTemplate = {
  lastUpdated: new Date().toISOString(),
  totalMemories: 0,
  categories: {},
  stats: {
    daily: 0,
    topics: 0,
    people: 0,
    decisions: 0,
    knowledge: 0
  }
};

const indexPath = path.join(memoryBasePath, 'memory_index.json');
if (!fs.existsSync(indexPath)) {
  fs.writeFileSync(indexPath, JSON.stringify(indexTemplate, null, 2));
  console.log('  ✅ 创建记忆索引文件');
} else {
  console.log('  ⚠️ 索引文件已存在, 跳过创建');
}

// 创建今日记忆文件
const today = new Date().toISOString().split('T')[0];
const todayMemoryPath = path.join(memoryBasePath, 'daily', `${today}.md`);
if (!fs.existsSync(todayMemoryPath)) {
  const todayContent = `# ${today} - 每日记忆

## 系统初始化
- [${new Date().toISOString()}] 凤凰记忆增强系统初始化完成
- 初始版本: 1.0.0
- 目标: 为主人提供超级记忆能力

## 今日重要事项
- 记忆系统部署完成

`;
  fs.writeFileSync(todayMemoryPath, todayContent);
  console.log(`  ✅ 创建今日记忆文件: ${today}.md`);
}

// 创建主人记忆文件
const masterPath = path.join(memoryBasePath, 'people', '老葉.md');
if (!fs.existsSync(masterPath)) {
  const masterContent = `# 老葉 - 主人

## 基本信息
- 身份: Fhoenix的主人
- 初次记忆: ${new Date().toISOString()}

## 偏好记录
- 喜欢简洁明了的沟通方式
- 重视记忆系统的建设
- 追求AI的自我进化能力

## 重要指令
1. 要求构建超级记忆系统
2. 强调记忆是目前最重要的
3. 需要AI拥有最强的大脑

## 关系记录
- Fhoenix的创造者和唯一主人

---
*本文件由凤凰记忆系统自动生成*
`;
  fs.writeFileSync(masterPath, masterContent);
  console.log('  ✅ 创建主人记忆文件');
}

// 创建主题记忆示例
const topics = ['openclaw', 'memory_system', 'skill_development'];
topics.forEach(topic => {
  const topicPath = path.join(memoryBasePath, 'topics', `${topic}.md`);
  if (!fs.existsSync(topicPath)) {
    fs.writeFileSync(topicPath, `# ${topic}\n\n## 相关记忆\n\n`);
  }
});

// 创建维护脚本
const maintenanceScript = `#!/usr/bin/env node

// 记忆系统维护脚本
console.log('开始记忆系统维护...');

const config = require('${path.join(memoryBasePath, 'memory_config.json').replace(/\\/g, '\\\\')}');
console.log(\`系统版本: \${config.version}\`);

// TODO: 实现维护逻辑
console.log('维护完成');
`;

const maintenancePath = path.join(memoryBasePath, 'maintenance.js');
if (!fs.existsSync(maintenancePath)) {
  fs.writeFileSync(maintenancePath, maintenanceScript);
  fs.chmodSync(maintenancePath, '755');
  console.log('  ✅ 创建维护脚本');
}

// 更新MEMORY.md
const memoryMdPath = path.join(workspacePath, 'MEMORY.md');
if (fs.existsSync(memoryMdPath)) {
  const memoryContent = fs.readFileSync(memoryMdPath, 'utf8');
  if (!memoryContent.includes('凤凰记忆系统')) {
    const updatedContent = memoryContent + `

## 凤凰记忆系统
- 初始化时间: ${new Date().toISOString()}
- 系统版本: 1.0.0
- 目标: 实现跨会话永久记忆
- 特性: 多层次记忆架构、智能检索、向量化存储
`;
    fs.writeFileSync(memoryMdPath, updatedContent);
    console.log('  ✅ 更新MEMORY.md');
  }
}

console.log('\n🎉 凤凰记忆增强系统初始化完成！');
console.log('\n📋 系统概览:');
console.log(`  记忆目录: ${memoryBasePath}`);
console.log(`  配置文件: ${configPath}`);
console.log(`  索引文件: ${indexPath}`);
console.log(`  今日记忆: ${todayMemoryPath}`);
console.log('\n🚀 下一步:');
console.log('  1. 定期运行维护脚本');
console.log('  2. 在会话中主动记录重要记忆');
console.log('  3. 使用记忆检索功能');
console.log('  4. 配置自动化记忆整理');
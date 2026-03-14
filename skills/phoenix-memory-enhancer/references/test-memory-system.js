const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspace = '/Users/guohao/.openclaw/workspace';
const memoryDir = path.join(workspace, 'memory');
const required = [
  'daily', 'topics', 'people', 'decisions', 'knowledge', 'vectors', 'backups', 'logs',
  'memory_config.json', 'memory_index.json'
];

console.log('🧪 测试凤凰记忆系统...');
let ok = true;
for (const item of required) {
  const p = path.join(memoryDir, item);
  const exists = fs.existsSync(p);
  console.log(`${exists ? '✅' : '❌'} ${item}`);
  if (!exists) ok = false;
}

try {
  console.log('\n🔄 更新索引...');
  execSync(`node ${path.join(workspace, 'skills/phoenix-memory-enhancer/references/update-memory-index.js')}`, { stdio: 'inherit' });
} catch (e) {
  ok = false;
}

try {
  console.log('\n🔍 搜索测试...');
  const out = execSync(`node ${path.join(workspace, 'skills/phoenix-memory-enhancer/references/search-memories.js')} 飞书`, { encoding: 'utf8' });
  process.stdout.write(out);
} catch (e) {
  ok = false;
}

if (!ok) {
  console.error('\n❌ 记忆系统测试未完全通过');
  process.exit(1);
}
console.log('\n🎉 记忆系统测试通过');

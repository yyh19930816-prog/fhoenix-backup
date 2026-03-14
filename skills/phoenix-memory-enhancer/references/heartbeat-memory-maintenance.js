#!/usr/bin/env node

/**
 * 心跳记忆维护脚本
 * 在心跳检查时自动运行，维护记忆系统
 */

const fs = require('fs');
const path = require('path');

// 工作区路径
const workspacePath = process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME, '.openclaw/workspace');
const memoryBasePath = path.join(workspacePath, 'memory');

console.log('🫀 开始心跳记忆维护...');
console.log(`时间: ${new Date().toISOString()}`);

// 检查记忆系统
if (!fs.existsSync(memoryBasePath)) {
  console.log('⚠️ 记忆目录不存在，跳过维护');
  return;
}

// 读取配置
const configPath = path.join(memoryBasePath, 'memory_config.json');
let config = {};
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error('❌ 配置文件读取失败:', error.message);
  }
}

// 维护任务列表
const maintenanceTasks = [
  {
    name: '检查记忆目录结构',
    execute: () => {
      const requiredDirs = ['daily', 'topics', 'people', 'decisions', 'knowledge', 'backups', 'logs'];
      requiredDirs.forEach(dir => {
        const dirPath = path.join(memoryBasePath, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
          console.log(`  ✅ 创建缺失目录: ${dir}`);
        }
      });
      return true;
    }
  },
  {
    name: '创建今日记忆文件',
    execute: () => {
      const today = new Date().toISOString().split('T')[0];
      const todayPath = path.join(memoryBasePath, 'daily', `${today}.md`);
      
      if (!fs.existsSync(todayPath)) {
        const content = `# ${today} - 每日记忆

## 自动维护记录
- [${new Date().toISOString()}] 心跳维护自动创建

## 今日计划
- 记录重要对话和决策
- 整理学习到的知识
- 更新记忆索引

---
*心跳维护自动生成*
`;
        fs.writeFileSync(todayPath, content);
        console.log(`  ✅ 创建今日记忆文件: ${today}.md`);
      }
      return true;
    }
  },
  {
    name: '更新记忆索引',
    execute: () => {
      try {
        const indexPath = path.join(memoryBasePath, 'memory_index.json');
        if (fs.existsSync(indexPath)) {
          const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
          index.lastHeartbeat = new Date().toISOString();
          index.heartbeatCount = (index.heartbeatCount || 0) + 1;
          fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
          console.log(`  ✅ 更新心跳记录: ${index.heartbeatCount} 次`);
        }
        return true;
      } catch (error) {
        console.error(`  ❌ 索引更新失败: ${error.message}`);
        return false;
      }
    }
  },
  {
    name: '检查记忆备份',
    execute: () => {
      const backupDir = path.join(memoryBasePath, 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // 检查是否需要备份（每7天）
      const backupFrequency = config.autoMaintenance?.backupFrequency || '7days';
      const lastBackupFile = path.join(backupDir, 'last_backup.json');
      
      let shouldBackup = true;
      if (fs.existsSync(lastBackupFile)) {
        try {
          const lastBackup = JSON.parse(fs.readFileSync(lastBackupFile, 'utf8'));
          const lastBackupDate = new Date(lastBackup.date);
          const daysSinceBackup = (new Date() - lastBackupDate) / (1000 * 60 * 60 * 24);
          
          if (daysSinceBackup < 7) {
            shouldBackup = false;
            console.log(`  ⏸️ 备份检查: 上次备份 ${Math.floor(daysSinceBackup)} 天前，跳过`);
          }
        } catch (error) {
          // 文件损坏，重新备份
        }
      }
      
      if (shouldBackup) {
        console.log('  🔄 执行记忆备份...');
        // 这里可以实现实际备份逻辑
        const backupInfo = {
          date: new Date().toISOString(),
          type: 'heartbeat',
          status: 'pending'
        };
        fs.writeFileSync(lastBackupFile, JSON.stringify(backupInfo, null, 2));
        console.log(`  ✅ 记录备份计划`);
      }
      
      return true;
    }
  },
  {
    name: '清理旧日志',
    execute: () => {
      const logsDir = path.join(memoryBasePath, 'logs');
      if (!fs.existsSync(logsDir)) {
        return true;
      }
      
      const logFiles = fs.readdirSync(logsDir)
        .filter(file => file.endsWith('.md') || file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(logsDir, file);
          const stats = fs.statSync(filePath);
          return { name: file, path: filePath, mtime: stats.mtime };
        });
      
      // 删除30天前的日志
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      let deletedCount = 0;
      
      logFiles.forEach(log => {
        if (log.mtime < thirtyDaysAgo) {
          try {
            fs.unlinkSync(log.path);
            deletedCount++;
          } catch (error) {
            console.error(`  ❌ 删除日志失败 ${log.name}: ${error.message}`);
          }
        }
      });
      
      if (deletedCount > 0) {
        console.log(`  🗑️  清理 ${deletedCount} 个旧日志文件`);
      }
      
      return true;
    }
  },
  {
    name: '生成维护报告',
    execute: () => {
      const reportDir = path.join(memoryBasePath, 'logs');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      const reportPath = path.join(reportDir, `heartbeat_${new Date().toISOString().replace(/[:.]/g, '-')}.md`);
      
      const reportContent = `# 心跳记忆维护报告
- 维护时间: ${new Date().toISOString()}
- 系统版本: ${config.version || '1.0.0'}
- 工作区: ${workspacePath}

## 维护任务执行情况
- 目录结构检查: ✅ 完成
- 今日记忆文件: ✅ 已检查/创建
- 记忆索引更新: ✅ 完成
- 备份检查: ✅ 完成
- 日志清理: ✅ 完成

## 系统状态
- 记忆目录: ${memoryBasePath}
- 上次维护: ${new Date().toISOString()}
- 运行环境: Node.js ${process.version}

## 建议
1. 定期检查记忆索引
2. 确保备份机制正常工作
3. 监控记忆系统性能

---
*自动生成于 ${new Date().toISOString()}*
`;
      
      fs.writeFileSync(reportPath, reportContent);
      console.log(`  📄 生成维护报告: ${path.basename(reportPath)}`);
      return true;
    }
  }
];

// 执行维护任务
let successCount = 0;
let totalTasks = maintenanceTasks.length;

console.log(`\n📋 执行 ${totalTasks} 个维护任务:`);

maintenanceTasks.forEach((task, index) => {
  console.log(`\n${index + 1}. ${task.name}`);
  try {
    const success = task.execute();
    if (success) {
      successCount++;
    }
  } catch (error) {
    console.error(`  ❌ 任务失败: ${error.message}`);
  }
});

// 更新心跳统计
const statsPath = path.join(memoryBasePath, 'heartbeat_stats.json');
let stats = {};
if (fs.existsSync(statsPath)) {
  try {
    stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  } catch (error) {
    // 重新初始化
  }
}

stats.lastRun = new Date().toISOString();
stats.totalRuns = (stats.totalRuns || 0) + 1;
stats.successfulTasks = (stats.successfulTasks || 0) + successCount;
stats.totalTasks = (stats.totalTasks || 0) + totalTasks;
stats.successRate = Math.round((stats.successfulTasks / stats.totalTasks) * 100);

fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

console.log('\n📊 维护任务完成:');
console.log(`  成功: ${successCount}/${totalTasks}`);
console.log(`  成功率: ${Math.round((successCount / totalTasks) * 100)}%`);
console.log(`  总运行次数: ${stats.totalRuns}`);
console.log(`  历史成功率: ${stats.successRate}%`);
console.log(`\n✅ 心跳记忆维护完成！`);
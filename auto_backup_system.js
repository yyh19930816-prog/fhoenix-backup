#!/usr/bin/env node

/**
 * 🔄 凤凰智能备份系统 v1.0
 * 24小时自动备份，30天轮换，永不丢失
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SmartBackupSystem {
  constructor() {
    this.backupDir = path.join(__dirname, 'backups');
    this.maxBackups = 30; // 保留30个备份
    this.workspacePath = __dirname;
    
    // 确保备份目录存在
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }
  
  // 生成备份文件名（含日期和重点事件）
  generateBackupName() {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
    
    // 提取当天重点事件
    const highlight = this.extractDailyHighlight();
    
    return `backup_${dateStr}_周${dayOfWeek}_${highlight}.tar.gz`;
  }
  
  // 提取当天重点事件（简化版）
  extractDailyHighlight() {
    try {
      // 读取今天的记忆文件
      const todayFile = path.join(this.workspacePath, 'memory', `${new Date().toISOString().slice(0, 10)}.md`);
      
      if (fs.existsSync(todayFile)) {
        const content = fs.readFileSync(todayFile, 'utf8');
        
        // 提取第一行标题或重要关键词
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        if (lines.length > 0) {
          const firstLine = lines[0].replace(/^#+\s*/, '').trim();
          if (firstLine.length > 5) {
            return this.sanitizeFilename(firstLine.substring(0, 20));
          }
        }
        
        // 如果没有标题，提取高频关键词
        const keywords = this.extractKeywords(content);
        if (keywords.length > 0) {
          return this.sanitizeFilename(keywords.slice(0, 2).join('_'));
        }
      }
    } catch (error) {
      console.warn('提取重点事件失败:', error.message);
    }
    
    // 默认使用系统记忆
    return 'memory_system';
  }
  
  // 提取关键词
  extractKeywords(content) {
    const words = content.split(/\s+/).filter(word => 
      word.length > 1 && 
      !word.match(/^[,#\-\*\d]/) &&
      !word.match(/^(的|了|是|在|有|和|与|或)$/)
    );
    
    const freq = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });
    
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }
  
  // 清理文件名
  sanitizeFilename(name) {
    return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_');
  }
  
  // 执行本地备份
  performLocalBackup() {
    const backupName = this.generateBackupName();
    const backupPath = path.join(this.backupDir, backupName);
    
    console.log(`📦 开始本地备份: ${backupName}`);
    
    try {
      // 创建tar.gz压缩包
      execSync(`tar -czf "${backupPath}" -C "${this.workspacePath}" .`, {
        stdio: 'pipe',
        cwd: this.workspacePath
      });
      
      const stats = fs.statSync(backupPath);
      console.log(`✅ 本地备份完成: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      
      return { success: true, path: backupPath, size: stats.size };
    } catch (error) {
      console.error('❌ 本地备份失败:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  // 推送至GitHub
  pushToGitHub(backupInfo) {
    console.log('🚀 推送备份至GitHub...');
    
    try {
      // 添加文件到git
      execSync('git add .', { stdio: 'pipe', cwd: this.workspacePath });
      
      // 创建提交
      const commitMessage = `🔒 自动备份 ${new Date().toLocaleString('zh-CN')} - ${backupInfo.path.split('_').slice(1, 3).join(' ')}`;
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe', cwd: this.workspacePath });
      
      // 推送到远程
      execSync('git push origin main', { stdio: 'pipe', cwd: this.workspacePath });
      
      console.log('✅ GitHub推送成功');
      return { success: true };
    } catch (error) {
      console.error('❌ GitHub推送失败:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  // 清理旧备份（保留30个）
  cleanupOldBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup_') && file.endsWith('.tar.gz'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          mtime: fs.statSync(path.join(this.backupDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);
      
      if (files.length > this.maxBackups) {
        const toDelete = files.slice(this.maxBackups);
        console.log(`🗑️ 清理 ${toDelete.length} 个旧备份`);
        
        toDelete.forEach(file => {
          fs.unlinkSync(file.path);
          console.log(`   删除: ${file.name}`);
        });
      }
    } catch (error) {
      console.warn('清理旧备份失败:', error.message);
    }
  }
  
  // 完整备份流程
  async performFullBackup() {
    console.log('🔒 开始凤凰智能备份流程');
    console.log('─'.repeat(50));
    
    const startTime = Date.now();
    
    // 1. 执行本地备份
    const localResult = this.performLocalBackup();
    if (!localResult.success) {
      return localResult;
    }
    
    // 2. 推送到GitHub
    const gitResult = this.pushToGitHub(localResult);
    
    // 3. 清理旧备份
    this.cleanupOldBackups();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️ 备份完成，耗时 ${duration} 秒`);
    
    return {
      success: localResult.success && gitResult.success,
      local: localResult,
      git: gitResult,
      duration: duration
    };
  }
  
  // 获取备份统计
  getBackupStats() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup_') && file.endsWith('.tar.gz'));
      
      const totalSize = files.reduce((sum, file) => {
        const stats = fs.statSync(path.join(this.backupDir, file));
       return sum + stats.size;
      }, 0);
      
      return {
        count: files.length,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        remainingSlots: this.maxBackups - files.length
      };
    } catch (error) {
      return { count: 0, totalSizeMB: 0, remainingSlots: this.maxBackups };
    }
  }
}

// 创建cron任务
function setupCronJob() {
  const cronContent = `
# 🕒 凤凰智能备份计划任务
# 每隔24小时执行一次备份

0 2 * * * cd /Users/guohao/.openclaw/workspace && node auto_backup_system.js backup > /tmp/fhoenix_backup.log 2>&1

# 备份状态检查（每小时一次）
0 * * * * cd /Users/guohao/.openclaw/workspace && node auto_backup_system.js stats >> /tmp/fhoenix_backup_stats.log 2>&1
`;
  
  const cronPath = path.join(__dirname, 'backup_cron.txt');
  fs.writeFileSync(cronPath, cronContent);
  
  console.log('📅 Cron任务配置已生成:');
  console.log('   - 每日凌晨2点执行完整备份');
  console.log('   - 每小时检查备份状态');
  console.log(`💡 手动添加到cron: crontab ${cronPath}`);
  
  return cronPath;
}

// 测试函数
async function testBackupSystem() {
  const backupSystem = new SmartBackupSystem();
  
  console.log('🧪 测试智能备份系统...');
  console.log('─'.repeat(50));
  
  // 显示当前状态
  const stats = backupSystem.getBackupStats();
  console.log('📊 当前备份状态:');
  console.log(`   备份数量: ${stats.count}/${backupSystem.maxBackups}`);
  console.log(`   总大小: ${stats.totalSizeMB} MB`);
  console.log(`   剩余槽位: ${stats.remainingSlots}`);
  
  // 生成示例备份名
  const sampleName = backupSystem.generateBackupName();
  console.log(`\n🎯 示例备份名: ${sampleName}`);
  
  // 设置cron
  setupCronJob();
}

// 命令行使用
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'test') {
    console.log('🔒 凤凰智能备份系统 v1.0');
    console.log('用法:');
    console.log('node auto_backup_system.js test          # 测试功能');
    console.log('node auto_backup_system.js backup        # 执行备份');
    console.log('node auto_backup_system.js stats         # 查看状态');
    console.log('');
    
    testBackupSystem();
  } else if (args[0] === 'backup') {
    const backupSystem = new SmartBackupSystem();
    backupSystem.performFullBackup().then(result => {
      if (result.success) {
        console.log('🎉 凤凰备份成功完成！');
      } else {
        console.log('❌ 备份过程中出现错误');
      }
    });
  } else if (args[0] === 'stats') {
    const backupSystem = new SmartBackupSystem();
    const stats = backupSystem.getBackupStats();
    console.log('📊 备份系统状态报告:');
    console.log(`   备份文件数: ${stats.count}`);
    console.log(`   总存储大小: ${stats.totalSizeMB} MB`);
    console.log(`   剩余备份槽位: ${stats.remainingSlots}`);
    console.log(`   轮换策略: 保留最近 ${backupSystem.maxBackups} 个备份`);
  }
}

module.exports = SmartBackupSystem;
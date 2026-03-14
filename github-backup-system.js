const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class GitHubBackupSystem {
    constructor(configPath = path.join(__dirname, 'backup-config.json')) {
        this.configPath = configPath;
        this.config = this.loadConfig();
        this.backupLogPath = path.join(__dirname, 'backup-logs.json');
        this.backupLogs = this.loadBackupLogs();
    }

    // 加载配置
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('加载备份配置失败:', error);
        }

        // 默认配置
        return {
            repository: 'https://github.com/yyh19930816-prog/fhoenix-backup.git',
            branch: 'main',
            backupInterval: 3600000, // 1小时
            maxBackups: 10,
            includePatterns: [
                '/memory/**/*',
                '/skills/**/*',
                '/scripts/**/*',
                '/*.md',
                '/configs/**/*'
            ],
            excludePatterns: [
                '/node_modules/**/*',
                '/.git/**/*',
                '/logs/**/*',
                '/temp/**/*',
                '*.log'
            ],
            encryptSensitive: true,
            compressBackups: true
        };
    }

    // 保存配置
    saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
            return true;
        } catch (error) {
            console.error('保存配置失败:', error);
            return false;
        }
    }

    // 加载备份日志
    loadBackupLogs() {
        try {
            if (fs.existsSync(this.backupLogPath)) {
                const data = fs.readFileSync(this.backupLogPath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('加载备份日志失败:', error);
        }

        return {
            backups: [],
            stats: {
                totalBackups: 0,
                successful: 0,
                failed: 0,
                lastBackup: null
            }
        };
    }

    // 保存备份日志
    saveBackupLogs() {
        try {
            fs.writeFileSync(this.backupLogPath, JSON.stringify(this.backupLogs, null, 2));
            return true;
        } catch (error) {
            console.error('保存备份日志失败:', error);
            return false;
        }
    }

    // 获取文件变更列表
    getChangedFiles() {
        try {
            const result = this.execCommand('git status --porcelain');
            if (!result.success) return [];
            
            return result.stdout
                .split('\n')
                .filter(line => line.trim())
                .map(line => line.substring(3)); // 移除状态标记
        } catch (error) {
            console.error('获取文件变更失败:', error);
            return [];
        }
    }

    // 计算文件哈希
    calculateFileHash(filePath) {
        try {
            const content = fs.readFileSync(filePath);
            return crypto.createHash('sha256').update(content).digest('hex');
        } catch (error) {
            return null;
        }
    }

    // 执行命令
    execCommand(command, options = {}) {
        try {
            const result = require('child_process').execSync(command, {
                encoding: 'utf8',
                cwd: options.cwd || __dirname,
                stdio: options.stdio || 'pipe'
            });
            return { success: true, stdout: result };
        } catch (error) {
            return { 
                success: false, 
                error: error.message,
                stdout: error.stdout?.toString(),
                stderr: error.stderr?.toString()
            };
        }
    }

    // 初始化备份仓库
    async initBackupRepo() {
        console.log('初始化备份仓库...');
        
        // 检查是否已经是git仓库
        const gitStatus = this.execCommand('git status');
        if (gitStatus.success) {
            console.log('已经是git仓库，跳过初始化');
            return { success: true, message: '仓库已存在' };
        }

        // 初始化git
        const initResult = this.execCommand('git init');
        if (!initResult.success) {
            return { success: false, error: 'git初始化失败: ' + initResult.error };
        }

        // 添加远程仓库
        const remoteResult = this.execCommand(`git remote add origin ${this.config.repository}`);
        if (!remoteResult.success) {
            return { success: false, error: '添加远程仓库失败: ' + remoteResult.error };
        }

        return { success: true, message: '备份仓库初始化完成' };
    }

    // 执行备份
    async performBackup() {
        const backupId = Date.now();
        const startTime = new Date();
        
        console.log(`开始备份 #${backupId}...`);
        
        try {
            // 1. 检查是否有变更
            const changedFiles = this.getChangedFiles();
            if (changedFiles.length === 0) {
                console.log('没有检测到文件变更，跳过备份');
                return { 
                    success: true, 
                    skipped: true, 
                    message: '没有文件变更' 
                };
            }

            console.log(`检测到 ${changedFiles.length} 个文件变更:`);
            changedFiles.slice(0, 5).forEach(file => console.log(`  - ${file}`));
            if (changedFiles.length > 5) console.log(`  ... 还有 ${changedFiles.length - 5} 个文件`);

            // 2. 添加文件到git
            const addResult = this.execCommand('git add .');
            if (!addResult.success) {
                throw new Error('添加文件失败: ' + addResult.error);
            }

            // 3. 提交变更
            const commitMessage = `Backup ${startTime.toISOString()} - ${changedFiles.length} files`;
            const commitResult = this.execCommand(`git commit -m "${commitMessage}"`);
            if (!commitResult.success) {
                throw new Error('提交变更失败: ' + commitResult.error);
            }

            // 4. 推送到远程仓库
            const pushResult = this.execCommand(`git push origin ${this.config.branch}`);
            if (!pushResult.success) {
                throw new Error('推送到远程仓库失败: ' + pushResult.error);
            }

            const endTime = new Date();
            const duration = endTime - startTime;

            // 5. 记录备份日志
            const backupRecord = {
                id: backupId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                duration: duration,
                filesChanged: changedFiles.length,
                success: true,
                commitMessage: commitMessage
            };

            this.addBackupRecord(backupRecord);

            console.log(`备份 #${backupId} 完成，耗时 ${duration}ms`);
            
            return {
                success: true,
                backupId,
                filesChanged: changedFiles.length,
                duration,
                message: `成功备份 ${changedFiles.length} 个文件`
            };

        } catch (error) {
            const endTime = new Date();
            const backupRecord = {
                id: backupId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                duration: endTime - startTime,
                filesChanged: 0,
                success: false,
                error: error.message
            };

            this.addBackupRecord(backupRecord);

            console.error(`备份 #${backupId} 失败:`, error.message);
            
            return {
                success: false,
                backupId,
                error: error.message
            };
        }
    }

    // 添加备份记录
    addBackupRecord(record) {
        this.backupLogs.backups.unshift(record);
        
        // 限制备份记录数量
        if (this.backupLogs.backups.length > this.config.maxBackups) {
            this.backupLogs.backups = this.backupLogs.backups.slice(0, this.config.maxBackups);
        }

        // 更新统计信息
        this.backupLogs.stats.totalBackups++;
        if (record.success) {
            this.backupLogs.stats.successful++;
        } else {
            this.backupLogs.stats.failed++;
        }
        this.backupLogs.stats.lastBackup = record.startTime;

        this.saveBackupLogs();
    }

    // 获取备份状态
    getBackupStatus() {
        const changedFiles = this.getChangedFiles();
        const lastBackup = this.backupLogs.backups[0];
        
        return {
            config: {
                repository: this.config.repository,
                interval: this.config.backupInterval,
                maxBackups: this.config.maxBackups
            },
            status: {
                changedFiles: changedFiles.length,
                needsBackup: changedFiles.length > 0,
                lastBackupTime: lastBackup?.startTime || null,
                lastBackupStatus: lastBackup?.success ? 'success' : lastBackup ? 'failed' : 'never'
            },
            stats: this.backupLogs.stats
        };
    }

    // 启动自动备份
    startAutoBackup() {
        console.log('启动自动备份，间隔:', this.config.backupInterval, 'ms');
        
        // 立即执行一次备份
        this.performBackup();
        
        // 设置定时器
        setInterval(() => {
            this.performBackup();
        }, this.config.backupInterval);
        
        return {
            success: true,
            message: `自动备份已启动，间隔 ${this.config.backupInterval}ms`
        };
    }
}

// 测试功能
async function testBackupSystem() {
    console.log('=== 测试GitHub备份系统 ===');
    
    const backup = new GitHubBackupSystem();
    
    console.log('1. 备份状态:', backup.getBackupStatus());
    
    console.log('2. 初始化仓库...');
    const initResult = await backup.initBackupRepo();
    console.log('初始化结果:', initResult);
    
    console.log('3. 执行备份...');
    const backupResult = await backup.performBackup();
    console.log('备份结果:', backupResult);
    
    console.log('4. 最终备份状态:', backup.getBackupStatus());
    
    console.log('=== 测试完成 ===');
}

// 如果直接运行此文件则执行测试
if (require.main === module) {
    testBackupSystem();
}

module.exports = GitHubBackupSystem;
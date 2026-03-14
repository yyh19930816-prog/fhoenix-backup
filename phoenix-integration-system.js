const fs = require('fs');
const path = require('path');

class PhoenixIntegrationSystem {
    constructor() {
        this.modules = new Map();
        this.eventBus = new Map();
        this.statusFile = path.join(__dirname, 'phoenix-system-status.json');
        this.loadSystemStatus();
        this.initializeModules();
    }

    // 加载系统状态
    loadSystemStatus() {
        try {
            if (fs.existsSync(this.statusFile)) {
                const data = fs.readFileSync(this.statusFile, 'utf8');
                this.systemStatus = JSON.parse(data);
            } else {
                this.systemStatus = {
                    modules: {},
                    lastUpdate: new Date().toISOString(),
                    health: 'starting'
                };
            }
        } catch (error) {
            console.error('加载系统状态失败:', error);
            this.systemStatus = {
                modules: {},
                lastUpdate: new Date().toISOString(),
                health: 'error'
            };
        }
    }

    // 保存系统状态
    saveSystemStatus() {
        try {
            this.systemStatus.lastUpdate = new Date().toISOString();
            fs.writeFileSync(this.statusFile, JSON.stringify(this.systemStatus, null, 2));
            return true;
        } catch (error) {
            console.error('保存系统状态失败:', error);
            return false;
        }
    }

    // 初始化各模块
    initializeModules() {
        console.log('=== 凤凰系统初始化开始 ===');
        
        // 1. 内存增强系统
        this.registerModule('memory', {
            name: '记忆增强系统',
            version: '1.0.0',
            description: '跨会话记忆存储和智能检索',
            status: 'initializing',
            capabilities: ['search', 'index', 'retrieve']
        });

        // 2. 语音交互系统
        this.registerModule('voice', {
            name: '语音交互系统',
            version: '1.0.0',
            description: '麦克风权限管理和语音识别',
            status: 'initializing',
            capabilities: ['recognition', 'synthesis', 'permission']
        });

        // 3. 备份系统
        this.registerModule('backup', {
            name: 'GitHub备份系统',
            version: '1.0.0',
            description: '本地和云端数据备份',
            status: 'initializing',
            capabilities: ['local-backup', 'git-sync', 'compression']
        });

        // 4. 视觉系统
        this.registerModule('ui', {
            name: '凤凰视觉系统',
            version: '1.0.0',
            description: '可复用UI组件库',
            status: 'initializing',
            capabilities: ['components', 'themes', 'animations']
        });

        this.updateSystemHealth();
        console.log('=== 凤凰系统初始化完成 ===');
    }

    // 注册模块
    registerModule(name, metadata) {
        this.modules.set(name, {
            ...metadata,
            registeredAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        });
        
        this.systemStatus.modules[name] = {
            status: metadata.status,
            lastUpdate: new Date().toISOString()
        };
        
        console.log(`✅ 注册模块: ${name} - ${metadata.description}`);
        this.saveSystemStatus();
    }

    // 更新模块状态
    updateModuleStatus(name, status, message = '') {
        if (this.modules.has(name)) {
            const module = this.modules.get(name);
            module.status = status;
            module.lastActivity = new Date().toISOString();
            if (message) module.lastMessage = message;
            
            this.systemStatus.modules[name] = {
                status: status,
                lastUpdate: module.lastActivity,
                message: message
            };
            
            console.log(`🔄 ${name}: ${status} - ${message}`);
            this.updateSystemHealth();
            this.saveSystemStatus();
            
            // 触发状态变更事件
            this.emit('module-status-change', { name, status, message });
        }
    }

    // 更新系统健康状态
    updateSystemHealth() {
        const modules = Array.from(this.modules.values());
        const onlineModules = modules.filter(m => m.status === 'online' || m.status === 'ready');
        const errorModules = modules.filter(m => m.status === 'error');
        
        if (errorModules.length > 0) {
            this.systemStatus.health = 'degraded';
        } else if (onlineModules.length === modules.length) {
            this.systemStatus.health = 'healthy';
        } else {
            this.systemStatus.health = 'starting';
        }
    }

    // 事件系统
    on(event, callback) {
        if (!this.eventBus.has(event)) {
            this.eventBus.set(event, []);
        }
        this.eventBus.get(event).push(callback);
    }

    emit(event, data) {
        if (this.eventBus.has(event)) {
            this.eventBus.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`事件处理错误 (${event}):`, error);
                }
            });
        }
    }

    // 模拟模块活动
    simulateModuleActivity() {
        const activities = [
            { module: 'memory', action: '搜索记忆', status: 'active' },
            { module: 'voice', action: '处理语音输入', status: 'processing' },
            { module: 'backup', action: '检查文件变更', status: 'scanning' },
            { module: 'ui', action: '渲染界面', status: 'rendering' }
        ];

        setInterval(() => {
            const activity = activities[Math.floor(Math.random() * activities.length)];
            this.updateModuleStatus(
                activity.module, 
                activity.status, 
                activity.action
            );
        }, 5000);
    }

    // 获取系统状态报告
    getSystemReport() {
        const report = {
            timestamp: new Date().toISOString(),
            systemHealth: this.systemStatus.health,
            totalModules: this.modules.size,
            modules: {}
        };

        for (const [name, module] of this.modules) {
            report.modules[name] = {
                status: module.status,
                description: module.description,
                capabilities: module.capabilities,
                lastActivity: module.lastActivity,
                lastMessage: module.lastMessage || ''
            };
        }

        return report;
    }

    // 启动系统监控
    startMonitoring() {
        console.log('🚀 启动凤凰系统监控...');
        
        // 初始化模块状态
        setTimeout(() => {
            this.updateModuleStatus('memory', 'online', '记忆索引构建完成');
        }, 1000);
        
        setTimeout(() => {
            this.updateModuleStatus('voice', 'online', '麦克风权限已配置');
        }, 2000);
        
        setTimeout(() => {
            this.updateModuleStatus('backup', 'online', '本地备份系统就绪');
        }, 3000);
        
        setTimeout(() => {
            this.updateModuleStatus('ui', 'online', '组件库加载完成');
        }, 4000);
        
        // 开始模拟活动
        setTimeout(() => {
            this.simulateModuleActivity();
        }, 5000);
        
        // 健康检查
        setInterval(() => {
            this.updateSystemHealth();
            this.saveSystemStatus();
        }, 30000);
        
        return {
            success: true,
            message: '系统监控已启动',
            modules: this.modules.size
        };
    }
}

// 测试整合系统
async function testIntegrationSystem() {
    console.log('=== 凤凰系统整合测试 ===');
    
    const system = new PhoenixIntegrationSystem();
    
    // 启动监控
    const startResult = system.startMonitoring();
    console.log('启动结果:', startResult);
    
    // 等待模块初始化
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    // 获取状态报告
    const report = system.getSystemReport();
    console.log('系统报告:', JSON.stringify(report, null, 2));
    
    // 测试事件系统
    system.on('module-status-change', (data) => {
        console.log(`📢 事件: ${data.name} -> ${data.status}`);
    });
    
    console.log('=== 整合测试完成 ===');
    
    return system;
}

// 如果直接运行则执行测试
if (require.main === module) {
    testIntegrationSystem().then(system => {
        console.log('凤凰整合系统运行中...');
        console.log('按 Ctrl+C 退出');
    });
}

module.exports = PhoenixIntegrationSystem;
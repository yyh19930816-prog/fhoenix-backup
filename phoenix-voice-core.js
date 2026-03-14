const fs = require('fs');
const path = require('path');

class VoicePermissionManager {
    constructor() {
        this.permissionFile = path.join(__dirname, 'voice-permissions.json');
        this.permissions = this.loadPermissions();
    }

    // 加载权限配置
    loadPermissions() {
        try {
            if (fs.existsSync(this.permissionFile)) {
                const data = fs.readFileSync(this.permissionFile, 'utf8');
                const saved = JSON.parse(data);
                return {
                    microphoneGranted: saved.microphoneGranted || false,
                    lastPromptTime: saved.lastPromptTime || null,
                    userPreferences: saved.userPreferences || {
                        autoPermit: false,
                        rememberBrowser: false,
                        audioCodec: 'opus'
                    }
                };
            }
        } catch (error) {
            console.error('加载权限配置失败:', error);
        }

        // 默认配置
        return {
            microphoneGranted: false,
            lastPromptTime: null,
            userPreferences: {
                autoPermit: false,
                rememberBrowser: false,
                audioCodec: 'opus'
            }
        };
    }

    // 保存权限配置
    savePermissions() {
        try {
            fs.writeFileSync(this.permissionFile, JSON.stringify(this.permissions, null, 2));
            return true;
        } catch (error) {
            console.error('保存权限配置失败:', error);
            return false;
        }
    }

    // 模拟浏览器支持检查（在Node.js环境）
    checkBrowserSupport() {
        return {
            supported: true,
            details: {
                speechRecognition: '模拟支持',
                speechSynthesis: '模拟支持',
                getUserMedia: '模拟支持'
            },
            recommendation: '在浏览器环境中运行时将进行真实检测'
        };
    }

    // 模拟麦克风权限请求
    async requestMicrophonePermission() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.permissions.microphoneGranted = true;
                this.permissions.lastPromptTime = new Date().toISOString();
                const saved = this.savePermissions();
                
                resolve({
                    success: true,
                    message: '模拟：麦克风权限已授予',
                    saved: saved,
                    timestamp: this.permissions.lastPromptTime
                });
            }, 500);
        });
    }

    // 检查权限状态
    checkPermissionStatus() {
        const browserSupport = this.checkBrowserSupport();
        return {
            microphoneGranted: this.permissions.microphoneGranted,
            browserSupported: browserSupport.supported,
            lastPromptTime: this.permissions.lastPromptTime,
            canUseVoice: this.permissions.microphoneGranted && browserSupport.supported,
            details: browserSupport.details
        };
    }

    // 重置权限
    resetPermissions() {
        this.permissions = {
            microphoneGranted: false,
            lastPromptTime: null,
            userPreferences: this.permissions.userPreferences
        };
        const saved = this.savePermissions();
        return {
            success: saved,
            message: '权限已重置为默认设置'
        };
    }

    // 更新偏好设置
    updatePreferences(newPreferences) {
        this.permissions.userPreferences = {
            ...this.permissions.userPreferences,
            ...newPreferences
        };
        const saved = this.savePermissions();
        return {
            success: saved,
            message: '偏好设置已更新'
        };
    }
}

// 测试功能
async function testVoicePermissions() {
    console.log('=== 测试语音权限管理模块 ===');
    
    const manager = new VoicePermissionManager();
    console.log('1. 初始权限状态:', manager.checkPermissionStatus());
    
    console.log('2. 请求麦克风权限...');
    const permissionResult = await manager.requestMicrophonePermission();
    console.log('权限请求结果:', permissionResult);
    
    console.log('3. 请求后权限状态:', manager.checkPermissionStatus());
    
    console.log('4. 重置权限...');
    const resetResult = manager.resetPermissions();
    console.log('重置结果:', resetResult);
    
    console.log('5. 重置后权限状态:', manager.checkPermissionStatus());
    
    console.log('6. 更新偏好设置...');
    const prefResult = manager.updatePreferences({ autoPermit: true });
    console.log('偏好更新结果:', prefResult);
    
    console.log('7. 最终权限状态:', manager.checkPermissionStatus());
    
    console.log('=== 测试完成 ===');
}

// 如果直接运行此文件则执行测试
if (require.main === module) {
    testVoicePermissions();
}

module.exports = VoicePermissionManager;
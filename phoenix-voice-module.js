const fs = require('fs');
const path = require('path');

class VoicePermissionManager {
    constructor() {
        this.permissionFile = path.join(__dirname, 'voice-permissions.json');
        this.defaultPermissions = {
            browserAllowed: false,
            microphoneGranted: false,
            lastPromptTime: null,
            userPreferences: {
                autoPermit: false,
                rememberBrowser: false,
                audioCodec: 'opus'
            }
        };
        this.loadPermissions();
    }

    // 加载权限配置
    loadPermissions() {
        try {
            if (fs.existsSync(this.permissionFile)) {
                const data = fs.readFileSync(this.permissionFile, 'utf8');
                this.permissions = {...this.defaultPermissions, ...JSON.parse(data)};
            } else {
                this.permissions = {...this.defaultPermissions};
                this.savePermissions();
            }
        } catch (error) {
            console.error('加载权限配置失败:', error);
            this.permissions = {...this.defaultPermissions};
        }
    }

    // 保存权限配置
    savePermissions() {
        try {
            fs.writeFileSync(this.permissionFile, JSON.stringify(this.permissions, null, 2));
            console.log('权限配置已保存');
        } catch (error) {
            console.error('保存权限配置失败:', error);
        }
    }

    // 检查浏览器支持
    checkBrowserSupport() {
        const supportedFeatures = {
            speechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
            speechSynthesis: 'speechSynthesis' in window,
            getUserMedia: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
            audioContext: 'AudioContext' in window || 'webkitAudioContext' in window
        };

        return {
            supported: Object.values(supportedFeatures).some(Boolean),
            details: supportedFeatures,
            recommendation: this.getRecommendation(supportedFeatures)
        };
    }

    // 获取优化建议
    getRecommendation(features) {
        const missing = Object.entries(features)
            .filter(([_, supported]) => !supported)
            .map(([feature]) => feature);
        
        if (missing.length === 0) {
            return '当前浏览器完全支持语音功能';
        }

        const recommendations = {
            speechRecognition: '建议使用Chrome或Edge浏览器以获得最佳语音识别支持',
            speechSynthesis: '语音合成功能缺失，将使用文本替代方案',
            getUserMedia: '无法访问麦克风，需要使用HTTPS协议',
            audioContext: '音频处理功能受限，降级处理'
        };

        return missing.map(feature => recommendations[feature] || `${feature}功能不可用`).join('；');
    }

    // 请求麦克风权限
    async requestMicrophonePermission() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('浏览器不支持麦克风访问');
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            this.permissions.microphoneGranted = true;
            this.permissions.lastPromptTime = new Date().toISOString();
            this.savePermissions();

            console.log('麦克风权限获取成功');
            return {
                success: true,
                stream,
                constraints: stream.getTracks()[0].getConstraints()
            };
        } catch (error) {
            this.permissions.microphoneGranted = false;
            this.savePermissions();
            
            console.error('麦克风权限获取失败:', error);
            return {
                success: false,
                error: this.getPermissionError(error),
                suggestion: this.getPermissionSuggestion(error)
            };
        }
    }

    // 解析权限错误
    getPermissionError(error) {
        const errorMap = {
            'NotAllowedError': '用户拒绝了麦克风权限',
            'NotFoundError': '未找到音频输入设备',
            'NotSupportedError': '不支持音频输入',
            'SecurityError': '安全策略阻止麦克风访问'
        };

        return errorMap[error.name] || `麦克风访问失败: ${error.message}`;
    }

            // 返回成功结果
            this.permissions.microphoneGranted = true;
            this.permissions.lastPromptTime = new Date().toISOString();
            this.savePermissions();

            return {
                success: true,
                stream,
                message: '麦克风权限已授予'
            };
        } catch (error) {
            console.error('请求麦克风权限失败:', error);
            
            this.permissions.microphoneGranted = false;
            this.savePermissions();

            return {
                success: false,
                error: this.getPermissionError(error),
                recommendation: '请在浏览器设置中允许麦克风访问，或使用文本输入方式'
            };
        }
    }

    // 获取权限错误信息
    getPermissionError(error) {
        const errorMap = {
            'NotAllowedError': '用户拒绝了麦克风权限',
            'NotFoundError': '未找到音频输入设备',
            'NotSupportedError': '不支持音频输入',
            'SecurityError': '安全策略阻止麦克风访问'
        };

        return errorMap[error.name] || `麦克风访问失败: ${error.message}`;
    }

    // 检查权限状态
    checkPermissionStatus() {
        return {
            microphoneGranted: this.permissions.microphoneGranted,
            browserSupported: this.checkBrowserSupport().supported,
            lastPromptTime: this.permissions.lastPromptTime,
            canUseVoice: this.permissions.microphoneGranted && this.checkBrowserSupport().supported
        };
    }

    // 重置权限
    resetPermissions() {
        this.permissions = {...this.defaultPermissions};
        this.savePermissions();
        return '权限已重置为默认设置';
    }

    // 更新用户偏好
    updatePreferences(newPreferences) {
        this.permissions.userPreferences = {
            ...this.permissions.userPreferences,
            ...newPreferences
        };
        this.savePermissions();
        return '偏好设置已更新';
    }
}

// 语音识别管理器
class VoiceRecognizer {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.lastResult = '';
        this.supportedLanguages = ['zh-CN', 'en-US', 'ja-JP'];
        this.setupRecognition();
    }

    // 设置语音识别
    setupRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('浏览器不支持语音识别API');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'zh-CN';
        this.recognition.maxAlternatives = 1;

        // 设置事件监听
        this.setupEventListeners();
    }

    // 设置事件监听
    setupEventListeners() {
        if (!this.recognition) return;

        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('语音识别开始');
        };

    // 设置语音识别
    setupRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('浏览器不支持语音识别');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'zh-CN';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        this.setupEventListeners();
    }

    // 设置事件监听器
    setupEventListeners() {
        if (!this.recognition) return;

        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('语音识别已开始');
        };

        this.recognition.onresult = (event) => {
            let transcript = '';
            let isFinal = false;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                isFinal = event.results[i].isFinal;
            }

            this.lastResult = transcript;
            
            if (isFinal && transcript.trim()) {
                console.log('识别结果:', transcript);
                this.onFinalResult?.(transcript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            this.isListening = false;
        };

        this.recognition.onend = () => {
            this.isListening = false;
            console.log('语音识别已结束');
        };
    }

    // 开始监听
    startListening() {
        if (!this.recognition) {
            throw new Error('语音识别未初始化');
        }

        if (this.isListening) {
            this.stopListening();
        }

        try {
            this.recognition.start();
            return { success: true, message: '开始监听语音' };
        } catch (error) {
            console.error('启动语音识别失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 停止监听
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    // 设置识别语言
    setLanguage(lang) {
        if (this.supportedLanguages.includes(lang)) {
            this.recognition.lang = lang;
            return `语言已设置为 ${lang}`;
        } else {
            return `不支持的语言: ${lang}`;
        }
    }
}

// 语音合成管理器
class VoiceSynthesizer {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.loadVoices();
    }

    // 加载可用语音
    loadVoices() {
        this.voices = this.synthesis.getVoices();
        
        // 优先选择中文语音
        const chineseVoice = this.voices.find(voice => 
            voice.lang.startsWith('zh') || voice.lang.includes('Chinese')
        );
        
        this.currentVoice = chineseVoice || this.voices[0];
        
        if (!this.synthesis.onvoiceschanged) {
            this.synthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    // 语音播报
    speak(text, options = {}) {
        if (!this.synthesis) {
            console.warn('浏览器不支持语音合成');
            return { success: false, error: '语音合成不可用' };
        }

        // 停止当前播报
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // 设置语音参数
        utterance.voice = this.currentVoice;
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        return new Promise((resolve) => {
            utterance.onend = () => {
                resolve({ success: true, message: '播报完成' });
            };

            utterance.onerror = (error) => {
                resolve({ success: false, error: error.error });
            };

            this.synthesis.speak(utterance);
        });
    }

    // 获取可用语音列表
    getVoiceList() {
        return this.voices.map(voice => ({
            name: voice.name,
            lang: voice.lang,
            localService: voice.localService
        }));
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        VoicePermissionManager,
        VoiceRecognizer,
        VoiceSynthesizer
    };
}

console.log('凤凰语音模块加载完成');
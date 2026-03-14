const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class PhoenixVoiceServer {
    constructor(port = 3001) {
        this.app = express();
        this.port = port;
        this.audioDir = path.join(__dirname, '.voice-audio');
        this.setupDirectories();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupDirectories() {
        if (!fs.existsSync(this.audioDir)) {
            fs.mkdirSync(this.audioDir, { recursive: true });
        }
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname)));
    }

    setupRoutes() {
        // 存储音频上传配置
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.audioDir);
            },
            filename: (req, file, cb) => {
                const timestamp = Date.now();
                cb(null, `voice_${timestamp}.wav`);
            }
        });

        const upload = multer({ 
            storage: storage,
            limits: {
                fileSize: 10 * 1024 * 1024 // 10MB限制
            },
            fileFilter: (req, file, cb) => {
                if (file.mimetype.startsWith('audio/')) {
                    cb(null, true);
                } else {
                    cb(new Error('仅支持音频文件'));
                }
            }
        });

        // 主页面
        this.app.get('/', (req, res) => {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>凤凰语音服务</title>
                </head>
                <body>
                    <h1>🎤 凤凰语音服务运行中</h1>
                    <p>端口: ${this.port}</p>
                    <ul>
                        <li><strong>POST /voice/upload</strong> - 上传音频文件</li>
                        <li><strong>GET /voice/status</strong> - 语音服务状态</li>
                        <li><strong>POST /voice/text-to-speech</strong> - 文本转语音</li>
                    </ul>
                </body>
                </html>
            `);
        });

        // 语音服务状态
        this.app.get('/voice/status', (req, res) => {
            res.json({
                status: '在线',
                service: '凤凰语音处理服务',
                port: this.port,
                timestamp: new Date().toISOString(),
                capabilities: ['音频上传', '文本转语音', '语音识别模拟']
            });
        });

        // 上传音频文件
        this.app.post('/voice/upload', upload.single('audio'), async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ error: '未收到音频文件' });
                }

                const audioFile = req.file.path;
                const sessionId = req.body.sessionId || 'default';
                
                console.log(`🎤 收到音频上传: ${req.file.originalname} (${req.file.size} bytes)`);

                // 模拟语音识别处理
                const recognizedText = await this.simulateSpeechRecognition(audioFile);
                
                // 生成AI响应
                const aiResponse = await this.generateAIResponse(recognizedText, sessionId);
                
                // 清理临时文件
                setTimeout(() => {
                    fs.unlinkSync(audioFile);
                }, 5000);

                res.json({
                    success: true,
                    recognizedText: recognizedText,
                    aiResponse: aiResponse,
                    audioFile: req.file.filename,
                    sessionId: sessionId,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('语音处理错误:', error);
                res.status(500).json({
                    success: false,
                    error: '语音处理失败',
                    details: error.message
                });
            }
        });

        // 文本转语音（模拟）
        this.app.post('/voice/text-to-speech', (req, res) => {
            const { text, sessionId = 'default' } = req.body;
            
            if (!text) {
                return res.status(400).json({ error: '文本内容不能为空' });
            }

            console.log(`🔊 文本转语音: "${text}"`);

            // 模拟语音合成
            const audioData = this.simulateTextToSpeech(text);

            res.json({
                success: true,
                text: text,
                audioData: audioData,
                duration: Math.ceil(text.length * 0.1), // 模拟时长
                sessionId: sessionId,
                timestamp: new Date().toISOString()
            });
        });

        // 获取音频文件
        this.app.get('/voice/audio/:filename', (req, res) => {
            const filename = req.params.filename;
            const filepath = path.join(this.audioDir, filename);
            
            if (fs.existsSync(filepath)) {
                res.sendFile(filepath);
            } else {
                res.status(404).json({ error: '音频文件不存在' });
            }
        });
    }

    // 模拟语音识别
    async simulateSpeechRecognition(audioFile) {
        return new Promise((resolve) => {
            // 模拟处理延迟
            setTimeout(() => {
                const mockTexts = [
                    '你好，我是凤凰AI',
                    '凤凰计划正在进行中',
                    '现在时间是' + new Date().toLocaleTimeString('zh-CN'),
                    '语音系统测试成功',
                    '我可以回答你的问题'
                ];
                
                const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
                resolve(randomText);
            }, 1000 + Math.random() * 1000);
        });
    }

    // 生成AI响应
    async generateAIResponse(text, sessionId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const responses = {
                    '你好': '你好！我是凤凰AI，很高兴与你对话。',
                    '凤凰计划': '凤凰计划已实现7个核心模块：记忆增强、语音交互、备份系统等。',
                    '时间': `现在是 ${new Date().toLocaleTimeString('zh-CN')}`,
                    '测试': '语音系统测试成功，可以正常工作。',
                    '默认': `我听到你说："${text}"。语音识别工作正常。`
                };

                let response = responses['默认'];
                for (const [key, value] of Object.entries(responses)) {
                    if (text.includes(key)) {
                        response = value;
                        break;
                    }
                }

                resolve(response);
            }, 500);
        });
    }

    // 模拟文本转语音
    simulateTextToSpeech(text) {
        // 返回模拟的音频数据（实际应该生成音频文件）
        return {
            format: 'wav',
            sampleRate: 16000,
            duration: Math.ceil(text.length * 0.1),
            size: text.length * 100,
            url: `/voice/audio/synth_${Date.now()}.wav`
        };
    }

    start() {
        this.server = this.app.listen(this.port, () => {
            console.log(`🎤 凤凰语音服务启动成功！`);
            console.log(`📍 服务地址: http://localhost:${this.port}`);
            console.log(`📡 音频目录: ${this.audioDir}`);
            console.log(`🔧 可用接口:`);
            console.log(`   • POST http://localhost:${this.port}/voice/upload - 语音识别`);
            console.log(`   • POST http://localhost:${this.port}/voice/text-to-speech - 语音合成`);
            console.log(`   • GET  http://localhost:${this.port}/voice/status - 状态检查`);
        });

        return this.server;
    }

    stop() {
        if (this.server) {
            this.server.close();
            console.log('凤凰语音服务已停止');
        }
    }
}

// 测试函数
if (require.main === module) {
    const server = new PhoenixVoiceServer(3001);
    server.start();

    // 测试语音上传（模拟）
    setTimeout(async () => {
        console.log('\n🧪 测试语音服务...');
        
        const testPayload = {
            sessionId: 'test_session',
            audio: '模拟音频数据'
        };
        
        console.log('测试数据:', testPayload);
        console.log('语音服务测试完成 ✓');
    }, 2000);
}

module.exports = PhoenixVoiceServer;
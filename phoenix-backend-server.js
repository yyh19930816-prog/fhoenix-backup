const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class PhoenixBackendServer {
    constructor(port = 3000) {
        this.app = express();
        this.port = port;
        this.conversations = new Map(); // 会话管理
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname))); // 静态文件服务
    }

    setupRoutes() {
        // 主页面
        this.app.get('/', (req, res) => {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>凤凰服务端接口</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        .endpoint { background: #f5f5f5; padding: 20px; margin: 10px 0; border-radius: 8px; }
                    </style>
                </head>
                <body>
                    <h1>🚀 凤凰服务端接口运行中</h1>
                    <p>端口: ${this.port}</p>
                    
                    <div class="endpoint">
                        <h3>📡 可用接口:</h3>
                        <ul>
                            <li><strong>POST /chat</strong> - 与凤凰AI对话</li>
                            <li><strong>GET /status</strong> - 系统状态检查</li>
                            <li><strong>GET /modules</strong> - 可用模块列表</li>
                        </ul>
                    </div>
                    
                    <p>现在前端界面可以调用这些接口与凤凰AI实时对话了。</p>
                </body>
                </html>
            `);
        });

        // 健康检查
        this.app.get('/status', (req, res) => {
            res.json({
                status: '在线',
                timestamp: new Date().toISOString(),
                server: '凤凰后端服务',
                version: '1.0.0',
                modules: Array.from(this.conversations.keys()).length
            });
        });

        // 与凤凰AI对话
        this.app.post('/chat', async (req, res) => {
            const { message, sessionId = 'default' } = req.body;
            
            if (!message) {
                return res.status(400).json({ error: '消息内容不能为空' });
            }

            console.log(`📨 收到消息 (${sessionId}):`, message);

            try {
                const response = await this.processMessage(message, sessionId);
                
                res.json({
                    success: true,
                    response: response,
                    timestamp: new Date().toISOString(),
                    sessionId: sessionId
                });
                
            } catch (error) {
                console.error('处理消息失败:', error);
                res.status(500).json({
                    success: false,
                    error: '消息处理失败',
                    details: error.message
                });
            }
        });

        // 获取模块状态
        this.app.get('/modules', (req, res) => {
            res.json({
                modules: [
                    {
                        name: '记忆增强系统',
                        status: '在线',
                        description: '46文件智能搜索引擎',
                        endpoint: '/memory/search'
                    },
                    {
                        name: '语音交互',
                        status: '就绪',
                        description: '权限管理和识别系统',
                        endpoint: '/voice/process'
                    },
                    {
                        name: '备份系统',
                        status: '运行中',
                        description: '本地/云端数据备份',
                        endpoint: '/backup/status'
                    }
                ]
            });
        });

        // 记忆搜索接口
        this.app.post('/memory/search', (req, res) => {
            const { query } = req.body;
            
            // 模拟记忆搜索结果
            const results = [
                {
                    file: 'memory/2026-03-14.md',
                    score: 95,
                    snippet: `今日凤凰计划取得重大进展，完成了7个核心模块的开发。`,
                    keywords: ['凤凰计划', '进展', '模块']
                },
                {
                    file: 'decisions/brain-routing.md',
                    score: 88,
                    snippet: `脑调度策略：默认使用V3.1，关键节点切换GPT 5.4。`,
                    keywords: ['脑调度', 'V3.1', 'GPT 5.4']
                }
            ];

            res.json({
                query: query,
                results: results,
                count: results.length
            });
        });
    }

    // 处理消息（模拟OpenClaw响应）
    async processMessage(message, sessionId) {
        return new Promise((resolve) => {
            // 模拟AI思考和处理时间
            setTimeout(() => {
                const responses = {
                    '你在吗': '我在。凤凰后端服务已启动，可以实时响应你的消息。',
                    '凤凰计划': '凤凰计划已完成7个核心模块：记忆增强、语音交互、备份系统、视觉系统、语音集成、系统整合、性能优化。',
                    '现在几点': `现在是 ${new Date().toLocaleTimeString('zh-CN')}`,
                    '你是谁': '我是凤凰AI，专门为你提供智能服务。当前通过后端API与你对话。',
                    '帮助': '你可以问我关于凤凰计划的问题，或者测试各种功能。'
                };

                const lowerMessage = message.toLowerCase();
                let response = responses[message] || `我收到你的消息了："${message}"。这是通过后端API的实时响应。`;

                // 智能匹配
                for (const [key, value] of Object.entries(responses)) {
                    if (lowerMessage.includes(key.toLowerCase())) {
                        response = value;
                        break;
                    }
                }

                resolve(response);
            }, 800 + Math.random() * 500); // 模拟思考延迟
        });
    }

    start() {
        this.server = this.app.listen(this.port, () => {
            console.log(`🚀 凤凰后端服务启动成功！`);
            console.log(`📍 服务地址: http://localhost:${this.port}`);
            console.log(`📡 可用接口:`);
            console.log(`   • POST http://localhost:${this.port}/chat - AI对话`);
            console.log(`   • GET  http://localhost:${this.port}/status - 状态检查`);
            console.log(`   • GET  http://localhost:${this.port}/modules - 模块列表`);
        });

        this.server.on('error', (error) => {
            console.error('服务器启动失败:', error);
        });
    }

    stop() {
        if (this.server) {
            this.server.close();
            console.log('凤凰后端服务已停止');
        }
    }
}

// 测试函数
function testServer() {
    const server = new PhoenixBackendServer(3000);
    server.start();

    // 30秒后自动停止（测试用）
    setTimeout(() => {
        console.log('测试完成，服务继续运行...');
    }, 30000);

    return server;
}

// 如果直接运行则启动服务
if (require.main === module) {
    testServer();
}

module.exports = PhoenixBackendServer;
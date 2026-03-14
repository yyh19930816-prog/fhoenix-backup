const WebSocket = require('ws');
const express = require('express');
const http = require('http');

class PhoenixWebSocketServer {
    constructor(port = 3002) {
        this.port = port;
        this.clients = new Map();
        this.setupServer();
    }

    setupServer() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });

        // HTTP路由
        this.app.get('/', (req, res) => {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>凤凰WebSocket服务</title>
                </head>
                <body>
                    <h1>🔗 凤凰WebSocket服务运行中</h1>
                    <p>端口: ${this.port}</p>
                    <p>连接客户端: ${this.clients.size}</p>
                    <p>支持实时音频流传输和双向通信</p>
                </body>
                </html>
            `);
        });

        // WebSocket连接处理
        this.wss.on('connection', (ws, req) => {
            const clientId = this.generateClientId();
            console.log(`🔗 新客户端连接: ${clientId}`);

            this.clients.set(clientId, {
                ws: ws,
                id: clientId,
                connectedAt: new Date(),
                status: 'connected'
            });

            // 发送欢迎消息
            ws.send(JSON.stringify({
                type: 'system',
                message: 'WebSocket连接已建立',
                clientId: clientId,
                timestamp: new Date().toISOString()
            }));

            // 消息处理
            ws.on('message', (data) => {
                this.handleMessage(clientId, data);
            });

            // 连接关闭
            ws.on('close', () => {
                console.log(`🔌 客户端断开: ${clientId}`);
                this.clients.delete(clientId);
            });

            // 错误处理
            ws.on('error', (error) => {
                console.error(`❌ WebSocket错误 (${clientId}):`, error);
                this.clients.delete(clientId);
            });
        });
    }

    generateClientId() {
        return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    handleMessage(clientId, data) {
        try {
            const message = JSON.parse(data);
            const client = this.clients.get(clientId);

            if (!client) return;

            console.log(`📨 收到消息 (${clientId}):`, message.type);

            switch (message.type) {
                case 'audio_chunk':
                    this.handleAudioChunk(clientId, message);
                    break;
                case 'text_message':
                    this.handleTextMessage(clientId, message);
                    break;
                case 'ping':
                    this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
                    break;
                default:
                    console.log('未知消息类型:', message.type);
            }

        } catch (error) {
            console.error('消息处理错误:', error);
        }
    }

    handleAudioChunk(clientId, message) {
        // 模拟语音识别处理
        setTimeout(() => {
            const mockResponses = [
                '我听到你的声音了',
                '语音质量很好',
                'WebSocket连接稳定',
                '实时传输正常工作',
                '你可以继续说'
            ];

            const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
            
            this.sendToClient(clientId, {
                type: 'audio_response',
                text: response,
                confidence: Math.random() * 0.3 + 0.7, // 70-100%置信度
                timestamp: new Date().toISOString()
            });
        }, 300 + Math.random() * 500);
    }

    handleTextMessage(clientId, message) {
        const { text } = message;
        
        // 智能回复
        setTimeout(() => {
            let response = `我收到你的文本消息："${text}"`;
            
            if (text.includes('状态')) {
                response = `系统状态：WebSocket连接正常，${this.clients.size}个客户端在线`;
            } else if (text.includes('时间')) {
                response = `当前时间：${new Date().toLocaleTimeString('zh-CN')}`;
            } else if (text.includes('测试')) {
                response = 'WebSocket通信测试成功，实时双向通信正常';
            }

            this.sendToClient(clientId, {
                type: 'text_response',
                text: response,
                timestamp: new Date().toISOString()
            });
        }, 200);
    }

    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    }

    broadcast(message) {
        this.clients.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify(message));
            }
        });
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`🔗 凤凰WebSocket服务启动成功！`);
            console.log(`📍 服务地址: http://localhost:${this.port}`);
            console.log(`📡 WebSocket端点: ws://localhost:${this.port}`);
            console.log(`👥 支持实时音频流传输`);
        });
    }

    stop() {
        this.server.close();
        console.log('WebSocket服务已停止');
    }
}

// 测试函数
if (require.main === module) {
    const server = new PhoenixWebSocketServer(3002);
    server.start();

    // 模拟系统消息广播
    setInterval(() => {
        server.broadcast({
            type: 'system_update',
            message: '系统运行正常',
            clientCount: server.clients.size,
            timestamp: new Date().toISOString()
        });
    }, 30000);
}

module.exports = PhoenixWebSocketServer;
const WebSocket = require('ws');

const token = 'fhoenix-gateway-2026';
const wsUrl = 'ws://127.0.0.1:18789';

console.log(`Connecting to ${wsUrl}...`);

const ws = new WebSocket(wsUrl, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

ws.on('open', function open() {
  console.log('WebSocket connection opened');
  
  // 发送一个测试消息，格式未知，尝试模仿控制UI
  const testMsg = {
    type: 'ping',
    id: 1
  };
  ws.send(JSON.stringify(testMsg));
});

ws.on('message', function message(data) {
  console.log('Received:', data.toString());
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('WebSocket connection closed');
});
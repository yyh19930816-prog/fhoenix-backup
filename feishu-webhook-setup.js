// 飞书Webhook机器人配置指南

/**
 * 🚀 超简单的飞书通信方案：Webhook机器人
 * 
 * 步骤1: 在飞书群组中创建Webhook机器人
 * - 进入飞书群组
 * - 群设置 → 群机器人 → 添加机器人 → 自定义机器人
 * - 复制Webhook URL
 * 
 * 步骤2: 配置OpenClaw使用Webhook
 * - Webhook URL格式: https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 * 
 * 步骤3: 我通过Webhook发送消息
 * - 无需复杂权限
 * - 立即生效
 * - 稳定可靠
 */

const webhookGuide = `
🔥 **飞书Webhook机器人配置指南** 🔥

### 🎯 优势
- ⚡️ 5分钟完成配置
- 🔒 无需API权限
- 📱 群组内直接通信
- 🚀 立即生效

### 📋 配置步骤

1. **创建Webhook机器人**
   - 打开飞书，进入你的群组
   - 点击群设置 → 群机器人 → 添加机器人
   - 选择"自定义机器人"
   - 复制Webhook URL

2. **配置OpenClaw**
   - Webhook URL格式: 
     https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

3. **测试通信**
   - 我立即通过Webhook发送消息
   - 你在飞书群组中接收

### 🔄 双向通信
- Web界面消息 → Webhook发送到飞书
- 飞书回复 → 我在Web界面回复
- 永不失联的双重保障
`;

console.log(webhookGuide);

// Webhook发送示例代码
const sendWebhookMessage = async (webhookUrl, message) => {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      msg_type: 'text',
      content: {
        text: message
      }
    })
  });
  
  return response.json();
};

module.exports = { sendWebhookMessage };
// 飞书配置验证脚本
const fetch = require('node-fetch');

const appId = 'cli_a92327d7b178dbd7';
const appSecret = 'TaN56mLyhP5xFPZoRcX50cxz1ZEm8xcc';

async function testFeishuConnection() {
    console.log('🔗 测试飞书连接...');
    
    try {
        // 获取访问令牌
        const tokenResponse = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                app_id: appId,
                app_secret: appSecret
            })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.code === 0) {
            console.log('✅ 飞书访问令牌获取成功');
            console.log('🔑 令牌有效期:', tokenData.expire, '秒');
            
            // 测试发送消息
            const messageResponse = await fetch('https://open.feishu.cn/open-apis/im/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenData.tenant_access_token}`
                },
                body: JSON.stringify({
                    receive_id: 'oc_867991', // 你的用户ID
                    msg_type: 'text',
                    content: JSON.stringify({
                        text: '🔥 凤凰系统飞书连接测试成功！时间: ' + new Date().toLocaleString()
                    })
                })
            });
            
            const messageData = await messageResponse.json();
            
            if (messageData.code === 0) {
                console.log('📨 飞书消息发送成功');
                console.log('💬 消息ID:', messageData.data.message_id);
            } else {
                console.log('⚠️ 消息发送失败:', messageData.msg);
            }
            
        } else {
            console.log('❌ 令牌获取失败:', tokenData.msg);
        }
        
    } catch (error) {
        console.log('💥 连接测试失败:', error.message);
    }
}

// 执行测试
testFeishuConnection();
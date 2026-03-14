const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testVoiceUpload() {
    console.log('🧪 测试语音上传识别功能...');
    
    // 创建一个假的音频文件（空的WAV文件头）
    const testAudioPath = path.join(__dirname, 'test-audio.wav');
    
    // 最简单的WAV文件头（44字节）
    const wavHeader = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // "RIFF"
        0x24, 0x00, 0x00, 0x00, // 文件大小
        0x57, 0x41, 0x56, 0x45, // "WAVE"
        0x66, 0x6D, 0x74, 0x20, // "fmt "
        0x10, 0x00, 0x00, 0x00, // PCM格式头大小
        0x01, 0x00,             // 音频格式
        0x01, 0x00,             // 声道数
        0x44, 0xAC, 0x00, 0x00, // 采样率
        0x88, 0x58, 0x01, 0x00, // 字节率
        0x02, 0x00,             // 块对齐
        0x10, 0x00,             // 位深度
        0x64, 0x61, 0x74, 0x61, // "data"
        0x00, 0x00, 0x00, 0x00  // 数据大小
    ]);
    
    fs.writeFileSync(testAudioPath, wavHeader);
    console.log('✅ 创建测试音频文件');
    
    // 使用curl测试上传
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(testAudioPath));
    formData.append('sessionId', 'automated_test_' + Date.now());
    
    try {
        const response = await fetch('http://localhost:3001/voice/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log('📡 上传响应:', data);
        
        if (data.success) {
            console.log('✅ 语音上传测试成功');
            console.log('🎯 识别文本:', data.recognizedText);
            console.log('🤖 AI回复:', data.aiResponse);
        } else {
            console.log('❌ 测试失败:', data.error);
        }
        
    } catch (error) {
        console.error('❌ 测试错误:', error.message);
    }
    
    // 清理测试文件
    fs.unlinkSync(testAudioPath);
    console.log('🧹 清理测试文件');
}

// 使用node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

testVoiceUpload();
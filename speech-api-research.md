# Web Speech API 集成方案

## 技术架构

### 语音识别 (Speech Recognition)
```javascript
// 基础语音识别
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

recognition.onresult = (event) => {
  const transcript = event.results[event.resultIndex][0].transcript;
  console.log('识别结果:', transcript);
};
```

### 语音合成 (Speech Synthesis)
```javascript
// 语音回复
const utterance = new SpeechSynthesisUtterance('你好，我是凤凰智能助手');
utterance.lang = 'zh-CN';
utterance.rate = 1.0;

speechSynthesis.speak(utterance);
```

## Chrome扩展集成方案

### content.js 集成
```javascript
// 在扩展内容脚本中添加语音功能
class PhoenixSpeech {
  constructor() {
    this.recognition = null;
    this.isListening = false;
  }
  
  startListening() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'zh-CN';
      
      this.recognition.start();
      this.isListening = true;
    }
  }
}
```

### popup.js 控制界面
```javascript
// 弹出窗口添加语音控制按钮
document.getElementById('voiceToggle').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleVoice'});
  });
});
```

## 浏览器兼容性
- Chrome: ✅ 完全支持
- Firefox: ⚠️ 部分支持
- Safari: ✅ 支持

## 下一步实现
1. 基础语音识别/合成
2. 自定义语音指令
3. 多语言支持
4. 离线语音包
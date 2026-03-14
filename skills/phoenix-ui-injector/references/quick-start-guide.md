# 🦅 凤凰主题快速启动指南

## 立即应用凤凰主题（30秒搞定）

### 方法1：浏览器控制台注入（推荐）

**步骤**：
1. 在OpenClaw控制UI界面按 `F12` 打开开发者工具
2. 切换到 `Console`（控制台）标签
3. 复制以下代码并粘贴运行：

```javascript
// 凤凰主题注入脚本
(function(){
const s=document.createElement('style');s.textContent=`
:root{--p-p:#FF6B35;--p-s:#1A1A2E;--p-a:#FFD700;--p-t:#F8F9FA;--p-b:#121212}
img[alt="Fhoenix"]{border-radius:50%!important;border:2px solid var(--p-p)!important}
generic:has(img[alt="Fhoenix"]){background:var(--p-s)!important;border-left:4px solid var(--p-p)!important;border-radius:16px 16px 16px 4px!important;margin:8px 0!important;padding:16px!important}
img:not([alt="Fhoenix"]){border-radius:50%!important;border:2px solid var(--p-a)!important}
generic:has(img:not([alt="Fhoenix"])){background:#2D2D2D!important;border-right:4px solid var(--p-a)!important;border-radius:16px 16px 4px 16px!important;margin:8px 0!important;padding:16px!important}
banner[ref="e4"]{background:linear-gradient(135deg,#1A1A2E 0%,#2D2D44 100%)!important;border-bottom:2px solid var(--p-p)!important}
button[cursor="pointer"]{background:#2D2D2D!important;border:1px solid var(--p-s)!important;border-radius:4px!important;transition:all .25s!important}
button[cursor="pointer"]:hover{background:#2D2D44!important;transform:translateY(-1px)!important}
`;document.head.appendChild(s);
console.log('🦅 凤凰主题已激活');
})();
```

4. 按 `Enter` 执行，界面立即变为凤凰主题！

### 方法2：书签栏一键注入

**创建书签**：
1. 在浏览器书签栏新建书签
2. 名称：`凤凰主题`
3. URL：粘贴以下JavaScript代码

```javascript
javascript:(function(){
const s=document.createElement('style');s.textContent=`...（同上代码）...`;
document.head.appendChild(s);
alert('🦅 凤凰主题已激活');
})();
```

**使用**：每次打开控制UI，点击书签即可应用主题

### 方法3：用户样式管理器（永久生效）

1. 安装浏览器扩展：Stylus 或 Tampermonkey
2. 创建新样式，应用以下域名：
   ```
   http://localhost:18789/openclaw/*
   http://127.0.0.1:18789/openclaw/*
   ```
3. 粘贴完整的CSS文件内容（见下文）

## 📁 文件位置

**主题文件**：
- CSS变量定义：`styles/phoenix-variables.css`
- 控制UI样式：`styles/phoenix-control-ui.css`
- 注入脚本：`references/inject-phoenix-theme.js`

**预览文件**（静态设计展示）：
- 设计预览：`skills/phoenix-ui-design/assets/preview.html`
- 在线预览：`http://localhost:3000/preview.html`

## 🎨 主题特色

### 核心视觉元素
- **凤凰橙红** (#FF6B35) - 活力、热情
- **智慧深蓝** (#1A1A2E) - 专业、深度
- **凤凰金** (#FFD700) - 光芒、价值

### 消息气泡设计
- **AI消息**：深蓝背景 + 左侧橙红边框
- **用户消息**：深灰背景 + 右侧金色边框
- **圆角头像**：凤凰徽标样式

### 动效增强
- 消息出场动画（淡入+轻微缩放）
- 按钮悬停效果（上浮+阴影）
- 凤凰呼吸动画（右下角水印）

## 🔧 高级自定义

### 修改配色方案
编辑 `phoenix-variables.css` 中的CSS变量：

```css
:root {
  --phoenix-primary: #你的主色;
  --phoenix-secondary: #你的辅色;
  --phoenix-accent: #你的强调色;
}
```

### 添加自定义元素
在注入脚本中添加：

```javascript
// 添加凤凰徽标
const logo = document.createElement('div');
logo.innerHTML = '🦅 Fhoenix';
logo.style.cssText = 'position:fixed;top:10px;left:10px;font-weight:bold;color:#FF6B35';
document.body.appendChild(logo);
```

## 🚨 故障排除

### 样式未生效？
1. **检查CSS优先级**：确保 `!important` 正确使用
2. **刷新页面**：重新加载页面后应用
3. **清除缓存**：Ctrl+F5 强制刷新

### 元素选择器失效？
1. **检查DOM结构**：按F12查看当前元素选择器
2. **更新选择器**：修改CSS中的 `ref="eXXX"` 为实际值
3. **通用选择器**：使用更通用的选择器备用

### 性能问题？
1. **优化动画**：减少复杂的CSS动画
2. **精简样式**：移除不必要的样式规则
3. **延迟加载**：非关键样式延迟注入

## 📊 主题状态检测

在控制台运行检测脚本：

```javascript
// 检查主题是否生效
const themeActive = document.getElementById('phoenix-theme') !== null;
console.log(`凤凰主题状态：${themeActive ? '✅ 已激活' : '❌ 未激活'}`);

// 检查变量是否设置
const styles = getComputedStyle(document.documentElement);
const primaryColor = styles.getPropertyValue('--phoenix-primary');
console.log(`凤凰主色：${primaryColor || '未设置'}`);
```

## 🔄 更新与维护

### 更新主题
1. 备份当前配置
2. 替换CSS文件
3. 重新注入

### 备份配置
```javascript
// 导出当前主题配置
const themeConfig = {
  colors: {
    primary: getComputedStyle(document.documentElement).getPropertyValue('--phoenix-primary'),
    secondary: getComputedStyle(document.documentElement).getPropertyValue('--phoenix-secondary'),
    accent: getComputedStyle(document.documentElement).getPropertyValue('--phoenix-accent')
  },
  version: '1.0'
};
console.log(JSON.stringify(themeConfig, null, 2));
```

## 📞 技术支持

遇到问题？
- 检查本指南的故障排除部分
- 查看DOM结构是否正确
- 联系开发者（Fhoenix）

---

**凤凰主题 v1.0** - 让你的OpenClaw界面绽放凤凰风采 🦅
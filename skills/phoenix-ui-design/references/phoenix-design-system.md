# 🎨 凤凰设计系统 v1.0

## 设计理念

**浴火重生，智慧绽放** - 凤凰不仅是一种神话生物，更是智慧、重生和卓越的象征。我们的设计系统应该传达：

1. **智慧**（Intelligence）- 清晰、高效的信息传达
2. **热情**（Passion）- 温暖的配色，积极的情绪
3. **可靠**（Reliability）- 稳定的布局，一致的体验
4. **进化**（Evolution）- 动态的过渡，生长的感觉

## 🌈 色彩系统

### 核心色板

```css
/* 主色 - 凤凰橙红 */
--phoenix-primary: #FF6B35;    /* 活力、热情、行动 */
--phoenix-primary-dark: #D45A2C; /* 主色深色态 */
--phoenix-primary-light: #FF8B5C; /* 主色浅色态 */
--phoenix-primary-gradient: linear-gradient(135deg, #FF6B35 0%, #FF8B5C 100%);

/* 辅助色 - 智慧深蓝 */
--phoenix-secondary: #1A1A2E;   /* 智慧、深度、专业 */
--phoenix-secondary-light: #2D2D44; /* 辅助浅色 */
--phoenix-secondary-dark: #0F0F1A; /* 辅助深色 */

/* 强调色 - 凤凰金 */
--phoenix-accent: #FFD700;     /* 光芒、价值、卓越 */
--phoenix-accent-light: #FFE55C;
--phoenix-accent-dark: #D4B800;

/* 中性色 */
--phoenix-text-primary: #F8F9FA;   /* 主要文本 */
--phoenix-text-secondary: #ADB5BD; /* 次要文本 */
--phoenix-text-tertiary: #6C757D;  /* 三级文本 */

--phoenix-bg-primary: #121212;     /* 主背景 */
--phoenix-bg-secondary: #1E1E1E;   /* 次要背景 */
--phoenix-bg-tertiary: #2D2D2D;    /* 三级背景 */

/* 语义色 */
--phoenix-success: #4CAF50;      /* 成功 */
--phoenix-warning: #FF9800;      /* 警告 */
--phoenix-error: #F44336;        /* 错误 */
--phoenix-info: #2196F3;         /* 信息 */
```

### 色彩应用指南

| 场景 | 主要颜色 | 辅助颜色 | 说明 |
|------|----------|----------|------|
| **主界面背景** | `--phoenix-bg-primary` | `--phoenix-bg-secondary` | 深度背景增强沉浸感 |
| **主要按钮** | `--phoenix-primary` | `--phoenix-accent` | 明亮按钮吸引行动 |
| **AI消息** | `--phoenix-secondary` | `--phoenix-primary` | AI消息应显得智慧可靠 |
| **用户消息** | `--phoenix-bg-tertiary` | `--phoenix-text-primary` | 用户消息中性突出 |
| **状态指示** | `--phoenix-accent` | `--phoenix-primary-light` | 状态需要高可见度 |
| **边框/分割** | `#3A3A3A` | `#4A4A4A` | 适度对比，不刺眼 |

### 对比度检查
所有颜色组合满足WCAG AA标准（对比度≥4.5:1）

## 🔤 排版系统

### 字体栈
```css
--phoenix-font-family: 
  -apple-system,      /* 系统优先 */
  BlinkMacSystemFont, 
  'Segoe UI', 
  Roboto, 
  Oxygen, 
  Ubuntu, 
  Cantarell, 
  'Fira Sans', 
  'Droid Sans', 
  'Helvetica Neue', 
  sans-serif;
  
--phoenix-font-mono: 
  'SF Mono', 
  Monaco, 
  'Cascadia Code', 
  'Roboto Mono', 
  'Ubuntu Mono', 
  monospace;
```

### 字号层级
```css
/* 显示文本 */
--phoenix-font-size-display: 3.5rem;    /* 56px - 大标题 */
--phoenix-font-size-heading-1: 2.5rem;  /* 40px - 主标题 */
--phoenix-font-size-heading-2: 2rem;    /* 32px - 副标题 */
--phoenix-font-size-heading-3: 1.75rem; /* 28px - 节标题 */

/* 正文文本 */
--phoenix-font-size-body-xl: 1.25rem;   /* 20px - 大正文 */
--phoenix-font-size-body-lg: 1.125rem;  /* 18px - 正文 */
--phoenix-font-size-body: 1rem;         /* 16px - 标准正文 */
--phoenix-font-size-body-sm: 0.875rem;  /* 14px - 小正文 */

/* 辅助文本 */
--phoenix-font-size-caption: 0.75rem;   /* 12px - 说明文字 */
--phoenix-font-size-label: 0.875rem;    /* 14px - 标签 */
```

### 字重与行高
```css
--phoenix-font-weight-light: 300;
--phoenix-font-weight-regular: 400;
--phoenix-font-weight-medium: 500;
--phoenix-font-weight-semibold: 600;
--phoenix-font-weight-bold: 700;

--phoenix-line-height-tight: 1.2;     /* 标题使用 */
--phoenix-line-height-normal: 1.5;    /* 正文使用 */
--phoenix-line-height-relaxed: 1.75;  /* 长文本使用 */
```

## 📏 间距与布局

### 间距单位（基于8px系统）
```css
--phoenix-space-xs: 0.25rem;   /* 4px */
--phoenix-space-sm: 0.5rem;    /* 8px */
--phoenix-space-md: 1rem;      /* 16px */
--phoenix-space-lg: 1.5rem;    /* 24px */
--phoenix-space-xl: 2rem;      /* 32px */
--phoenix-space-2xl: 3rem;     /* 48px */
--phoenix-space-3xl: 4rem;     /* 64px */
```

### 布局网格
```css
--phoenix-container-sm: 100%;          /* 小屏幕全宽 */
--phoenix-container-md: 768px;         /* 平板宽度 */
--phoenix-container-lg: 1024px;        /* 桌面宽度 */
--phoenix-container-xl: 1280px;        /* 大桌面宽度 */

--phoenix-grid-gap: var(--phoenix-space-md);
--phoenix-grid-columns: 12;
```

## 🎭 图标与图形

### 图标设计原则
1. **简洁清晰** - 最小化细节，最大化可识别性
2. **一致性** - 相同线宽、圆角、风格
3. **隐喻明确** - 图标含义清晰易懂
4. **适当密度** - 不过于密集也不太空洞

### 关键图标
- **凤凰徽标**：抽象凤凰翅膀 + 火焰元素
- **AI状态**：思考（火焰燃烧）、活跃（凤凰飞翔）、闲置（凤凰栖息）
- **消息类型**：AI消息、用户消息、系统消息、错误消息
- **操作图标**：发送、设置、帮助、全屏、录音等

### 图标尺寸
```css
--phoenix-icon-xs: 16px;   /* 小图标 */
--phoenix-icon-sm: 20px;   /* 标准图标 */
--phoenix-icon-md: 24px;   /* 中等图标 */
--phoenix-icon-lg: 32px;   /* 大图标 */
--phoenix-icon-xl: 48px;   /* 超大图标 */
```

## 🌀 动画与过渡

### 动画时长
```css
--phoenix-duration-fast: 150ms;    /* 微交互 */
--phoenix-duration-normal: 250ms;  /* 常规过渡 */
--phoenix-duration-slow: 400ms;    /* 显著动画 */
--phoenix-duration-entrance: 500ms; /* 入口动画 */
```

### 缓动函数
```css
--phoenix-easing-linear: cubic-bezier(0, 0, 1, 1);
--phoenix-easing-ease: cubic-bezier(0.25, 0.1, 0.25, 1);
--phoenix-easing-ease-in: cubic-bezier(0.42, 0, 1, 1);
--phoenix-easing-ease-out: cubic-bezier(0, 0, 0.58, 1);
--phoenix-easing-ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);
--phoenix-easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 关键动画模式
1. **消息进入**：轻微缩放 + 淡入
2. **状态变化**：颜色过渡 + 轻微移动
3. **页面过渡**：横向滑动 + 交叉淡入
4. **加载状态**：脉动效果（凤凰呼吸）
5. **成功反馈**：向上浮动 + 轻微弹跳

## 📱 响应式设计

### 断点定义
```css
/* 移动优先设计 */
--phoenix-breakpoint-xs: 0;
--phoenix-breakpoint-sm: 576px;
--phoenix-breakpoint-md: 768px;    /* 平板 */
--phoenix-breakpoint-lg: 992px;    /* 桌面 */
--phoenix-breakpoint-xl: 1200px;   /* 大桌面 */
--phoenix-breakpoint-xxl: 1400px;
```

### 响应策略
1. **移动端**：单列布局，大触摸目标，简化导航
2. **平板**：双列布局，适度利用空间
3. **桌面**：多列布局，功能全面展开
4. **大桌面**：内容最大宽度，舒适阅读体验

## 🧱 组件设计规范

### 按钮组件
```css
/* 主按钮 */
.phoenix-btn-primary {
  background: var(--phoenix-primary-gradient);
  color: white;
  border-radius: 8px;
  padding: var(--phoenix-space-sm) var(--phoenix-space-lg);
  font-weight: var(--phoenix-font-weight-semibold);
  transition: all var(--phoenix-duration-normal) var(--phoenix-easing-ease);
}

.phoenix-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
}
```

### 输入框
```css
.phoenix-input {
  background: var(--phoenix-bg-secondary);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: var(--phoenix-space-sm) var(--phoenix-space-md);
  color: var(--phoenix-text-primary);
  transition: all var(--phoenix-duration-normal) var(--phoenix-easing-ease);
}

.phoenix-input:focus {
  border-color: var(--phoenix-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  outline: none;
}
```

### 消息气泡
```css
/* AI消息 */
.phoenix-message-ai {
  background: var(--phoenix-secondary);
  color: var(--phoenix-text-primary);
  border-radius: 18px 18px 18px 4px;
  border-left: 4px solid var(--phoenix-primary);
}

/* 用户消息 */
.phoenix-message-user {
  background: var(--phoenix-bg-tertiary);
  color: var(--phoenix-text-primary);
  border-radius: 18px 18px 4px 18px;
  border-right: 4px solid var(--phoenix-accent);
}
```

## 🎨 设计Tokens（开发者友好）

### CSS变量文件
创建 `styles/phoenix-variables.css` 包含所有设计token：
```css
:root {
  /* 颜色变量 */ 
  --phoenix-primary: #FF6B35;
  /* 更多变量... */
}
```

### JSON设计Tokens
```json
{
  "colors": {
    "primary": "#FF6B35",
    "secondary": "#1A1A2E"
  },
  "typography": {
    "fontSizes": {
      "display": "3.5rem"
    }
  }
}
```

## 🔍 设计审计清单

### 视觉一致性检查
- [ ] 颜色使用符合配色规范
- [ ] 间距使用8px倍数
- [ ] 字体层级清晰可辨
- [ ] 图标风格一致

### 可用性检查
- [ ] 对比度满足可访问性要求
- [ ] 触摸目标大小≥44px
- [ ] 焦点状态清晰可见
- [ ] 错误状态明确

### 性能检查
- [ ] 动画不影响交互流畅度
- [ ] 图片已优化压缩
- [ ] CSS文件大小合理
- [ ] 响应式布局无闪烁

## 📄 设计文档更新
- 每次设计变更更新此文档
- 版本号遵循语义化版本控制
- 重大变更需创建迁移指南

---

**版本历史**
- v1.0.0 (2026-03-13) - 初始凤凰设计系统创建

**下一步**：
1. 创建组件库实现
2. 开发设计工具插件
3. 建立设计评审流程
// 凤凰主题注入脚本
// 在OpenClaw控制UI的控制台中运行此脚本

(function() {
    'use strict';
    
    console.log('🦅 注入凤凰主题...');
    
    // 创建样式元素
    const style = document.createElement('style');
    style.id = 'phoenix-theme';
    style.textContent = `
        /* 凤凰主题核心变量 - 内联版本 */
        :root {
            --phoenix-primary: #FF6B35;
            --phoenix-primary-dark: #D45A2C;
            --phoenix-primary-light: #FF8B5C;
            --phoenix-primary-gradient: linear-gradient(135deg, #FF6B35 0%, #FF8B5C 100%);
            
            --phoenix-secondary: #1A1A2E;
            --phoenix-secondary-light: #2D2D44;
            --phoenix-secondary-dark: #0F0F1A;
            --phoenix-secondary-gradient: linear-gradient(135deg, #1A1A2E 0%, #2D2D44 100%);
            
            --phoenix-accent: #FFD700;
            --phoenix-accent-light: #FFE55C;
            --phoenix-accent-dark: #D4B800;
            
            --phoenix-text-primary: #F8F9FA;
            --phoenix-text-secondary: #ADB5BD;
            --phoenix-text-tertiary: #6C757D;
            
            --phoenix-bg-primary: #121212;
            --phoenix-bg-secondary: #1E1E1E;
            --phoenix-bg-tertiary: #2D2D2D;
            
            --phoenix-space-sm: 0.5rem;
            --phoenix-space-md: 1rem;
            --phoenix-space-lg: 1.5rem;
            
            --phoenix-radius-sm: 0.25rem;
            --phoenix-radius-md: 0.5rem;
            --phoenix-radius-lg: 0.75rem;
            --phoenix-radius-full: 9999px;
            
            --phoenix-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
            --phoenix-shadow-primary-sm: 0 1px 3px rgba(255, 107, 53, 0.2);
            
            --phoenix-duration-normal: 250ms;
            --phoenix-easing-ease: cubic-bezier(0.25, 0.1, 0.25, 1);
            --phoenix-easing-ease-out: cubic-bezier(0, 0, 0.58, 1);
            
            --phoenix-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            --phoenix-font-weight-bold: 700;
            
            --phoenix-line-height-normal: 1.5;
        }
        
        /* 凤凰主题核心样式 - 简版 */
        [data-theme="dark"] {
            /* 强制应用凤凰暗色主题 */
            --default-bg-primary: var(--phoenix-bg-primary);
            --default-bg-secondary: var(--phoenix-bg-secondary);
            --default-text-primary: var(--phoenix-text-primary);
            --default-text-secondary: var(--phoenix-text-secondary);
        }
        
        /* 消息气泡 - Fhoenix */
        img[alt="Fhoenix"] {
            border-radius: 50% !important;
            border: 2px solid var(--phoenix-primary) !important;
            box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3) !important;
        }
        
        generic:has(img[alt="Fhoenix"]) {
            background: var(--phoenix-secondary) !important;
            border-left: 4px solid var(--phoenix-primary) !important;
            border-radius: 16px 16px 16px 4px !important;
            margin: var(--phoenix-space-sm) 0 !important;
            padding: var(--phoenix-space-md) !important;
            box-shadow: var(--phoenix-shadow-sm) !important;
        }
        
        /* 消息气泡 - 用户 */
        img:not([alt="Fhoenix"]) {
            border-radius: 50% !important;
            border: 2px solid var(--phoenix-accent) !important;
        }
        
        generic:has(img:not([alt="Fhoenix"])) {
            background: var(--phoenix-bg-tertiary) !important;
            border-right: 4px solid var(--phoenix-accent) !important;
            border-radius: 16px 16px 4px 16px !important;
            margin: var(--phoenix-space-sm) 0 !important;
            padding: var(--phoenix-space-md) !important;
            box-shadow: var(--phoenix-shadow-sm) !important;
        }
        
        /* 导航栏 */
        banner[ref="e4"] {
            background: var(--phoenix-secondary-gradient) !important;
            border-bottom: 2px solid var(--phoenix-primary) !important;
        }
        
        /* 按钮样式 */
        button[cursor="pointer"] {
            background: var(--phoenix-bg-tertiary) !important;
            border: 1px solid var(--phoenix-secondary) !important;
            border-radius: var(--phoenix-radius-sm) !important;
            color: var(--phoenix-text-primary) !important;
            transition: all var(--phoenix-duration-normal) var(--phoenix-easing-ease) !important;
        }
        
        button[cursor="pointer"]:hover {
            background: var(--phoenix-secondary-light) !important;
            transform: translateY(-1px) !important;
            box-shadow: var(--phoenix-shadow-primary-sm) !important;
        }
        
        /* 主题切换按钮 */
        [ref*="color-mode"] {
            background: var(--phoenix-primary-gradient) !important;
            border-color: var(--phoenix-accent) !important;
        }
        
        /* 动画效果 */
        @keyframes phoenix-message-appear {
            from {
                opacity: 0;
                transform: translateY(10px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        generic:has(img[alt="Fhoenix"]),
        generic:has(img:not([alt="Fhoenix"])) {
            animation: phoenix-message-appear 0.3s var(--phoenix-easing-ease-out) !important;
        }
        
        /* 滚动条 */
        ::-webkit-scrollbar {
            width: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: var(--phoenix-bg-secondary);
        }
        
        ::-webkit-scrollbar-thumb {
            background: var(--phoenix-primary);
            border-radius: var(--phoenix-radius-full);
        }
        
        /* 凤凰水印 */
        body::after {
            content: "";
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: var(--phoenix-primary-gradient);
            mask: radial-gradient(circle at center, black 0%, transparent 70%);
            opacity: 0.1;
            pointer-events: none;
            animation: phoenix-flicker 3s ease-in-out infinite alternate;
        }
        
        @keyframes phoenix-flicker {
            0%, 100% { opacity: 0.05; }
            50% { opacity: 0.15; }
        }
    `;
    
    // 注入样式
    document.head.appendChild(style);
    
    console.log('✅ 凤凰主题注入完成！');
    console.log('🎨 配色方案：凤凰橙红(#FF6B35) + 智慧深蓝(#1A1A2E) + 凤凰金(#FFD700)');
    
    // 添加注入成功通知
    setTimeout(() => {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--phoenix-primary-gradient);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = '🦅 凤凰主题已激活';
        
        document.body.appendChild(notification);
        
        // 3秒后自动消失
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }, 500);
    
    // 添加CSS动画
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(animationStyle);
    
})();
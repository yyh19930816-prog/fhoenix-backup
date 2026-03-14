// 凤凰主题内容脚本 - 实时CSS注入

class PhoenixThemeInjector {
  constructor() {
    this.themeEnabled = false;
    this.styleElement = null;
    this.init();
  }

  async init() {
    // 从存储中获取主题状态
    const result = await chrome.storage.sync.get(['phoenixThemeEnabled']);
    this.themeEnabled = result.phoenixThemeEnabled !== false; // 默认为true
    
    if (this.themeEnabled) {
      this.injectTheme();
    }
    
    this.setupObservers();
    this.listenForChanges();
  }

  injectTheme() {
    if (this.styleElement) {
      this.styleElement.remove();
    }

    // 创建样式元素
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'phoenix-theme-style';
    
    // 动态加载CSS文件内容
    const cssUrl = chrome.runtime.getURL('themes/phoenix.css');
    
    fetch(cssUrl)
      .then(response => response.text())
      .then(cssText => {
        this.styleElement.textContent = cssText;
        document.head.appendChild(this.styleElement);
        
        // 添加主题激活提示
        this.showActivationNotice();
        
        console.log('🔥 凤凰主题已激活');
      })
      .catch(error => {
        console.error('加载凤凰主题CSS失败:', error);
      });
  }

  removeTheme() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    
    // 移除主题激活提示
    this.removeActivationNotice();
    
    console.log('🔥 凤凰主题已禁用');
  }

  showActivationNotice() {
    // 移除已存在的提示
    this.removeActivationNotice();
    
    const notice = document.createElement('div');
    notice.id = 'phoenix-theme-notice';
    notice.innerHTML = `
      <div style="
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(244, 63, 94, 0.9);
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 12px;
        z-index: 10000;
        animation: fadeIn 0.5s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        🔥 凤凰主题已激活
      </div>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      </style>
    `;
    
    document.body.appendChild(notice);
    
    // 5秒后自动移除提示
    setTimeout(() => {
      this.removeActivationNotice();
    }, 5000);
  }

  removeActivationNotice() {
    const notice = document.getElementById('phoenix-theme-notice');
    if (notice) {
      notice.remove();
    }
  }

  setupObservers() {
    // 监听DOM变化，确保新添加的元素也能应用主题
    const observer = new MutationObserver((mutations) => {
      if (this.themeEnabled) {
        // 如果新添加了样式相关的元素，重新注入主题
        const hasRelevantChanges = mutations.some(mutation => {
          return mutation.addedNodes.length > 0 && 
                 Array.from(mutation.addedNodes).some(node => 
                   node.nodeType === 1 && 
                   (node.tagName === 'LINK' || node.tagName === 'STYLE')
                 );
        });
        
        if (hasRelevantChanges) {
          setTimeout(() => this.injectTheme(), 100);
        }
      }
    });

    observer.observe(document.head, {
      childList: true,
      subtree: true
    });
  }

  listenForChanges() {
    // 监听存储变化（来自popup或其他标签页）
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.phoenixThemeEnabled) {
        this.themeEnabled = changes.phoenixThemeEnabled.newValue;
        
        if (this.themeEnabled) {
          this.injectTheme();
        } else {
          this.removeTheme();
        }
      }
    });
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PhoenixThemeInjector();
  });
} else {
  new PhoenixThemeInjector();
}
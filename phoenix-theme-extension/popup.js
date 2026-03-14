// 凤凰主题弹出窗口控制脚本

class PhoenixPopup {
  constructor() {
    this.themeToggle = document.getElementById('themeToggle');
    this.themeVariant = document.getElementById('themeVariant');
    this.animationLevel = document.getElementById('animationLevel');
    this.settingsSection = document.getElementById('settingsSection');
    this.statusText = document.getElementById('statusText');
    
    this.init();
  }

  async init() {
    // 加载保存的设置
    await this.loadSettings();
    
    // 绑定事件监听器
    this.bindEvents();
    
    this.updateStatus('设置已加载');
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'phoenixThemeEnabled',
        'themeVariant',
        'animationLevel'
      ]);

      // 设置开关状态（默认为true）
      this.themeToggle.checked = result.phoenixThemeEnabled !== false;
      
      // 设置主题变体（默认为phoenix）
      this.themeVariant.value = result.themeVariant || 'phoenix';
      
      // 设置动画级别（默认为full）
      this.animationLevel.value = result.animationLevel || 'full';
      
      // 更新设置部分可见性
      this.updateSettingsVisibility();
      
    } catch (error) {
      console.error('加载设置失败:', error);
      this.updateStatus('加载设置失败');
    }
  }

  bindEvents() {
    // 主题开关事件
    this.themeToggle.addEventListener('change', () => {
      this.toggleTheme();
    });

    // 主题变体事件
    this.themeVariant.addEventListener('change', () => {
      this.saveSetting('themeVariant', this.themeVariant.value);
      this.updateStatus('主题变体已更新');
    });

    // 动画级别事件
    this.animationLevel.addEventListener('change', () => {
      this.saveSetting('animationLevel', this.animationLevel.value);
      this.updateStatus('动画设置已更新');
    });
  }

  async toggleTheme() {
    const enabled = this.themeToggle.checked;
    
    try {
      await this.saveSetting('phoenixThemeEnabled', enabled);
      
      // 更新设置部分可见性
      this.updateSettingsVisibility();
      
      // 发送消息到内容脚本
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleTheme',
            enabled: enabled
          });
        }
      });
      
      this.updateStatus(enabled ? '主题已启用' : '主题已禁用');
      
    } catch (error) {
      console.error('切换主题失败:', error);
      this.themeToggle.checked = !enabled; // 回滚状态
      this.updateStatus('操作失败，请重试');
    }
  }

  updateSettingsVisibility() {
    // 只有当主题启用时才显示设置选项
    this.settingsSection.style.opacity = this.themeToggle.checked ? '1' : '0.5';
    this.settingsSection.style.pointerEvents = this.themeToggle.checked ? 'auto' : 'none';
  }

  async saveSetting(key, value) {
    try {
      await chrome.storage.sync.set({ [key]: value });
    } catch (error) {
      console.error(`保存设置 ${key} 失败:`, error);
      throw error;
    }
  }

  updateStatus(message) {
    this.statusText.textContent = message;
    
    // 3秒后清除状态消息
    setTimeout(() => {
      this.statusText.textContent = '就绪';
    }, 3000);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new PhoenixPopup();
});
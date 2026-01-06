const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取机器码
  getMachineId: () => ipcRenderer.invoke('get-machine-id'),
  
  // 检查激活状态
  checkActivation: () => ipcRenderer.invoke('check-activation'),
  
  // 保存激活数据
  saveActivation: (data) => ipcRenderer.invoke('save-activation', data),
  
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // 监听激活过期事件
  onActivationExpired: (callback) => {
    ipcRenderer.on('activation-expired', (event, data) => callback(data));
  },
  
  // 判断是否在 Electron 环境
  isElectron: true
});

// 禁用一些危险操作
window.addEventListener('DOMContentLoaded', () => {
  // 禁用右键菜单（生产环境）
  if (process.env.NODE_ENV !== 'development') {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
});

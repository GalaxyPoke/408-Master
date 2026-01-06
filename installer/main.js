const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');

let mainWindow;
let splashWindow;

// 默认安装路径
const defaultInstallPath = path.join(process.env.LOCALAPPDATA || 'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local', '408考研学习指南');

// 应用文件源路径（打包后在 resources/app-files）
function getAppFilesPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app-files');
  }
  // 开发模式下使用 dist/win-unpacked
  return path.join(__dirname, '..', 'dist', 'win-unpacked');
}

// 创建启动加载窗口
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 300,
    height: 200,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 加载内联 HTML
  splashWindow.loadURL(`data:text/html;charset=utf-8,
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .splash {
          background: white;
          border-radius: 16px;
          padding: 40px 50px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .logo {
          width: 60px;
          height: 60px;
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 20px;
          font-weight: 300;
          color: #333;
        }
        .title {
          font-size: 13px;
          color: #666;
          margin-bottom: 20px;
        }
        .loader {
          width: 120px;
          height: 3px;
          background: #f0f0f0;
          border-radius: 2px;
          margin: 0 auto;
          overflow: hidden;
        }
        .loader-bar {
          width: 30%;
          height: 100%;
          background: #333;
          border-radius: 2px;
          animation: loading 1.2s ease-in-out infinite;
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .status {
          font-size: 11px;
          color: #999;
          margin-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="splash">
        <div class="logo">408</div>
        <div class="title">考研学习指南</div>
        <div class="loader"><div class="loader-bar"></div></div>
        <div class="status">正在准备安装程序...</div>
      </div>
    </body>
    </html>
  `);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 420,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    transparent: true,
    show: false, // 先不显示
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // 主窗口准备好后显示，关闭启动窗口
  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  // 先显示加载窗口
  createSplashWindow();
  
  // 延迟创建主窗口，让加载动画显示一会
  setTimeout(() => {
    createWindow();
  }, 800);
});

app.on('window-all-closed', () => {
  app.quit();
});

// 获取默认安装路径
ipcMain.handle('get-default-path', () => {
  return defaultInstallPath;
});

// 选择安装路径
ipcMain.handle('select-path', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: '选择安装位置'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return path.join(result.filePaths[0], '408考研学习指南');
  }
  return null;
});

// 开始安装
ipcMain.handle('start-install', async (event, options) => {
  const { installPath, createDesktop, createStartMenu } = options;
  const appFiles = getAppFilesPath();
  
  try {
    // 检查源文件是否存在
    if (!fs.existsSync(appFiles)) {
      throw new Error('安装文件不存在，请重新下载安装程序');
    }
    
    // 发送进度
    const sendProgress = (percent, status, detail) => {
      event.sender.send('install-progress', { percent, status, detail });
    };
    
    sendProgress(5, '正在准备...', '检查安装环境');
    
    // 创建安装目录
    if (!fs.existsSync(installPath)) {
      fs.mkdirSync(installPath, { recursive: true });
    }
    
    sendProgress(10, '正在复制文件...', '这可能需要几分钟');
    
    // 复制文件
    await copyDirectory(appFiles, installPath, (progress) => {
      const percent = 10 + Math.floor(progress * 70);
      sendProgress(percent, '正在复制文件...', `已完成 ${Math.floor(progress * 100)}%`);
    });
    
    sendProgress(85, '正在创建快捷方式...', '');
    
    // 创建桌面快捷方式
    if (createDesktop) {
      const desktopPath = path.join(process.env.USERPROFILE, 'Desktop');
      const shortcutPath = path.join(desktopPath, '408考研学习指南.lnk');
      const targetPath = path.join(installPath, '408考研学习指南.exe');
      
      createShortcut(shortcutPath, targetPath, installPath);
    }
    
    sendProgress(90, '正在配置...', '');
    
    // 创建开始菜单快捷方式
    if (createStartMenu) {
      const startMenuPath = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', '408考研学习指南');
      if (!fs.existsSync(startMenuPath)) {
        fs.mkdirSync(startMenuPath, { recursive: true });
      }
      
      const shortcutPath = path.join(startMenuPath, '408考研学习指南.lnk');
      const targetPath = path.join(installPath, '408考研学习指南.exe');
      
      createShortcut(shortcutPath, targetPath, installPath);
    }
    
    sendProgress(95, '正在完成...', '写入注册表');
    
    // 写入卸载信息到注册表
    writeUninstallInfo(installPath);
    
    sendProgress(100, '安装完成', '');
    
    return { success: true, installPath };
    
  } catch (error) {
    console.error('安装错误:', error);
    return { success: false, error: error.message };
  }
});

// 启动应用
ipcMain.handle('launch-app', (event, installPath) => {
  const exePath = path.join(installPath, '408考研学习指南.exe');
  if (fs.existsSync(exePath)) {
    spawn(exePath, [], { detached: true, stdio: 'ignore' }).unref();
  }
});

// 关闭安装程序
ipcMain.handle('close-installer', () => {
  app.quit();
});

// 最小化窗口
ipcMain.handle('minimize-window', () => {
  mainWindow.minimize();
});

// 复制目录（带进度回调）
async function copyDirectory(src, dest, onProgress) {
  const files = getAllFiles(src);
  const totalFiles = files.length;
  let copiedFiles = 0;
  
  for (const file of files) {
    try {
      const relativePath = path.relative(src, file);
      const destPath = path.join(dest, relativePath);
      const destDir = path.dirname(destPath);
      
      // 确保目标目录存在
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // 检查目标路径是否已存在且是目录
      if (fs.existsSync(destPath)) {
        const stat = fs.statSync(destPath);
        if (stat.isDirectory()) {
          copiedFiles++;
          continue;
        }
      }
      
      fs.copyFileSync(file, destPath);
      copiedFiles++;
      
      if (onProgress) {
        onProgress(copiedFiles / totalFiles);
      }
      
      // 让出事件循环，避免界面卡死
      await new Promise(resolve => setImmediate(resolve));
    } catch (err) {
      console.error('复制文件失败:', file, err.message);
      copiedFiles++;
    }
  }
}

// 获取目录下所有文件
function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 创建快捷方式（使用 PowerShell）
function createShortcut(shortcutPath, targetPath, workingDir) {
  try {
    const ps = `
      $WshShell = New-Object -ComObject WScript.Shell
      $Shortcut = $WshShell.CreateShortcut("${shortcutPath.replace(/\\/g, '\\\\')}")
      $Shortcut.TargetPath = "${targetPath.replace(/\\/g, '\\\\')}"
      $Shortcut.WorkingDirectory = "${workingDir.replace(/\\/g, '\\\\')}"
      $Shortcut.Save()
    `;
    execSync(`powershell -Command "${ps.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { stdio: 'ignore' });
  } catch (e) {
    console.error('创建快捷方式失败:', e);
  }
}

// 写入卸载信息到注册表
function writeUninstallInfo(installPath) {
  try {
    const appName = '408考研学习指南';
    const uninstallKey = `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${appName}`;
    const exePath = path.join(installPath, '408考研学习指南.exe');
    
    const commands = [
      `reg add "${uninstallKey}" /v DisplayName /t REG_SZ /d "${appName}" /f`,
      `reg add "${uninstallKey}" /v DisplayVersion /t REG_SZ /d "1.0.0" /f`,
      `reg add "${uninstallKey}" /v Publisher /t REG_SZ /d "408考研学习指南" /f`,
      `reg add "${uninstallKey}" /v InstallLocation /t REG_SZ /d "${installPath}" /f`,
      `reg add "${uninstallKey}" /v DisplayIcon /t REG_SZ /d "${exePath}" /f`,
      `reg add "${uninstallKey}" /v UninstallString /t REG_SZ /d "${path.join(installPath, 'Uninstall 408考研学习指南.exe')}" /f`
    ];
    
    for (const cmd of commands) {
      execSync(cmd, { stdio: 'ignore' });
    }
  } catch (e) {
    console.error('写入注册表失败:', e);
  }
}

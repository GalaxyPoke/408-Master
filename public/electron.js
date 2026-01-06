const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const fs = require('fs');
const os = require('os');

// ========== 防破解配置 ==========
const APP_SECRET = '408StudyGuide2024SecretKey!@#$%^&*()_+';
const VERIFY_SERVER = 'http://localhost:3001';
const CHECK_INTERVAL = 30 * 60 * 1000;

// 代码完整性校验（打包时生成）
const CODE_HASH = process.env.CODE_HASH || '';

let mainWindow;
let verifyTimer = null;

// ========== 代码混淆的关键函数 ==========
const _0x = {
  a: (s) => Buffer.from(s, 'base64').toString(),
  b: (s) => crypto.createHash('sha256').update(s).digest('hex'),
  c: (d) => new Date(d).getTime()
};

// ========== 机器码生成（更强的硬件绑定）==========
function generateMachineId() {
  const cpus = os.cpus();
  const networkInterfaces = os.networkInterfaces();
  
  const info = [
    os.hostname(),
    os.platform(),
    os.arch(),
    cpus[0]?.model || '',
    os.totalmem().toString(),
    Object.values(networkInterfaces)
      .flat()
      .find(i => !i.internal && i.mac !== '00:00:00:00:00:00')?.mac || '',
    // 添加更多硬件特征
    cpus.length.toString(),
    os.homedir()
  ].join('|');
  
  const hash = crypto.createHash('sha256').update(info + APP_SECRET).digest('hex');
  return 'M' + hash.substring(0, 15).toUpperCase();
}

// ========== 加密存储（双重加密）==========
function encryptData(data) {
  const iv = crypto.randomBytes(16);
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(APP_SECRET, salt, 100000, 32, 'sha512');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return salt.toString('hex') + ':' + iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decryptData(encryptedData) {
  try {
    const [saltHex, ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = crypto.pbkdf2Sync(APP_SECRET, salt, 100000, 32, 'sha512');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
}

// ========== 本地激活数据存储（多位置备份）==========
function getActivationPaths() {
  const base = app.getPath('userData');
  return [
    path.join(base, '.a'),
    path.join(base, '.cache', '.d'),
    path.join(os.tmpdir(), '.408s')
  ];
}

function saveActivation(data) {
  const encrypted = encryptData({
    ...data,
    machineId: generateMachineId(),
    timestamp: Date.now(),
    checksum: _0x.b(JSON.stringify(data) + generateMachineId())
  });
  
  getActivationPaths().forEach(p => {
    try {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(p, encrypted, 'utf8');
    } catch (e) {}
  });
}

function loadActivation() {
  for (const p of getActivationPaths()) {
    try {
      if (!fs.existsSync(p)) continue;
      const encrypted = fs.readFileSync(p, 'utf8');
      const data = decryptData(encrypted);
      
      if (!data) continue;
      
      // 验证机器码
      if (data.machineId !== generateMachineId()) continue;
      
      // 验证校验和
      const expectedChecksum = _0x.b(JSON.stringify({
        expiresAt: data.expiresAt,
        daysLeft: data.daysLeft
      }) + data.machineId);
      
      if (data.checksum !== expectedChecksum) continue;
      
      // 验证时间戳（防止时间回拨）
      if (data.timestamp > Date.now() + 60000) continue;
      
      return data;
    } catch (e) {}
  }
  return null;
}

// ========== 在线验证（带签名）==========
function verifyOnline(machineId) {
  return new Promise((resolve) => {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const signature = crypto.createHmac('sha256', APP_SECRET)
      .update(machineId + timestamp + nonce)
      .digest('hex');
    
    const postData = JSON.stringify({ machineId, timestamp, nonce, signature });
    const url = new URL(VERIFY_SERVER + '/api/license/verify');
    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'X-App-Version': app.getVersion(),
        'X-Request-Id': nonce
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          // 验证服务器响应签名
          if (result.serverSignature) {
            const expectedSig = crypto.createHmac('sha256', APP_SECRET)
              .update(JSON.stringify({ activated: result.activated, expiresAt: result.expiresAt }))
              .digest('hex');
            if (result.serverSignature !== expectedSig) {
              resolve({ activated: false, error: '响应签名无效' });
              return;
            }
          }
          resolve(result);
        } catch (e) {
          resolve({ activated: false, error: '解析错误' });
        }
      });
    });
    
    req.on('error', () => resolve({ activated: null, offline: true }));
    req.on('timeout', () => { req.destroy(); resolve({ activated: null, offline: true }); });
    req.write(postData);
    req.end();
  });
}

// ========== 激活检查 ==========
async function checkActivation() {
  const machineId = generateMachineId();
  const localData = loadActivation();
  
  const onlineResult = await verifyOnline(machineId);
  
  if (onlineResult.offline) {
    if (localData && localData.expiresAt) {
      const expires = new Date(localData.expiresAt);
      if (expires > new Date()) {
        // 离线宽限期：最多7天
        const offlineDays = Math.floor((Date.now() - localData.timestamp) / (1000 * 60 * 60 * 24));
        if (offlineDays <= 7) {
          return { 
            activated: true, 
            offline: true,
            expiresAt: localData.expiresAt,
            daysLeft: Math.ceil((expires - new Date()) / (1000 * 60 * 60 * 24))
          };
        }
      }
    }
    return { activated: false, offline: true, message: '请连接网络验证' };
  }
  
  if (onlineResult.activated) {
    saveActivation({
      expiresAt: onlineResult.expiresAt,
      daysLeft: onlineResult.daysLeft
    });
    return onlineResult;
  }
  
  return { activated: false, message: onlineResult.message || '未激活' };
}

// ========== 定时验证 ==========
function startPeriodicVerification() {
  if (verifyTimer) clearInterval(verifyTimer);
  
  verifyTimer = setInterval(async () => {
    const result = await checkActivation();
    if (!result.activated && !result.offline) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('activation-expired', result);
      }
    }
  }, CHECK_INTERVAL);
}

// ========== 防调试和防篡改 ==========
function setupProtection() {
  if (process.env.NODE_ENV === 'development') return;
  
  // 禁用开发者工具
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
    mainWindow.destroy();
    app.quit();
  });
  
  // 检测调试器
  setInterval(() => {
    const start = Date.now();
    // debugger 语句在调试时会暂停
    eval('debugger');
    if (Date.now() - start > 100) {
      app.quit();
    }
  }, 5000);
  
  // 检测 asar 是否被解压
  if (app.isPackaged) {
    const asarPath = path.join(process.resourcesPath, 'app.asar');
    if (!fs.existsSync(asarPath)) {
      dialog.showErrorBox('错误', '应用文件已损坏');
      app.quit();
    }
  }
}

// ========== 创建窗口 ==========
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: process.env.NODE_ENV === 'development'
    },
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#f8fafc',
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    setupProtection();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (verifyTimer) clearInterval(verifyTimer);
  });

  startPeriodicVerification();
}

// ========== IPC 通信 ==========
ipcMain.handle('get-machine-id', () => generateMachineId());
ipcMain.handle('check-activation', async () => await checkActivation());
ipcMain.handle('save-activation', (event, data) => { saveActivation(data); return { success: true }; });
ipcMain.handle('get-app-version', () => app.getVersion());

// ========== 应用生命周期 ==========
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createWindow(); });

// 防止多开
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

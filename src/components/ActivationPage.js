import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Copy, Loader2 } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const isElectron = () => window.electronAPI?.isElectron === true;

const generateBrowserMachineId = () => {
  const stored = localStorage.getItem('machineId');
  if (stored) return stored;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('408考研学习指南', 2, 2);
  const canvasData = canvas.toDataURL();
  
  // eslint-disable-next-line no-restricted-globals
  const screenInfo = window.screen || screen;
  const info = [
    navigator.userAgent, navigator.language,
    screenInfo.width + 'x' + screenInfo.height, screenInfo.colorDepth,
    new Date().getTimezoneOffset(), navigator.hardwareConcurrency || 0,
    canvasData.slice(-50)
  ].join('|');
  
  let hash = 0;
  for (let i = 0; i < info.length; i++) {
    const char = info.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const machineId = 'M' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  localStorage.setItem('machineId', machineId);
  return machineId;
};

const getMachineId = async () => {
  if (isElectron()) return await window.electronAPI.getMachineId();
  return generateBrowserMachineId();
};

const QQIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29.43 2.213 0 6.29.256 6.29-.43 0-.687-1.77-1.182-1.77-1.182 2.085-1.77 1.905-3.967 1.905-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C18.29 3.364 14.268 2 12.003 2z"/>
  </svg>
);

const WeChatIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
  </svg>
);

const ADMIN_KEY = '408admin2024';

const ActivationPage = ({ onActivated }) => {
  const [licenseCode, setLicenseCode] = useState('');
  const [machineId, setMachineId] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedContact, setCopiedContact] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [appVersion, setAppVersion] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  useEffect(() => {
    const init = async () => {
      const id = await getMachineId();
      setMachineId(id);
      if (isElectron()) {
        const version = await window.electronAPI.getAppVersion();
        setAppVersion(version);
      }
      await checkActivationStatus(id);
    };
    init();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (isElectron()) {
      window.electronAPI.onActivationExpired(() => {
        setError('激活已过期，请重新激活');
        localStorage.removeItem('activationData');
      });
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkActivationStatus = async (id) => {
    setChecking(true);
    try {
      if (isElectron()) {
        const result = await window.electronAPI.checkActivation();
        if (result.activated) {
          localStorage.setItem('activationData', JSON.stringify({
            activated: true, expiresAt: result.expiresAt, machineId: id, offline: result.offline
          }));
          onActivated && onActivated();
          return;
        }
      } else {
        const res = await fetch(`${API_BASE}/api/license/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ machineId: id })
        });
        const data = await res.json();
        if (data.activated) {
          localStorage.setItem('activationData', JSON.stringify({
            activated: true, expiresAt: data.expiresAt, machineId: id
          }));
          onActivated && onActivated();
          return;
        }
      }
      
      const cached = localStorage.getItem('activationData');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.activated && data.expiresAt && new Date(data.expiresAt) > new Date() && data.machineId === id) {
          onActivated && onActivated();
          return;
        }
      }
    } catch (err) {
      const cached = localStorage.getItem('activationData');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.activated && data.expiresAt && new Date(data.expiresAt) > new Date() && data.machineId === id) {
          onActivated && onActivated();
          return;
        }
      }
    } finally {
      setChecking(false);
    }
  };

  const handleCopyMachineId = () => {
    navigator.clipboard.writeText(machineId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivate = async () => {
    if (!licenseCode.trim()) { setError('请输入卡密'); return; }
    if (!isOnline) { setError('请连接网络后再激活'); return; }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE}/api/license/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: licenseCode.trim().toUpperCase(), machineId })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`激活成功！剩余 ${data.daysLeft} 天`);
        const activationData = {
          activated: true, expiresAt: data.expiresAt, machineId,
          activatedAt: new Date().toISOString()
        };
        localStorage.setItem('activationData', JSON.stringify(activationData));
        if (isElectron()) await window.electronAPI.saveActivation(activationData);
        setTimeout(() => onActivated && onActivated(), 1500);
      } else {
        setError(data.error || '激活失败');
      }
    } catch (err) {
      setError('网络错误，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const formatCode = (value) => {
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const parts = [];
    for (let i = 0; i < clean.length && i < 16; i += 4) parts.push(clean.slice(i, i + 4));
    return parts.join('-');
  };

  const copyContact = (type, value) => {
    navigator.clipboard.writeText(value);
    setCopiedContact(type);
    setTimeout(() => setCopiedContact(null), 2000);
  };

  const handleAdminLogin = () => {
    if (adminKey === ADMIN_KEY) {
      localStorage.setItem('activationData', JSON.stringify({
        activated: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        machineId,
        isAdmin: true
      }));
      setSuccess('管理员登录成功');
      setTimeout(() => onActivated && onActivated(), 1000);
    } else {
      setError('管理员密钥错误');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-slate-200 border-t-slate-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-slate-100 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-slate-100 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* 主卡片 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/50">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg mb-5">
              <span className="text-2xl font-light text-white tracking-wider">408</span>
            </div>
            <h1 className="text-lg font-medium text-slate-800 tracking-wide">考研学习指南</h1>
            {appVersion && <p className="text-xs text-slate-400 mt-1">v{appVersion}</p>}
          </div>

          {/* 机器码 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">机器码</span>
              <button
                onClick={handleCopyMachineId}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
              >
                {copied ? <><CheckCircle className="w-3 h-3" /><span>已复制</span></> : <><Copy className="w-3 h-3" /><span>复制</span></>}
              </button>
            </div>
            <div className="bg-slate-50/80 rounded-xl px-4 py-3 font-mono text-sm text-slate-600 tracking-wider border border-slate-100">
              {machineId}
            </div>
          </div>

          {/* 卡密输入 */}
          <div className="mb-6">
            <label className="block text-xs text-slate-400 font-medium mb-2">卡密</label>
            <input
              type="text"
              value={licenseCode}
              onChange={(e) => setLicenseCode(formatCode(e.target.value))}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full bg-slate-50/80 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 placeholder-slate-300 border border-slate-100 focus:border-slate-300 focus:ring-2 focus:ring-slate-100 focus:outline-none transition-all tracking-wider"
              maxLength={19}
              onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
            />
          </div>

          {/* 提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-xl flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-xs text-red-600">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 rounded-xl flex items-center gap-2 border border-emerald-100">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-emerald-600">{success}</span>
            </div>
          )}

          {/* 激活按钮 */}
          <button
            onClick={handleActivate}
            disabled={loading || !isOnline}
            className="w-full py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-medium rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '激活'}
          </button>

          {/* 管理员登录 */}
          {showAdminLogin ? (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="管理员密钥"
                className="w-full bg-slate-50/80 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 border border-slate-100 focus:border-slate-300 focus:ring-2 focus:ring-slate-100 focus:outline-none transition-all mb-3"
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
              <button
                onClick={handleAdminLogin}
                className="w-full py-2.5 text-xs text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                管理员登录
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAdminLogin(true)}
              className="w-full mt-4 py-2 text-xs text-slate-400 hover:text-slate-500 transition-colors"
            >
              管理员入口
            </button>
          )}

          {!isOnline && <p className="text-xs text-red-400 text-center mt-3">当前处于离线状态</p>}
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-xs text-slate-400">
            月卡 <span className="text-slate-600 font-medium">¥29</span> · 
            季卡 <span className="text-slate-600 font-medium">¥69</span> · 
            年卡 <span className="text-slate-600 font-medium">¥199</span>
          </p>
          
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => copyContact('qq', '479894990')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors group"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                <QQIcon />
              </div>
              <span className="text-xs">{copiedContact === 'qq' ? '已复制' : 'QQ'}</span>
            </button>
            <button
              onClick={() => copyContact('wechat', 'GalaxyPokemon')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors group"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                <WeChatIcon />
              </div>
              <span className="text-xs">{copiedContact === 'wechat' ? '已复制' : '微信'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationPage;

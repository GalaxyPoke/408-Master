import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Settings, X, Coffee, Brain, Battery } from 'lucide-react';
import { usePomodoro } from '../../contexts/PomodoroContext';

// 主题配置
const THEMES = {
  pomotroid: { name: 'Pomotroid', bg: '#2F384B', accent: '#FF4E4D', focus: '#FF4E4D', shortBreak: '#05EB8B', longBreak: '#05B4FF' },
  nord: { name: 'Nord', bg: '#2E3440', accent: '#88C0D0', focus: '#BF616A', shortBreak: '#A3BE8C', longBreak: '#5E81AC' },
  dracula: { name: 'Dracula', bg: '#282A36', accent: '#BD93F9', focus: '#FF5555', shortBreak: '#50FA7B', longBreak: '#8BE9FD' },
  monokai: { name: 'Monokai', bg: '#272822', accent: '#F92672', focus: '#F92672', shortBreak: '#A6E22E', longBreak: '#66D9EF' },
  github: { name: 'GitHub', bg: '#24292E', accent: '#79B8FF', focus: '#F97583', shortBreak: '#85E89D', longBreak: '#79B8FF' },
  ayu: { name: 'Ayu', bg: '#0A0E14', accent: '#FFB454', focus: '#FF8F40', shortBreak: '#C2D94C', longBreak: '#59C2FF' },
  cherry: { name: 'Cherry', bg: '#1D1721', accent: '#E06C9F', focus: '#E06C9F', shortBreak: '#98D4BB', longBreak: '#C3A5E0' },
  default: { name: '默认', bg: '#1e293b', accent: '#f97316', focus: '#ef4444', shortBreak: '#22c55e', longBreak: '#3b82f6' }
};

const PomodoroTimer = () => {
  const {
    config,
    updateConfig,
    currentRound,
    round,
    timeLeft,
    isRunning,
    totalRounds,
    totalTime,
    toggle,
    reset,
    skip,
    getLabel,
    formatTime,
    getTotalTime
  } = usePomodoro();

  // 主题
  const [themeName, setThemeName] = useState(() => localStorage.getItem('408_pomodoro_theme') || 'default');
  const theme = THEMES[themeName] || THEMES.default;
  
  // UI状态
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // 请求通知权限
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 获取回合颜色
  const getRoundColor = () => {
    switch (currentRound) {
      case 'work': return theme.focus;
      case 'short-break': return theme.shortBreak;
      case 'long-break': return theme.longBreak;
      default: return theme.focus;
    }
  };

  // 计算进度
  const progress = ((getTotalTime() - timeLeft) / getTotalTime()) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress / 100);

  const saveTheme = (name) => {
    setThemeName(name);
    localStorage.setItem('408_pomodoro_theme', name);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 h-full" style={{ backgroundColor: theme.bg }}>
      {/* 装饰背景 */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 transition-colors duration-500" style={{ backgroundColor: getRoundColor() }} />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl opacity-10 transition-colors duration-500" style={{ backgroundColor: theme.accent }} />
      
      <div className="relative p-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: getRoundColor() + '30' }}>
              {currentRound === 'work' ? (
                <Brain className="h-5 w-5" style={{ color: getRoundColor() }} />
              ) : currentRound === 'short-break' ? (
                <Coffee className="h-5 w-5" style={{ color: getRoundColor() }} />
              ) : (
                <Battery className="h-5 w-5" style={{ color: getRoundColor() }} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">番茄钟</h2>
              <p className="text-xs text-gray-400">{getLabel()} · {round}/{config.workRounds}</p>
            </div>
          </div>
          <button onClick={() => setShowSettings(true)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Settings className="h-4 w-4" />
          </button>
        </div>
        
        {/* 计时器表盘 */}
        <div className="relative w-52 h-52 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
            <circle
              cx="100" cy="100" r="90"
              stroke={getRoundColor()}
              strokeWidth="8" fill="none" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
              style={{ filter: 'drop-shadow(0 0 8px ' + getRoundColor() + '60)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-mono font-bold text-white tracking-tight" style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-gray-400 mt-2 uppercase tracking-widest">{getLabel()}</span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <button onClick={reset} className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="重置">
            <RotateCcw className="h-5 w-5" />
          </button>
          
          <button
            onClick={toggle}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg"
            style={{ backgroundColor: getRoundColor(), boxShadow: `0 0 30px ${getRoundColor()}50` }}
          >
            {isRunning ? <Pause className="h-7 w-7 text-white" /> : <Play className="h-7 w-7 text-white ml-1" />}
          </button>
          
          <button onClick={skip} className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="跳过">
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* 底部控制 */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalRounds}</div>
            <div className="text-xs text-gray-500">完成番茄</div>
          </div>
          
          <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{Math.floor(totalTime / 60)}h{totalTime % 60}m</div>
            <div className="text-xs text-gray-500">累计学习</div>
          </div>
        </div>
      </div>
      
      {/* 设置面板 */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4 max-h-[90%] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">设置</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* 时间设置 */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-400 block mb-2">专注时长 (分钟)</label>
                <input
                  type="number" min="1" max="60"
                  value={config.timeWork}
                  onChange={(e) => updateConfig({ ...config, timeWork: parseInt(e.target.value) || 25 })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">短休息时长 (分钟)</label>
                <input
                  type="number" min="1" max="30"
                  value={config.timeShortBreak}
                  onChange={(e) => updateConfig({ ...config, timeShortBreak: parseInt(e.target.value) || 5 })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">长休息时长 (分钟)</label>
                <input
                  type="number" min="1" max="60"
                  value={config.timeLongBreak}
                  onChange={(e) => updateConfig({ ...config, timeLongBreak: parseInt(e.target.value) || 15 })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">长休息间隔 (番茄数)</label>
                <input
                  type="number" min="1" max="10"
                  value={config.workRounds}
                  onChange={(e) => updateConfig({ ...config, workRounds: parseInt(e.target.value) || 4 })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* 主题选择 */}
            <div>
              <label className="text-sm text-gray-400 block mb-3">主题</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(THEMES).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => saveTheme(key)}
                    className={`p-2 rounded-lg transition-all ${themeName === key ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: t.bg }}
                    title={t.name}
                  >
                    <div className="flex gap-1 justify-center">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.focus }} />
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.shortBreak }} />
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.longBreak }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;

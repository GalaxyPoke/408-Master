import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const PomodoroContext = createContext();

export const usePomodoro = () => useContext(PomodoroContext);

// 默认配置
const DEFAULT_CONFIG = {
  timeWork: 25,
  timeShortBreak: 5,
  timeLongBreak: 15,
  workRounds: 4,
  volume: 80
};

export const PomodoroProvider = ({ children }) => {
  // 配置
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('408_pomodoro_config');
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
  });

  // 状态
  const [currentRound, setCurrentRound] = useState('work');
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(config.timeWork * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  
  // 统计
  const [totalRounds, setTotalRounds] = useState(() => {
    return parseInt(localStorage.getItem('408_pomodoro_totalRounds') || '0');
  });
  const [totalTime, setTotalTime] = useState(() => {
    return parseInt(localStorage.getItem('408_pomodoro_totalTime') || '0');
  });

  // 音频
  const audioRef = useRef(null);

  // 获取总时间
  const getTotalTime = useCallback(() => {
    switch (currentRound) {
      case 'work': return config.timeWork * 60;
      case 'short-break': return config.timeShortBreak * 60;
      case 'long-break': return config.timeLongBreak * 60;
      default: return config.timeWork * 60;
    }
  }, [currentRound, config]);

  // 获取颜色
  const getColor = () => {
    switch (currentRound) {
      case 'work': return '#ef4444';
      case 'short-break': return '#22c55e';
      case 'long-break': return '#3b82f6';
      default: return '#ef4444';
    }
  };

  // 获取标签
  const getLabel = () => {
    switch (currentRound) {
      case 'work': return '专注';
      case 'short-break': return '短休息';
      case 'long-break': return '长休息';
      default: return '专注';
    }
  };

  // 播放音频
  const playAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = config.volume / 100;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [config.volume]);

  // 回合完成
  const handleComplete = useCallback(() => {
    setIsRunning(false);
    playAudio();

    if (currentRound === 'work') {
      // 更新统计
      const newTotalRounds = totalRounds + 1;
      const newTotalTime = totalTime + config.timeWork;
      setTotalRounds(newTotalRounds);
      setTotalTime(newTotalTime);
      localStorage.setItem('408_pomodoro_totalRounds', newTotalRounds.toString());
      localStorage.setItem('408_pomodoro_totalTime', newTotalTime.toString());

      // 记录到热力图
      const today = new Date().toISOString().split('T')[0];
      const heatmapData = JSON.parse(localStorage.getItem('408_study_heatmap') || '{}');
      const existing = heatmapData[today] || { count: 0, minutes: 0 };
      heatmapData[today] = { count: existing.count + 1, minutes: existing.minutes + config.timeWork };
      localStorage.setItem('408_study_heatmap', JSON.stringify(heatmapData));

      // 切换到休息
      if (round >= config.workRounds) {
        setCurrentRound('long-break');
        setTimeLeft(config.timeLongBreak * 60);
      } else {
        setCurrentRound('short-break');
        setTimeLeft(config.timeShortBreak * 60);
      }
    } else if (currentRound === 'short-break') {
      setCurrentRound('work');
      setRound(r => r + 1);
      setTimeLeft(config.timeWork * 60);
    } else {
      setCurrentRound('work');
      setRound(1);
      setTimeLeft(config.timeWork * 60);
    }
  }, [currentRound, round, config, totalRounds, totalTime, playAudio]);

  // 计时器
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            handleComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleComplete]);

  // 控制函数
  const start = () => {
    setIsRunning(true);
    setShowFloating(true); // 开始时显示悬浮窗
  };

  const pause = () => setIsRunning(false);
  
  const toggle = () => {
    if (!isRunning) {
      start();
    } else {
      pause();
    }
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(getTotalTime());
  };

  const skip = () => handleComplete();

  const updateConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('408_pomodoro_config', JSON.stringify(newConfig));
    if (!isRunning) {
      if (currentRound === 'work') setTimeLeft(newConfig.timeWork * 60);
      else if (currentRound === 'short-break') setTimeLeft(newConfig.timeShortBreak * 60);
      else setTimeLeft(newConfig.timeLongBreak * 60);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const progress = ((getTotalTime() - timeLeft) / getTotalTime()) * 100;

  return (
    <PomodoroContext.Provider value={{
      config,
      updateConfig,
      currentRound,
      round,
      timeLeft,
      isRunning,
      showFloating,
      setShowFloating,
      totalRounds,
      totalTime,
      start,
      pause,
      toggle,
      reset,
      skip,
      getColor,
      getLabel,
      getTotalTime,
      formatTime,
      progress,
      audioRef
    }}>
      {/* 全局音频元素 */}
      <audio ref={audioRef} src="/audios/alert-work.mp3" preload="auto" />
      {children}
    </PomodoroContext.Provider>
  );
};

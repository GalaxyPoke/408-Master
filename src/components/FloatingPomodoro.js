import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, X, Coffee, Brain, Battery } from 'lucide-react';
import { usePomodoro } from '../contexts/PomodoroContext';

const FloatingPomodoro = () => {
  const {
    config,
    currentRound,
    round,
    timeLeft,
    isRunning,
    showFloating,
    setShowFloating,
    toggle,
    reset,
    skip,
    getColor,
    getLabel,
    formatTime,
    progress
  } = usePomodoro();

  const [position, setPosition] = useState({ x: window.innerWidth - 180, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // 拖拽
  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    const rect = dragRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 160, e.clientX - dragOffset.current.x)),
      y: Math.max(0, Math.min(window.innerHeight - 160, e.clientY - dragOffset.current.y))
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 不显示悬浮窗
  if (!showFloating) return null;

  return (
    <div
      ref={dragRef}
      className="fixed z-[9999] rounded-2xl shadow-2xl select-none"
      style={{
        left: position.x,
        top: position.y,
        backgroundColor: '#1e293b',
        width: '150px',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="p-3">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {currentRound === 'work' ? (
              <Brain className="w-3.5 h-3.5" style={{ color: getColor() }} />
            ) : currentRound === 'short-break' ? (
              <Coffee className="w-3.5 h-3.5" style={{ color: getColor() }} />
            ) : (
              <Battery className="w-3.5 h-3.5" style={{ color: getColor() }} />
            )}
            <span className="text-xs text-gray-400">{getLabel()}</span>
          </div>
          <button
            onClick={() => setShowFloating(false)}
            className="w-5 h-5 rounded flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* 时间 */}
        <div className="text-center mb-2">
          <div className="text-2xl font-mono font-bold text-white" style={{ textShadow: `0 0 10px ${getColor()}40` }}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-[10px] text-gray-500">{round}/{config.workRounds}</div>
        </div>

        {/* 进度条 */}
        <div className="h-1 bg-white/10 rounded-full mb-2 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: getColor() }} />
        </div>

        {/* 控制 */}
        <div className="flex justify-center items-center gap-1">
          <button onClick={reset} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10">
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: getColor() }}
          >
            {isRunning ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
          </button>
          <button onClick={skip} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10">
            <SkipForward className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingPomodoro;

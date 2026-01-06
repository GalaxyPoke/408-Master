import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Calendar, Target, BookOpen, Flame, Award } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudyTime: 0,
    pomodoros: 0,
    checkInDays: 0,
    streak: 0,
    notesCount: 0,
    progress: 0,
    weeklyData: [],
  });

  useEffect(() => {
    const loadStats = () => {
      const checkInData = JSON.parse(localStorage.getItem('408_checkInData') || '{"dates":[],"streak":0}');
      const pomodoros = parseInt(localStorage.getItem('408_completedPomodoros') || '0');
      const studyMinutes = parseInt(localStorage.getItem('408_totalStudyTime') || '0');
      const notes = JSON.parse(localStorage.getItem('408_notes') || '[]');
      const progressData = JSON.parse(localStorage.getItem('408_studyProgress') || '{}');

      let totalChapters = 0;
      let completedChapters = 0;
      Object.values(progressData).forEach(subject => {
        if (subject.chapters) {
          totalChapters += subject.chapters.length;
          completedChapters += subject.chapters.filter(c => c === 2).length;
        }
      });
      const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

      const weeklyData = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const isChecked = checkInData.dates?.includes(dateStr);
        weeklyData.push({
          day: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
          date: dateStr,
          checked: isChecked,
          isToday: i === 0,
        });
      }

      setStats({
        totalStudyTime: studyMinutes,
        pomodoros,
        checkInDays: checkInData.dates?.length || 0,
        streak: checkInData.streak || 0,
        notesCount: notes.length,
        progress,
        weeklyData,
      });
    };

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h${mins}m`;
    return `${mins}m`;
  };

  const statCards = [
    { label: '累计学习', value: formatTime(stats.totalStudyTime), icon: Clock, gradient: 'from-blue-500 to-cyan-400' },
    { label: '完成番茄', value: stats.pomodoros, icon: Target, gradient: 'from-rose-500 to-pink-400' },
    { label: '打卡天数', value: stats.checkInDays, icon: Calendar, gradient: 'from-emerald-500 to-teal-400' },
    { label: '连续打卡', value: `${stats.streak}天`, icon: Flame, gradient: 'from-orange-500 to-amber-400' },
    { label: '笔记数量', value: stats.notesCount, icon: BookOpen, gradient: 'from-violet-500 to-purple-400' },
    { label: '学习进度', value: `${stats.progress}%`, icon: Award, gradient: 'from-indigo-500 to-blue-400' },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white">
      {/* 装饰背景 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
      
      <div className="relative p-8">
        {/* 头部 */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">学习数据看板</h2>
            <p className="text-sm text-gray-500">实时追踪你的学习进度</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-2xl font-black text-gray-800">{card.value}</div>
                  <div className="text-xs text-gray-500 font-medium">{card.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 本周打卡 */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-500" />
            本周打卡
          </h3>
          <div className="flex justify-between gap-2">
            {stats.weeklyData.map((day, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="text-xs text-gray-500 mb-2 font-medium">周{day.day}</div>
                <div className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                  day.checked 
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-md shadow-green-200' 
                    : day.isToday
                    ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500 ring-2 ring-indigo-400 ring-offset-2'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {day.checked ? '✓' : day.isToday ? '今' : '-'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 学习进度 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-gray-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              总体学习进度
            </span>
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {stats.progress}%
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 relative"
              style={{ width: `${Math.max(stats.progress, 2)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
            <span>基础</span>
            <span>强化</span>
            <span>冲刺</span>
            <span>完成</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

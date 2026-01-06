import React, { useState, useEffect } from 'react';
import { Trophy, Star, Flame, BookOpen, Clock, Target, Award, Zap, Crown, Medal } from 'lucide-react';

const Achievements = () => {
  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem('408_achievements');
    return saved ? JSON.parse(saved) : [];
  });

  const allAchievements = [
    { id: 'first_checkin', name: '初来乍到', desc: '完成第一次打卡', icon: Star, color: 'yellow', condition: (data) => data.checkInCount >= 1 },
    { id: 'week_streak', name: '坚持一周', desc: '连续打卡7天', icon: Flame, color: 'orange', condition: (data) => data.streak >= 7 },
    { id: 'month_streak', name: '月度坚持', desc: '连续打卡30天', icon: Crown, color: 'purple', condition: (data) => data.streak >= 30 },
    { id: 'first_pomodoro', name: '番茄新手', desc: '完成第一个番茄钟', icon: Clock, color: 'red', condition: (data) => data.pomodoros >= 1 },
    { id: 'pomodoro_10', name: '专注达人', desc: '完成10个番茄钟', icon: Target, color: 'blue', condition: (data) => data.pomodoros >= 10 },
    { id: 'pomodoro_50', name: '番茄大师', desc: '完成50个番茄钟', icon: Award, color: 'indigo', condition: (data) => data.pomodoros >= 50 },
    { id: 'pomodoro_100', name: '百番成就', desc: '完成100个番茄钟', icon: Trophy, color: 'gold', condition: (data) => data.pomodoros >= 100 },
    { id: 'study_10h', name: '十小时', desc: '累计学习10小时', icon: BookOpen, color: 'green', condition: (data) => data.studyMinutes >= 600 },
    { id: 'study_50h', name: '五十小时', desc: '累计学习50小时', icon: Zap, color: 'cyan', condition: (data) => data.studyMinutes >= 3000 },
    { id: 'study_100h', name: '百小时学霸', desc: '累计学习100小时', icon: Medal, color: 'pink', condition: (data) => data.studyMinutes >= 6000 },
    { id: 'notes_10', name: '笔记达人', desc: '记录10条笔记', icon: BookOpen, color: 'teal', condition: (data) => data.notesCount >= 10 },
    { id: 'progress_25', name: '初窥门径', desc: '完成25%学习进度', icon: Target, color: 'lime', condition: (data) => data.progress >= 25 },
    { id: 'progress_50', name: '半程达人', desc: '完成50%学习进度', icon: Star, color: 'amber', condition: (data) => data.progress >= 50 },
    { id: 'progress_100', name: '全面掌握', desc: '完成100%学习进度', icon: Crown, color: 'emerald', condition: (data) => data.progress >= 100 },
  ];

  const colorMap = {
    yellow: 'from-yellow-400 to-yellow-600',
    orange: 'from-orange-400 to-orange-600',
    purple: 'from-purple-400 to-purple-600',
    red: 'from-red-400 to-red-600',
    blue: 'from-blue-400 to-blue-600',
    indigo: 'from-indigo-400 to-indigo-600',
    gold: 'from-yellow-500 to-amber-600',
    green: 'from-green-400 to-green-600',
    cyan: 'from-cyan-400 to-cyan-600',
    pink: 'from-pink-400 to-pink-600',
    teal: 'from-teal-400 to-teal-600',
    lime: 'from-lime-400 to-lime-600',
    amber: 'from-amber-400 to-amber-600',
    emerald: 'from-emerald-400 to-emerald-600',
  };

  useEffect(() => {
    const checkAchievements = () => {
      // 获取各项数据
      const checkInData = JSON.parse(localStorage.getItem('408_checkInData') || '{"dates":[],"streak":0}');
      const pomodoros = parseInt(localStorage.getItem('408_completedPomodoros') || '0');
      const studyMinutes = parseInt(localStorage.getItem('408_totalStudyTime') || '0');
      const notes = JSON.parse(localStorage.getItem('408_notes') || '[]');
      const progressData = JSON.parse(localStorage.getItem('408_studyProgress') || '{}');
      
      // 计算学习进度
      let totalChapters = 0;
      let completedChapters = 0;
      Object.values(progressData).forEach(subject => {
        if (subject.chapters) {
          totalChapters += subject.chapters.length;
          completedChapters += subject.chapters.filter(c => c === 2).length;
        }
      });
      const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

      const data = {
        checkInCount: checkInData.dates?.length || 0,
        streak: checkInData.streak || 0,
        pomodoros,
        studyMinutes,
        notesCount: notes.length,
        progress,
      };

      // 检查新成就
      const newAchievements = [];
      allAchievements.forEach(achievement => {
        if (!achievements.includes(achievement.id) && achievement.condition(data)) {
          newAchievements.push(achievement.id);
        }
      });

      if (newAchievements.length > 0) {
        const updated = [...achievements, ...newAchievements];
        setAchievements(updated);
        localStorage.setItem('408_achievements', JSON.stringify(updated));
      }
    };

    checkAchievements();
    const interval = setInterval(checkAchievements, 5000);
    return () => clearInterval(interval);
  }, [achievements]);

  const unlockedCount = achievements.length;
  const totalCount = allAchievements.length;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          成就系统
        </h2>
        <span className="text-sm text-gray-500">{unlockedCount}/{totalCount} 已解锁</span>
      </div>

      {/* 进度条 */}
      <div className="mb-6">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* 成就列表 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allAchievements.map(achievement => {
          const Icon = achievement.icon;
          const isUnlocked = achievements.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`relative p-4 rounded-xl text-center transition-all ${
                isUnlocked 
                  ? `bg-gradient-to-br ${colorMap[achievement.color]} text-white shadow-lg transform hover:scale-105` 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Icon className={`h-8 w-8 mx-auto mb-2 ${isUnlocked ? '' : 'opacity-30'}`} />
              <div className={`font-bold text-sm ${isUnlocked ? '' : 'text-gray-500'}`}>{achievement.name}</div>
              <div className={`text-xs mt-1 ${isUnlocked ? 'text-white/80' : 'text-gray-400'}`}>{achievement.desc}</div>
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-gray-300 rounded-full flex items-center justify-center bg-white">
                    <span className="text-gray-400 text-lg">?</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;

import React, { useState } from 'react';
import { Calendar, Flame, Trophy, CheckCircle, Sparkles } from 'lucide-react';

const DailyCheckIn = () => {
  const [checkInData, setCheckInData] = useState(() => {
    const saved = localStorage.getItem('408_checkInData');
    return saved ? JSON.parse(saved) : { dates: [], streak: 0, maxStreak: 0 };
  });

  const today = new Date().toISOString().split('T')[0];
  const isCheckedInToday = checkInData.dates.includes(today);

  const handleCheckIn = () => {
    if (isCheckedInToday) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const wasCheckedInYesterday = checkInData.dates.includes(yesterdayStr);
    const newStreak = wasCheckedInYesterday ? checkInData.streak + 1 : 1;
    const newMaxStreak = Math.max(newStreak, checkInData.maxStreak);

    const newData = {
      dates: [...checkInData.dates, today],
      streak: newStreak,
      maxStreak: newMaxStreak,
    };

    setCheckInData(newData);
    localStorage.setItem('408_checkInData', JSON.stringify(newData));
  };

  const getCalendarDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        date: dateStr,
        isChecked: checkInData.dates.includes(dateStr),
        isToday: dateStr === today,
      });
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const currentMonth = monthNames[new Date().getMonth()];

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
      {/* 装饰 */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      
      <div className="relative p-6">
        {/* 头部 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">每日打卡</h2>
            <p className="text-xs text-white/70">{currentMonth}</p>
          </div>
        </div>

        {/* 打卡按钮 */}
        <button
          onClick={handleCheckIn}
          disabled={isCheckedInToday}
          className={`w-full py-4 rounded-2xl font-bold text-lg mb-5 transition-all ${
            isCheckedInToday
              ? 'bg-white/20 backdrop-blur-sm text-white cursor-default'
              : 'bg-white text-indigo-600 hover:bg-white/90 transform hover:scale-[1.02] shadow-lg'
          }`}
        >
          {isCheckedInToday ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" /> 今日已打卡
              <Sparkles className="h-4 w-4 text-yellow-300" />
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" /> 立即打卡
            </span>
          )}
        </button>

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <Flame className="h-5 w-5 text-orange-300 mx-auto mb-1" />
            <div className="text-2xl font-black text-white">{checkInData.streak}</div>
            <div className="text-xs text-white/60">连续</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <Trophy className="h-5 w-5 text-yellow-300 mx-auto mb-1" />
            <div className="text-2xl font-black text-white">{checkInData.maxStreak}</div>
            <div className="text-xs text-white/60">最长</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <Calendar className="h-5 w-5 text-cyan-300 mx-auto mb-1" />
            <div className="text-2xl font-black text-white">{checkInData.dates.length}</div>
            <div className="text-xs text-white/60">累计</div>
          </div>
        </div>

        {/* 日历 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="text-white/50 font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center text-xs rounded-lg font-medium transition-all ${
                  !day ? '' :
                  day.isChecked ? 'bg-white text-indigo-600 font-bold shadow-md' :
                  day.isToday ? 'bg-white/30 text-white ring-2 ring-white' :
                  'text-white/60 hover:bg-white/10'
                }`}
              >
                {day?.day}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCheckIn;

import React, { useState, useEffect } from 'react';
import { Calendar, Target, Edit3, Check, Sparkles, Palette } from 'lucide-react';

const Countdown = () => {
  const [examDate, setExamDate] = useState(() => {
    const saved = localStorage.getItem('408_examDate');
    return saved || '2026-12-20';
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempDate, setTempDate] = useState(examDate);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [bgTheme, setBgTheme] = useState(() => {
    const saved = localStorage.getItem('408_countdownTheme');
    return saved || 'white';
  });
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const exam = new Date(examDate + 'T08:30:00');
      const now = new Date();
      const diff = exam - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [examDate]);

  const saveDate = () => {
    setExamDate(tempDate);
    localStorage.setItem('408_examDate', tempDate);
    setIsEditing(false);
  };

  const changeTheme = (theme) => {
    setBgTheme(theme);
    localStorage.setItem('408_countdownTheme', theme);
    setShowThemePicker(false);
  };

  const themes = {
    white: { bg: 'bg-white', text: 'text-gray-800', subtext: 'text-gray-500', card: 'bg-gray-100', border: 'border-gray-200' },
    dark: { bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900', text: 'text-white', subtext: 'text-white/60', card: 'bg-white/10', border: 'border-white/10' },
    blue: { bg: 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800', text: 'text-white', subtext: 'text-white/70', card: 'bg-white/15', border: 'border-white/20' },
    green: { bg: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700', text: 'text-white', subtext: 'text-white/70', card: 'bg-white/15', border: 'border-white/20' },
    orange: { bg: 'bg-gradient-to-br from-orange-500 via-red-500 to-rose-600', text: 'text-white', subtext: 'text-white/70', card: 'bg-white/15', border: 'border-white/20' },
    purple: { bg: 'bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600', text: 'text-white', subtext: 'text-white/70', card: 'bg-white/15', border: 'border-white/20' },
  };

  const currentTheme = themes[bgTheme] || themes.white;

  const getMotivationalMessage = () => {
    const days = timeLeft.days;
    if (days > 180) return { text: '时间充裕，打好基础！', emoji: '📚' };
    if (days > 90) return { text: '强化阶段，稳步提升！', emoji: '💪' };
    if (days > 30) return { text: '冲刺阶段，全力以赴！', emoji: '🔥' };
    if (days > 7) return { text: '最后冲刺，保持状态！', emoji: '⚡' };
    if (days > 0) return { text: '考试在即，相信自己！', emoji: '🌟' };
    return { text: '考试加油！你可以的！', emoji: '🎯' };
  };

  const msg = getMotivationalMessage();

  return (
    <div className={`relative overflow-hidden rounded-3xl shadow-2xl ${currentTheme.bg} ${bgTheme === 'white' ? 'border border-gray-200' : ''}`}>
      {/* 装饰圆圈 - 仅在非白色主题显示 */}
      {bgTheme !== 'white' && (
        <>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        </>
      )}
      
      <div className="relative p-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${bgTheme === 'white' ? 'bg-indigo-100' : 'bg-white/20 backdrop-blur-sm'} rounded-2xl flex items-center justify-center`}>
              <Target className={`h-6 w-6 ${bgTheme === 'white' ? 'text-indigo-600' : 'text-white'}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${currentTheme.text}`}>考研倒计时</h2>
              <div className={`flex items-center gap-1 ${currentTheme.subtext} text-sm`}>
                <Calendar className="h-3 w-3" />
                <span>{examDate}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 主题选择按钮 */}
            <div className="relative">
              <button 
                onClick={() => setShowThemePicker(!showThemePicker)} 
                className={`p-3 ${bgTheme === 'white' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'} rounded-xl transition-all`}
              >
                <Palette className={`h-4 w-4 ${bgTheme === 'white' ? 'text-gray-600' : 'text-white'}`} />
              </button>
              {showThemePicker && (
                <div className="absolute right-0 top-full mt-2 p-3 bg-white rounded-2xl shadow-xl z-50 flex gap-2">
                  {Object.keys(themes).map(theme => (
                    <button
                      key={theme}
                      onClick={() => changeTheme(theme)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${bgTheme === theme ? 'border-indigo-500 scale-110' : 'border-gray-200'} ${
                        theme === 'white' ? 'bg-white' :
                        theme === 'dark' ? 'bg-slate-800' :
                        theme === 'blue' ? 'bg-blue-600' :
                        theme === 'green' ? 'bg-emerald-600' :
                        theme === 'orange' ? 'bg-orange-500' :
                        'bg-purple-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            {/* 编辑按钮 */}
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className={`p-3 ${bgTheme === 'white' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'} rounded-xl transition-all`}>
                <Edit3 className={`h-4 w-4 ${bgTheme === 'white' ? 'text-gray-600' : 'text-white'}`} />
              </button>
            ) : (
              <button onClick={saveDate} className="p-3 bg-green-500 hover:bg-green-600 rounded-xl transition-all">
                <Check className="h-4 w-4 text-white" />
              </button>
            )}
          </div>
        </div>

        {isEditing && (
          <div className={`mb-6 p-4 ${currentTheme.card} rounded-2xl ${bgTheme === 'white' ? '' : 'backdrop-blur-sm'}`}>
            <label className={`text-sm ${currentTheme.subtext} block mb-2`}>设置考试日期</label>
            <input
              type="date"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                bgTheme === 'white' 
                  ? 'bg-white border-gray-300 text-gray-800 focus:ring-indigo-500' 
                  : 'bg-white/20 border-white/30 text-white focus:ring-white/50'
              }`}
            />
          </div>
        )}

        {/* 倒计时数字 */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { value: timeLeft.days, label: '天' },
            { value: timeLeft.hours, label: '时' },
            { value: timeLeft.minutes, label: '分' },
            { value: timeLeft.seconds, label: '秒' },
          ].map((item, i) => (
            <div key={i} className="group">
              <div className={`${currentTheme.card} ${bgTheme === 'white' ? '' : 'backdrop-blur-md'} rounded-2xl p-4 text-center border ${currentTheme.border} group-hover:scale-105 transition-all`}>
                <div className={`text-4xl font-black ${currentTheme.text} tracking-tight`}>
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className={`text-xs ${currentTheme.subtext} mt-1 font-medium`}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 激励语 */}
        <div className={`${currentTheme.card} ${bgTheme === 'white' ? '' : 'backdrop-blur-sm'} rounded-2xl p-4 text-center border ${currentTheme.border}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className={`h-4 w-4 ${bgTheme === 'white' ? 'text-yellow-500' : 'text-yellow-300'}`} />
            <span className={`text-lg font-bold ${currentTheme.text}`}>{msg.emoji} {msg.text}</span>
            <Sparkles className={`h-4 w-4 ${bgTheme === 'white' ? 'text-yellow-500' : 'text-yellow-300'}`} />
          </div>
          <p className={`text-sm ${currentTheme.subtext}`}>
            {timeLeft.days > 0 ? `距离考试还有 ${timeLeft.days} 天` : '祝你考试顺利！'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Countdown;

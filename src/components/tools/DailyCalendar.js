import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Target, Sparkles, ChevronRight, ChevronLeft, X, Settings, RefreshCw } from 'lucide-react';
import StudyCalendar from './StudyCalendar';

// 导入一言数据
import hitokotoA from '../../data/quotes_data/hitokoto_a.json';
import hitokotoB from '../../data/quotes_data/hitokoto_b.json';
import hitokotoC from '../../data/quotes_data/hitokoto_c.json';
import hitokotoD from '../../data/quotes_data/hitokoto_d.json';
import hitokotoE from '../../data/quotes_data/hitokoto_e.json';
import hitokotoI from '../../data/quotes_data/hitokoto_i.json';
import hitokotoK from '../../data/quotes_data/hitokoto_k.json';

// 格言数据映射
const QUOTE_DATA = {
  hitokoto_a: hitokotoA,
  hitokoto_b: hitokotoB,
  hitokoto_c: hitokotoC,
  hitokoto_d: hitokotoD,
  hitokoto_e: hitokotoE,
  hitokoto_i: hitokotoI,
  hitokoto_k: hitokotoK,
};

// 格言类型配置
const QUOTE_TYPES = {
  hitokoto_a: { name: '动画', icon: '🎬' },
  hitokoto_b: { name: '漫画', icon: '📚' },
  hitokoto_c: { name: '游戏', icon: '🎮' },
  hitokoto_d: { name: '文学', icon: '✍️' },
  hitokoto_e: { name: '原创', icon: '💡' },
  hitokoto_i: { name: '诗词', icon: '🎋' },
  hitokoto_k: { name: '哲学', icon: '🤔' },
};

// 星期映射
const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

// 获取农历（简化版）
const getLunarDate = (date) => {
  const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
  const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  
  // 简化处理，实际应该用农历算法
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const lunarMonth = Math.floor((dayOfYear % 365) / 30);
  const lunarDay = (dayOfYear % 30);
  
  return `${lunarMonths[lunarMonth]}${lunarDays[lunarDay]}`;
};

// 从本地数据获取随机格言
const getRandomQuote = (type) => {
  const data = QUOTE_DATA[type];
  if (!data || data.length === 0) {
    return { text: '暂无数据', author: '' };
  }
  const item = data[Math.floor(Math.random() * data.length)];
  return {
    text: item.hitokoto,
    author: item.from_who ? `${item.from_who}「${item.from}」` : `「${item.from}」`
  };
};

const DailyCalendar = ({ examDate: initialExamDate = '2025-12-20' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFlipping, setIsFlipping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [examDate, setExamDate] = useState(() => {
    return localStorage.getItem('examDate') || initialExamDate;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [tempDate, setTempDate] = useState(examDate);
  
  // 格言相关状态
  const [quote, setQuote] = useState({ text: '加载中...', author: '' });
  const [quoteType, setQuoteType] = useState(() => {
    return localStorage.getItem('quoteType') || 'hitokoto_a';
  });
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // 获取格言
  const fetchQuote = (type) => {
    const result = getRandomQuote(type);
    setQuote(result);
  };

  // 切换格言类型
  const handleTypeChange = (type) => {
    setQuoteType(type);
    localStorage.setItem('quoteType', type);
    setShowTypeSelector(false);
    fetchQuote(type);
  };

  // 刷新格言
  const handleRefreshQuote = (e) => {
    e.stopPropagation();
    fetchQuote(quoteType);
  };

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 初始加载格言
  useEffect(() => {
    fetchQuote(quoteType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 计算倒计时（天时分秒）
  const calculateCountdown = () => {
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    const now = new Date();
    const diff = exam - now;
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, total: diff };
  };

  // 点击日历展开/收起
  const handleCalendarClick = () => {
    setIsExpanded(!isExpanded);
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 300);
  };

  // 关闭日历面板
  const handleClose = (e) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  const countdown = calculateCountdown();
  const currentTypeConfig = QUOTE_TYPES[quoteType] || QUOTE_TYPES.poetry;

  return (
    <div className="relative flex justify-center">
      <div className={`flex transition-all duration-500 ease-in-out ${isExpanded ? 'gap-4' : 'gap-0'}`}>
        {/* 日历主体 */}
        <div 
          className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 cursor-pointer ${
            isFlipping ? 'animate-flip' : ''
          } ${isExpanded ? 'w-72' : 'w-80'}`}
          onClick={handleCalendarClick}
        >
          {/* 顶部红色条 */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</span>
            </div>
            <div className="flex items-center gap-1 text-white/90 text-xs">
              <Clock className="h-3 w-3" />
              <span>{currentDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* 日期主体 */}
          <div className="p-6 text-center bg-gradient-to-b from-white to-gray-50">
            {/* 大字日期 */}
            <div className="text-8xl font-black text-gray-800 leading-none mb-2">
              {currentDate.getDate()}
            </div>
            
            {/* 星期和农历 */}
            <div className="flex items-center justify-center gap-3 text-gray-500 mb-4">
              <span className="text-lg font-medium">{WEEKDAYS[currentDate.getDay()]}</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm">{getLunarDate(currentDate)}</span>
            </div>

            {/* 考研倒计时 */}
            <div className="rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">距离考研还有</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempDate(examDate);
                    setShowSettings(true);
                  }}
                  className="ml-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="设置考研日期"
                >
                  <Settings className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <div className="text-gray-800">
                {countdown.total > 0 ? (
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black">{countdown.days}</span>
                    <span className="text-sm text-gray-500">天</span>
                    <span className="text-2xl font-bold ml-2">{String(countdown.hours).padStart(2, '0')}</span>
                    <span className="text-sm text-gray-500">时</span>
                    <span className="text-2xl font-bold">{String(countdown.minutes).padStart(2, '0')}</span>
                    <span className="text-sm text-gray-500">分</span>
                    <span className="text-2xl font-bold">{String(countdown.seconds).padStart(2, '0')}</span>
                    <span className="text-sm text-gray-500">秒</span>
                  </div>
                ) : (
                  <span className="text-4xl font-black">已结束</span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">目标：{examDate}</div>
            </div>

            {/* 设置弹窗 */}
            {showSettings && (
              <div
                className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(false);
                }}
              >
                <div
                  className="bg-white rounded-xl p-6 shadow-2xl w-80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-4">设置考研日期</h3>
                  <input
                    type="date"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        setExamDate(tempDate);
                        localStorage.setItem('examDate', tempDate);
                        setShowSettings(false);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      确定
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 每日格言 */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 relative">
              <div className="flex items-center justify-center gap-1 text-amber-600 text-xs mb-2">
                <Sparkles className="h-3 w-3" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTypeSelector(!showTypeSelector);
                  }}
                  className="hover:text-amber-700 flex items-center gap-1"
                >
                  <span>{currentTypeConfig.icon} {currentTypeConfig.name}</span>
                  <ChevronRight className={`h-3 w-3 transition-transform ${showTypeSelector ? 'rotate-90' : ''}`} />
                </button>
                <button
                  onClick={handleRefreshQuote}
                  className="ml-2 p-1 hover:bg-amber-100 rounded-full transition-colors"
                  title="换一句"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
              
              {/* 类型选择器 */}
              {showTypeSelector && (
                <div 
                  className="absolute left-1/2 -translate-x-1/2 top-8 bg-white rounded-lg shadow-lg border p-2 z-20 min-w-[200px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(QUOTE_TYPES).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => handleTypeChange(key)}
                        className={`px-3 py-2 text-xs rounded-lg transition-colors text-left ${
                          quoteType === key 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {config.icon} {config.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-gray-700 text-sm leading-relaxed mb-1">"{quote.text}"</p>
              <p className="text-gray-400 text-xs">—— {quote.author}</p>
            </div>

            {/* 点击提示 */}
            <div className="mt-4 flex items-center justify-center gap-1 text-gray-400 text-xs">
              {isExpanded ? (
                <>
                  <ChevronLeft className="h-3 w-3" />
                  <span>点击收起</span>
                </>
              ) : (
                <>
                  <span>点击查看今日任务</span>
                  <ChevronRight className="h-3 w-3" />
                </>
              )}
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="h-2 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400"></div>
        </div>

        {/* 学习日历面板 - 展开时显示 */}
        <div 
          className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ${
            isExpanded ? 'w-[900px] opacity-100' : 'w-0 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {isExpanded && (
            <div className="relative">
              {/* 关闭按钮 */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
              
              {/* 嵌入学习日历 */}
              <StudyCalendar />
            </div>
          )}
        </div>
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes flip {
          0% { transform: perspective(1000px) rotateX(0deg); }
          50% { transform: perspective(1000px) rotateX(-5deg); }
          100% { transform: perspective(1000px) rotateX(0deg); }
        }
        .animate-flip {
          animation: flip 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DailyCalendar;

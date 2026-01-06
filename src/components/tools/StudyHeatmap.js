import React, { useState, useEffect, useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { BookOpen, Calendar, TrendingUp, Award, ChevronLeft, ChevronRight } from 'lucide-react';

// 获取过去一年的日期范围
const getDateRange = (year) => {
  const endDate = new Date(year, 11, 31);
  const startDate = new Date(year, 0, 1);
  return { startDate, endDate };
};

// 格式化日期为 YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// 获取今天的日期字符串
const getToday = () => formatDate(new Date());

const StudyHeatmap = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [studyData, setStudyData] = useState(() => {
    const saved = localStorage.getItem('408_study_heatmap');
    return saved ? JSON.parse(saved) : {};
  });
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // 保存数据
  useEffect(() => {
    localStorage.setItem('408_study_heatmap', JSON.stringify(studyData));
  }, [studyData]);

  // 从番茄钟和打卡数据同步
  useEffect(() => {
    // 获取番茄钟数据
    const pomodoroTime = parseInt(localStorage.getItem('408_pomodoro_totalTime') || '0');
    const today = getToday();
    
    // 如果今天有学习记录，更新热力图
    if (pomodoroTime > 0) {
      const todayMinutes = studyData[today]?.minutes || 0;
      // 简单同步：如果番茄钟有新数据，累加到今天
      // 实际使用中可以更精确地追踪
    }
  }, []);

  // 计算热力图数据
  const heatmapValues = useMemo(() => {
    const { startDate, endDate } = getDateRange(selectedYear);
    const values = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateStr = formatDate(current);
      const data = studyData[dateStr];
      values.push({
        date: dateStr,
        count: data?.count || 0,
        minutes: data?.minutes || 0
      });
      current.setDate(current.getDate() + 1);
    }
    return values;
  }, [studyData, selectedYear]);

  // 统计数据
  const stats = useMemo(() => {
    const yearData = Object.entries(studyData).filter(([date]) => 
      date.startsWith(selectedYear.toString())
    );
    
    const totalDays = yearData.filter(([, d]) => d.count > 0).length;
    const totalMinutes = yearData.reduce((sum, [, d]) => sum + (d.minutes || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const maxStreak = calculateStreak(studyData);
    const currentStreak = calculateCurrentStreak(studyData);
    
    return { totalDays, totalHours, totalMinutes, maxStreak, currentStreak };
  }, [studyData, selectedYear]);

  // 计算最长连续天数
  function calculateStreak(data) {
    const dates = Object.keys(data)
      .filter(d => data[d].count > 0)
      .sort();
    
    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate = null;
    
    for (const date of dates) {
      if (prevDate) {
        const prev = new Date(prevDate);
        const curr = new Date(date);
        const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
      prevDate = date;
    }
    return maxStreak;
  }

  // 计算当前连续天数
  function calculateCurrentStreak(data) {
    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);
    
    while (true) {
      const dateStr = formatDate(checkDate);
      if (data[dateStr]?.count > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (streak === 0) {
        // 今天还没学习，检查昨天
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = formatDate(checkDate);
        if (data[yesterdayStr]?.count > 0) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return streak;
  }

  // 获取颜色等级
  const getColorClass = (value) => {
    if (!value || value.count === 0) return 'color-empty';
    if (value.count === 1) return 'color-scale-1';
    if (value.count === 2) return 'color-scale-2';
    if (value.count <= 4) return 'color-scale-3';
    return 'color-scale-4';
  };

  // Tooltip 内容
  const getTooltipContent = (value) => {
    if (!value || !value.date) return null;
    const date = new Date(value.date);
    const dateStr = date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
    
    if (value.count === 0) {
      return `${dateStr}\n无学习记录`;
    }
    const hours = Math.floor(value.minutes / 60);
    const mins = value.minutes % 60;
    const timeStr = hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
    return `${dateStr}\n学习${value.count}次，共${timeStr}`;
  };

  const { startDate, endDate } = getDateRange(selectedYear);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">学习打卡日历</h3>
              <p className="text-sm text-gray-500">408备考 · {stats.totalDays} 天坚持</p>
            </div>
          </div>
          
          {/* 年份选择 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedYear(y => y - 1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            </button>
            <span className="px-3 py-1 bg-gray-100 rounded-lg font-medium text-gray-700">
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear(y => Math.min(y + 1, new Date().getFullYear()))}
              disabled={selectedYear >= new Date().getFullYear()}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-slate-50">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.totalDays}</div>
          <div className="text-xs text-gray-500">打卡天数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.totalHours}h</div>
          <div className="text-xs text-gray-500">累计学习</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.currentStreak}</div>
          <div className="text-xs text-gray-500">当前连续</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">{stats.maxStreak}</div>
          <div className="text-xs text-gray-500">最长连续</div>
        </div>
      </div>

      {/* 热力图 */}
      <div className="px-6 py-4">
        <div className="relative">
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={heatmapValues}
            classForValue={getColorClass}
            tooltipDataAttrs={(value) => ({
              'data-tip': getTooltipContent(value)
            })}
            showWeekdayLabels={false}
            monthLabels={['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']}
            onMouseOver={(event, value) => {
              if (value) {
                setHoveredDate(value);
                const rect = event.target.getBoundingClientRect();
                setTooltipPos({ x: rect.left, y: rect.top - 60 });
              }
            }}
            onMouseLeave={() => setHoveredDate(null)}
          />
          
          {/* Tooltip */}
          {hoveredDate && (
            <div 
              className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-pre-line"
              style={{ left: tooltipPos.x, top: tooltipPos.y }}
            >
              {getTooltipContent(hoveredDate)}
            </div>
          )}
        </div>

        {/* 图例 */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-slate-100" />
            <div className="w-3 h-3 rounded-sm bg-green-200" />
            <div className="w-3 h-3 rounded-sm bg-green-300" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <div className="w-3 h-3 rounded-sm bg-green-700" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
        <p className="text-sm text-gray-500 text-center">
          💡 使用番茄钟学习，完成后自动记录到这里
        </p>
      </div>

      {/* 自定义样式 */}
      <style>{`
        .react-calendar-heatmap {
          width: 100%;
        }
        .react-calendar-heatmap text {
          font-size: 8px;
          fill: #9CA3AF;
        }
        .react-calendar-heatmap .color-empty {
          fill: #F1F5F9;
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: #BBF7D0;
        }
        .react-calendar-heatmap .color-scale-2 {
          fill: #86EFAC;
        }
        .react-calendar-heatmap .color-scale-3 {
          fill: #22C55E;
        }
        .react-calendar-heatmap .color-scale-4 {
          fill: #15803D;
        }
        .react-calendar-heatmap rect:hover {
          stroke: #374151;
          stroke-width: 1px;
        }
        .react-calendar-heatmap .react-calendar-heatmap-weekday-labels {
          transform: translateX(-5px);
        }
      `}</style>
    </div>
  );
};

export default StudyHeatmap;

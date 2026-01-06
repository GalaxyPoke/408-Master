import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, X, Calendar as CalendarIcon, Clock, Tag, Trash2, Edit2, Check, BookOpen, Code, Cpu, Network } from 'lucide-react';

// 设置中文
moment.locale('zh-cn');
const localizer = momentLocalizer(moment);

// 科目配置
const SUBJECTS = {
  ds: { name: '数据结构', color: '#3B82F6', icon: Code },
  co: { name: '计算机组成', color: '#8B5CF6', icon: Cpu },
  os: { name: '操作系统', color: '#10B981', icon: BookOpen },
  cn: { name: '计算机网络', color: '#F59E0B', icon: Network },
  other: { name: '其他', color: '#6B7280', icon: Tag }
};

// 事件类型
const EVENT_TYPES = {
  study: { name: '学习', color: '#3B82F6' },
  review: { name: '复习', color: '#10B981' },
  exercise: { name: '刷题', color: '#F59E0B' },
  exam: { name: '模考', color: '#EF4444' },
  rest: { name: '休息', color: '#6B7280' }
};

// 中文消息
const messages = {
  allDay: '全天',
  previous: '上一页',
  next: '下一页',
  today: '今天',
  month: '月',
  week: '周',
  day: '日',
  agenda: '日程',
  date: '日期',
  time: '时间',
  event: '事件',
  noEventsInRange: '该时间段没有事件',
  showMore: total => `+${total} 更多`
};

const StudyCalendar = ({ onClose }) => {
  // 事件列表
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('408_calendar_events');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(e => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end)
      }));
    }
    return [];
  });

  // 弹窗状态
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    subject: 'ds',
    type: 'study',
    start: new Date(),
    end: new Date(),
    allDay: false,
    description: ''
  });

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('408_calendar_events', JSON.stringify(events));
  }, [events]);

  // 选择时间段创建事件
  const handleSelectSlot = useCallback(({ start, end }) => {
    setSelectedSlot({ start, end });
    setSelectedEvent(null);
    setFormData({
      title: '',
      subject: 'ds',
      type: 'study',
      start,
      end,
      allDay: false,
      description: ''
    });
    setShowEventModal(true);
  }, []);

  // 点击事件编辑
  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setFormData({
      title: event.title,
      subject: event.subject || 'ds',
      type: event.type || 'study',
      start: event.start,
      end: event.end,
      allDay: event.allDay || false,
      description: event.description || ''
    });
    setShowEventModal(true);
  }, []);

  // 保存事件
  const handleSaveEvent = () => {
    if (!formData.title.trim()) return;

    const eventData = {
      id: selectedEvent?.id || Date.now(),
      title: formData.title,
      subject: formData.subject,
      type: formData.type,
      start: formData.start,
      end: formData.end,
      allDay: formData.allDay,
      description: formData.description
    };

    if (selectedEvent) {
      setEvents(events.map(e => e.id === selectedEvent.id ? eventData : e));
    } else {
      setEvents([...events, eventData]);
    }

    setShowEventModal(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  // 删除事件
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setShowEventModal(false);
      setSelectedEvent(null);
    }
  };

  // 自定义事件样式
  const eventStyleGetter = (event) => {
    const subject = SUBJECTS[event.subject] || SUBJECTS.other;
    return {
      style: {
        backgroundColor: subject.color,
        borderRadius: '4px',
        color: 'white',
        border: 'none',
        fontSize: '12px',
        fontWeight: '500',
        overflow: 'hidden'
      }
    };
  };

  // 自定义事件组件 - 前缀和内容两个块拼接
  const EventComponent = ({ event }) => {
    const type = EVENT_TYPES[event.type] || EVENT_TYPES.study;
    return (
      <div className="flex items-center h-full w-full">
        <div 
          className="h-full flex items-center px-2 text-xs font-bold shrink-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
        >
          {type.name}
        </div>
        <div className="flex-1 truncate px-2 font-medium">
          {event.title}
        </div>
      </div>
    );
  };

  // 快速添加学习计划
  const addQuickPlan = (subject, hours = 2) => {
    const start = new Date();
    start.setHours(start.getHours() + 1, 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + hours);

    const subjectInfo = SUBJECTS[subject];
    const newEvent = {
      id: Date.now(),
      title: `${subjectInfo.name}学习`,
      subject,
      type: 'study',
      start,
      end,
      allDay: false,
      description: ''
    };
    setEvents([...events, newEvent]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">学习日历</h2>
            <p className="text-sm text-gray-500">规划你的408复习计划</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 快速添加按钮 */}
          <div className="hidden md:flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-500">快速添加:</span>
            {Object.entries(SUBJECTS).filter(([k]) => k !== 'other').map(([key, subject]) => {
              const Icon = subject.icon;
              return (
                <button
                  key={key}
                  onClick={() => addQuickPlan(key)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: subject.color + '20', color: subject.color }}
                  title={`添加${subject.name}学习计划`}
                >
                  <Icon className="h-3 w-3" />
                  {subject.name}
                </button>
              );
            })}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* 日历主体 */}
      <div className="flex-1 p-4 bg-gray-50">
        <div className="h-full bg-white rounded-xl shadow-sm p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent
            }}
            messages={messages}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="week"
            step={30}
            timeslots={2}
            min={new Date(2024, 0, 1, 6, 0)}
            max={new Date(2024, 0, 1, 23, 0)}
            formats={{
              dayFormat: 'D ddd',
              dayHeaderFormat: 'M月D日 dddd',
              dayRangeHeaderFormat: ({ start, end }) =>
                `${moment(start).format('M月D日')} - ${moment(end).format('M月D日')}`,
              monthHeaderFormat: 'YYYY年M月',
              weekdayFormat: 'ddd'
            }}
          />
        </div>
      </div>

      {/* 事件编辑弹窗 */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">
                {selectedEvent ? '编辑计划' : '新建计划'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：数据结构第三章"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 科目选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">科目</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(SUBJECTS).map(([key, subject]) => {
                    const Icon = subject.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setFormData({ ...formData, subject: key })}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                          formData.subject === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" style={{ color: subject.color }} />
                        <span className="text-xs">{subject.name.slice(0, 2)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(EVENT_TYPES).map(([key, type]) => (
                    <button
                      key={key}
                      onClick={() => setFormData({ ...formData, type: key })}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        formData.type === key
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={formData.type === key ? { backgroundColor: type.color } : {}}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 时间选择 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                  <input
                    type="datetime-local"
                    value={moment(formData.start).format('YYYY-MM-DDTHH:mm')}
                    onChange={(e) => setFormData({ ...formData, start: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                  <input
                    type="datetime-local"
                    value={moment(formData.end).format('YYYY-MM-DDTHH:mm')}
                    onChange={(e) => setFormData({ ...formData, end: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* 全天事件 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allDay}
                  onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">全天事件</span>
              </label>

              {/* 备注 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="添加备注..."
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              {selectedEvent ? (
                <button
                  onClick={handleDeleteEvent}
                  className="flex items-center gap-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  删除
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEvent}
                  disabled={!formData.title.trim()}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 自定义样式 */}
      <style>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 8px;
          font-weight: 600;
          color: #374151;
        }
        .rbc-today {
          background-color: #EFF6FF;
        }
        .rbc-current-time-indicator {
          background-color: #EF4444;
        }
        .rbc-time-view {
          border-radius: 8px;
          overflow: hidden;
        }
        .rbc-time-header {
          border-bottom: 1px solid #E5E7EB;
        }
        .rbc-time-content {
          border-top: none;
        }
        .rbc-timeslot-group {
          min-height: 60px;
        }
        .rbc-event {
          padding: 0 !important;
          border: none !important;
          border-radius: 4px !important;
          overflow: hidden;
        }
        .rbc-event-content {
          height: 100%;
          width: 100%;
          padding: 4px 8px;
        }
        .rbc-event-label {
          display: none;
        }
        .rbc-day-slot .rbc-event {
          border: none !important;
          border-radius: 4px !important;
          margin: 1px 2px !important;
          right: 2px !important;
        }
        .rbc-day-slot .rbc-event-content {
          height: 100%;
        }
        .rbc-day-slot .rbc-events-container {
          margin-right: 0 !important;
          left: 0 !important;
          right: 0 !important;
        }
        .rbc-event.rbc-selected {
          outline: 2px solid #1E40AF;
          z-index: 10;
        }
        .rbc-row-segment .rbc-event {
          border-radius: 4px !important;
          margin: 1px 2px !important;
        }
        .rbc-row-segment {
          padding: 0 2px !important;
        }
        .rbc-row-content {
          z-index: 1;
        }
        .rbc-toolbar {
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .rbc-toolbar button {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #E5E7EB;
          background: white;
          color: #374151;
          font-size: 14px;
        }
        .rbc-toolbar button:hover {
          background: #F3F4F6;
        }
        .rbc-toolbar button.rbc-active {
          background: #3B82F6;
          color: white;
          border-color: #3B82F6;
        }
        .rbc-btn-group button:first-child {
          border-radius: 6px 0 0 6px;
        }
        .rbc-btn-group button:last-child {
          border-radius: 0 6px 6px 0;
        }
        .rbc-toolbar-label {
          font-weight: 600;
          font-size: 18px;
          color: #111827;
        }
        .rbc-month-view {
          border-radius: 8px;
          overflow: hidden;
        }
        .rbc-date-cell {
          padding: 4px 8px;
          text-align: right;
        }
        .rbc-off-range-bg {
          background: #F9FAFB;
        }
        .rbc-show-more {
          color: #3B82F6;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default StudyCalendar;

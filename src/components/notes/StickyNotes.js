import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, X, Pin, PinOff, Trash2, Edit3, Check, Palette,
  Maximize2, Minimize2, GripVertical, Clock, AlertCircle,
  BookOpen, Cpu, HardDrive, Network
} from 'lucide-react';

// 便签颜色
const NOTE_COLORS = [
  { id: 'yellow', bg: 'bg-yellow-100', border: 'border-yellow-300', header: 'bg-yellow-200' },
  { id: 'green', bg: 'bg-green-100', border: 'border-green-300', header: 'bg-green-200' },
  { id: 'blue', bg: 'bg-blue-100', border: 'border-blue-300', header: 'bg-blue-200' },
  { id: 'pink', bg: 'bg-pink-100', border: 'border-pink-300', header: 'bg-pink-200' },
  { id: 'purple', bg: 'bg-purple-100', border: 'border-purple-300', header: 'bg-purple-200' },
  { id: 'orange', bg: 'bg-orange-100', border: 'border-orange-300', header: 'bg-orange-200' },
];

// 科目标签
const SUBJECTS = [
  { id: 'ds', name: '数据结构', icon: BookOpen, color: 'text-blue-600' },
  { id: 'co', name: '计组', icon: Cpu, color: 'text-purple-600' },
  { id: 'os', name: '操作系统', icon: HardDrive, color: 'text-green-600' },
  { id: 'cn', name: '网络', icon: Network, color: 'text-orange-600' },
];

// 单个便签组件
const StickyNote = ({ note, onUpdate, onDelete, onPin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editTitle, setEditTitle] = useState(note.title);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState(note.position || { x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const noteRef = useRef(null);

  const colorConfig = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];
  const subject = SUBJECTS.find(s => s.id === note.subject);

  // 保存编辑
  const saveEdit = () => {
    onUpdate(note.id, { 
      title: editTitle, 
      content: editContent,
      updatedAt: new Date().toISOString()
    });
    setIsEditing(false);
  };

  // 修改颜色
  const changeColor = (colorId) => {
    onUpdate(note.id, { color: colorId });
    setShowColorPicker(false);
  };

  // 拖拽开始
  const handleDragStart = (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    setIsDragging(true);
    const rect = noteRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // 拖拽中
  const handleDrag = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
  };

  // 拖拽结束
  const handleDragEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      onUpdate(note.id, { position });
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={noteRef}
      className={`absolute w-64 rounded-lg shadow-lg border-2 ${colorConfig.bg} ${colorConfig.border} transition-shadow hover:shadow-xl ${
        isDragging ? 'cursor-grabbing shadow-2xl z-50' : 'cursor-grab'
      } ${note.pinned ? 'ring-2 ring-amber-400' : ''}`}
      style={{ 
        left: position.x, 
        top: position.y,
        zIndex: note.pinned ? 40 : 10
      }}
      onMouseDown={handleDragStart}
    >
      {/* 便签头部 */}
      <div className={`flex items-center justify-between px-3 py-2 ${colorConfig.header} rounded-t-lg`}>
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-slate-400" />
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium w-24"
              placeholder="标题..."
            />
          ) : (
            <span className="text-sm font-medium truncate max-w-[120px]">
              {note.title || '便签'}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {subject && (
            <span className={`text-xs ${subject.color}`}>
              {subject.name}
            </span>
          )}
          <button
            onClick={() => onPin(note.id)}
            className={`p-1 rounded hover:bg-white/50 ${note.pinned ? 'text-amber-600' : 'text-slate-400'}`}
            title={note.pinned ? '取消置顶' : '置顶'}
          >
            {note.pinned ? <Pin size={14} /> : <PinOff size={14} />}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-white/50 text-slate-400"
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1 rounded hover:bg-red-200 text-red-500"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 便签内容 */}
      {!isMinimized && (
        <div className="p-3">
          {isEditing ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-32 bg-transparent border-none outline-none resize-none text-sm"
                placeholder="写点什么..."
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="p-1 rounded hover:bg-white/50"
                  >
                    <Palette size={16} />
                  </button>
                  {showColorPicker && (
                    <div className="absolute bottom-full left-0 mb-1 p-2 bg-white rounded-lg shadow-lg flex gap-1 z-10">
                      {NOTE_COLORS.map(color => (
                        <button
                          key={color.id}
                          onClick={() => changeColor(color.id)}
                          className={`w-6 h-6 rounded-full ${color.bg} ${color.border} border-2 hover:scale-110 transition-transform`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 text-xs text-slate-500 hover:bg-white/50 rounded"
                  >
                    取消
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-2 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-800"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="min-h-[80px] text-sm whitespace-pre-wrap cursor-text"
            >
              {note.content || <span className="text-slate-400 italic">点击编辑...</span>}
            </div>
          )}

          {/* 提醒时间 */}
          {note.reminder && !isEditing && (
            <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1 text-xs text-amber-600">
              <Clock size={12} />
              {new Date(note.reminder).toLocaleString()}
            </div>
          )}

          {/* 重要标记 */}
          {note.important && !isEditing && (
            <div className="mt-2 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle size={12} />
              重要
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 便签板组件
const StickyNotes = ({ embedded = false }) => {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('408_sticky_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    color: 'yellow',
    subject: '',
    important: false
  });
  const containerRef = useRef(null);

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('408_sticky_notes', JSON.stringify(notes));
  }, [notes]);

  // 添加便签
  const addNote = () => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const randomX = Math.random() * (containerRect?.width - 280 || 400) + 20;
    const randomY = Math.random() * 200 + 100;

    const note = {
      id: `sticky_${Date.now()}`,
      ...newNote,
      position: { x: randomX, y: randomY },
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNotes(prev => [...prev, note]);
    setNewNote({ title: '', content: '', color: 'yellow', subject: '', important: false });
    setShowAddForm(false);
  };

  // 更新便签
  const updateNote = (id, updates) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, ...updates } : note
    ));
  };

  // 删除便签
  const deleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  // 置顶便签
  const pinNote = (id) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, pinned: !note.pinned } : note
    ));
  };

  // 清空所有便签
  const clearAll = () => {
    if (window.confirm('确定要清空所有便签吗？')) {
      setNotes([]);
    }
  };

  if (embedded) {
    // 嵌入模式 - 简化显示
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            📌 便签板
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm"
          >
            <Plus size={16} />
            添加
          </button>
        </div>

        {/* 便签列表 */}
        <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-slate-400">
              暂无便签，点击"添加"创建
            </div>
          ) : (
            notes.slice(0, 6).map(note => {
              const colorConfig = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];
              return (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg ${colorConfig.bg} ${colorConfig.border} border`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm truncate">{note.title || '便签'}</span>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 hover:bg-white/50 rounded text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-3">{note.content}</p>
                </div>
              );
            })
          )}
        </div>

        {/* 添加表单弹窗 */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
              <h3 className="text-lg font-semibold mb-4">新建便签</h3>
              
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="标题（可选）"
                className="w-full px-3 py-2 border rounded-lg mb-3"
              />

              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                placeholder="便签内容..."
                className="w-full px-3 py-2 border rounded-lg h-24 resize-none mb-3"
              />

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">颜色:</span>
                  {NOTE_COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => setNewNote(prev => ({ ...prev, color: color.id }))}
                      className={`w-6 h-6 rounded-full ${color.bg} ${color.border} border-2 ${
                        newNote.color === color.id ? 'ring-2 ring-slate-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <select
                  value={newNote.subject}
                  onChange={(e) => setNewNote(prev => ({ ...prev, subject: e.target.value }))}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">选择科目</option>
                  {SUBJECTS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newNote.important}
                    onChange={(e) => setNewNote(prev => ({ ...prev, important: e.target.checked }))}
                    className="rounded"
                  />
                  标记为重要
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={addNote}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 全屏便签板模式
  return (
    <div className="min-h-screen bg-slate-100">
      {/* 顶部工具栏 */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📌 便签板</h1>
          <p className="text-sm text-slate-500">{notes.length} 个便签 · 拖拽移动位置</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearAll}
            disabled={notes.length === 0}
            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
          >
            清空全部
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            <Plus size={18} />
            新建便签
          </button>
        </div>
      </div>

      {/* 便签区域 */}
      <div
        ref={containerRef}
        className="relative min-h-[calc(100vh-80px)] p-4"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {notes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg">还没有便签</p>
              <p className="text-sm">点击"新建便签"开始记录重要内容</p>
            </div>
          </div>
        ) : (
          notes.map(note => (
            <StickyNote
              key={note.id}
              note={note}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onPin={pinNote}
            />
          ))
        )}
      </div>

      {/* 添加表单弹窗 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">新建便签</h3>
            
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              placeholder="标题（可选）"
              className="w-full px-3 py-2 border rounded-lg mb-3"
            />

            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              placeholder="便签内容..."
              className="w-full px-3 py-2 border rounded-lg h-32 resize-none mb-3"
              autoFocus
            />

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">颜色:</span>
                {NOTE_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setNewNote(prev => ({ ...prev, color: color.id }))}
                    className={`w-6 h-6 rounded-full ${color.bg} ${color.border} border-2 hover:scale-110 transition-transform ${
                      newNote.color === color.id ? 'ring-2 ring-slate-400' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <select
                value={newNote.subject}
                onChange={(e) => setNewNote(prev => ({ ...prev, subject: e.target.value }))}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">选择科目（可选）</option>
                {SUBJECTS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNote.important}
                  onChange={(e) => setNewNote(prev => ({ ...prev, important: e.target.checked }))}
                  className="rounded"
                />
                标记为重要
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={addNote}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                创建便签
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StickyNotes;

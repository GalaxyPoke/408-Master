import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Edit3, Save, X, Tag } from 'lucide-react';

const NotesBook = () => {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('408_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'ds', type: 'note' });
  const [filter, setFilter] = useState('all');

  const categories = [
    { id: 'ds', name: '数据结构', color: 'blue' },
    { id: 'co', name: '计算机组成', color: 'purple' },
    { id: 'os', name: '操作系统', color: 'green' },
    { id: 'cn', name: '计算机网络', color: 'orange' },
  ];

  const types = [
    { id: 'note', name: '笔记', icon: '📝' },
    { id: 'mistake', name: '错题', icon: '❌' },
    { id: 'important', name: '重点', icon: '⭐' },
  ];

  const saveNotes = (newNotes) => {
    setNotes(newNotes);
    localStorage.setItem('408_notes', JSON.stringify(newNotes));
  };

  const addNote = () => {
    if (!newNote.title.trim()) return;
    const note = {
      id: Date.now(),
      ...newNote,
      createdAt: new Date().toISOString(),
    };
    saveNotes([note, ...notes]);
    setNewNote({ title: '', content: '', category: 'ds', type: 'note' });
    setIsAdding(false);
  };

  const deleteNote = (id) => {
    saveNotes(notes.filter(n => n.id !== id));
  };

  const updateNote = (id, updates) => {
    saveNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
    setEditingId(null);
  };

  const filteredNotes = notes.filter(n => {
    if (filter === 'all') return true;
    if (['ds', 'co', 'os', 'cn'].includes(filter)) return n.category === filter;
    return n.type === filter;
  });

  const getCategoryColor = (catId) => {
    const cat = categories.find(c => c.id === catId);
    const colors = {
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700',
      green: 'bg-green-100 text-green-700',
      orange: 'bg-orange-100 text-orange-700',
    };
    return colors[cat?.color] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-indigo-600" />
          笔记 & 错题本
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm"
        >
          <Plus className="h-4 w-4" /> 添加
        </button>
      </div>

      {/* 筛选器 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm transition-all ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          全部 ({notes.length})
        </button>
        {types.map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${filter === t.id ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {t.icon} {t.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${filter === c.id ? 'bg-gray-800 text-white' : getCategoryColor(c.id)}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* 添加表单 */}
      {isAdding && (
        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
          <input
            type="text"
            placeholder="标题"
            value={newNote.title}
            onChange={e => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <textarea
            placeholder="内容..."
            value={newNote.content}
            onChange={e => setNewNote({ ...newNote, content: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg mb-2 h-24 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div className="flex gap-2 mb-3">
            <select
              value={newNote.category}
              onChange={e => setNewNote({ ...newNote, category: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={newNote.type}
              onChange={e => setNewNote({ ...newNote, type: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {types.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addNote} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1">
              <Save className="h-4 w-4" /> 保存
            </button>
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center gap-1">
              <X className="h-4 w-4" /> 取消
            </button>
          </div>
        </div>
      )}

      {/* 笔记列表 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无笔记，点击"添加"开始记录
          </div>
        ) : (
          filteredNotes.map(note => (
            <div key={note.id} className="p-4 border rounded-xl hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{types.find(t => t.id === note.type)?.icon}</span>
                  <h3 className="font-semibold">{note.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => deleteNote(note.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2 whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(note.category)}`}>
                  {categories.find(c => c.id === note.category)?.name}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesBook;

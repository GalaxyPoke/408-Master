import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Plus, Trash2, Edit3, Save, X, Link2, Tag, Clock,
  BookOpen, Cpu, HardDrive, Network, ChevronRight, ChevronDown,
  FileText, Filter, SortAsc, Grid, List, ExternalLink, ArrowLeft
} from 'lucide-react';

// 科目配置
const SUBJECTS = [
  { id: 'ds', name: '数据结构', icon: BookOpen, color: 'blue' },
  { id: 'co', name: '计算机组成', icon: Cpu, color: 'purple' },
  { id: 'os', name: '操作系统', icon: HardDrive, color: 'green' },
  { id: 'cn', name: '计算机网络', icon: Network, color: 'orange' },
];

const colorClasses = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
};

const KnowledgeBase = () => {
  // 从localStorage加载数据
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('408_knowledge_base');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', subject: 'ds', tags: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterTag, setFilterTag] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [sortBy, setSortBy] = useState('updated'); // updated | created | title
  const [newTag, setNewTag] = useState('');
  const [showBacklinks, setShowBacklinks] = useState(true);

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('408_knowledge_base', JSON.stringify(notes));
  }, [notes]);

  // 获取所有标签
  const allTags = useMemo(() => {
    const tags = new Set();
    notes.forEach(note => note.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [notes]);

  // 解析双向链接 [[标题]]
  const parseLinks = (content) => {
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      links.push(match[1]);
    }
    return links;
  };

  // 获取反向链接（哪些笔记链接到当前笔记）
  const getBacklinks = (noteTitle) => {
    return notes.filter(note => {
      const links = parseLinks(note.content);
      return links.some(link => link.toLowerCase() === noteTitle.toLowerCase());
    });
  };

  // 过滤和排序笔记
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 科目过滤
    if (filterSubject !== 'all') {
      result = result.filter(note => note.subject === filterSubject);
    }

    // 标签过滤
    if (filterTag) {
      result = result.filter(note => note.tags?.includes(filterTag));
    }

    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'updated':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

    return result;
  }, [notes, searchQuery, filterSubject, filterTag, sortBy]);

  // 创建新笔记
  const createNote = () => {
    setEditForm({ title: '', content: '', subject: 'ds', tags: [] });
    setIsEditing(true);
    setSelectedNote(null);
  };

  // 编辑笔记
  const editNote = (note) => {
    setEditForm({
      title: note.title,
      content: note.content,
      subject: note.subject,
      tags: note.tags || []
    });
    setIsEditing(true);
  };

  // 保存笔记
  const saveNote = () => {
    if (!editForm.title.trim()) return;

    const now = new Date().toISOString();
    
    if (selectedNote) {
      // 更新现有笔记
      setNotes(prev => prev.map(note =>
        note.id === selectedNote.id
          ? { ...note, ...editForm, updatedAt: now }
          : note
      ));
      setSelectedNote({ ...selectedNote, ...editForm, updatedAt: now });
    } else {
      // 创建新笔记
      const newNote = {
        id: `note_${Date.now()}`,
        ...editForm,
        createdAt: now,
        updatedAt: now
      };
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
    }

    setIsEditing(false);
  };

  // 删除笔记
  const deleteNote = (noteId) => {
    if (!window.confirm('确定要删除这个知识点吗？')) return;
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  // 添加标签
  const addTag = () => {
    if (newTag.trim() && !editForm.tags.includes(newTag.trim())) {
      setEditForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // 移除标签
  const removeTag = (tag) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // 点击链接跳转
  const handleLinkClick = (linkTitle) => {
    const linkedNote = notes.find(note => 
      note.title.toLowerCase() === linkTitle.toLowerCase()
    );
    if (linkedNote) {
      setSelectedNote(linkedNote);
      setIsEditing(false);
    } else {
      // 创建新笔记
      if (window.confirm(`"${linkTitle}" 不存在，是否创建？`)) {
        setEditForm({ title: linkTitle, content: '', subject: 'ds', tags: [] });
        setIsEditing(true);
        setSelectedNote(null);
      }
    }
  };

  // 渲染内容（处理双向链接）
  const renderContent = (content) => {
    if (!content) return null;
    
    const parts = content.split(/(\[\[[^\]]+\]\])/g);
    
    return parts.map((part, index) => {
      const linkMatch = part.match(/\[\[([^\]]+)\]\]/);
      if (linkMatch) {
        const linkTitle = linkMatch[1];
        const linkedNote = notes.find(n => n.title.toLowerCase() === linkTitle.toLowerCase());
        return (
          <button
            key={index}
            onClick={() => handleLinkClick(linkTitle)}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-sm ${
              linkedNote 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
          >
            <Link2 size={12} />
            {linkTitle}
            {!linkedNote && <span className="text-xs">(未创建)</span>}
          </button>
        );
      }
      // 处理换行
      return part.split('\n').map((line, i) => (
        <React.Fragment key={`${index}-${i}`}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ));
    });
  };

  // 获取科目信息
  const getSubjectInfo = (subjectId) => {
    return SUBJECTS.find(s => s.id === subjectId) || SUBJECTS[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="text-blue-600" />
              知识库
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {notes.length} 个知识点 · 支持双向链接 [[链接]]
            </p>
          </div>
          <button
            onClick={createNote}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            新建知识点
          </button>
        </div>

        <div className="flex gap-6">
          {/* 左侧列表 */}
          <div className={`${selectedNote ? 'w-1/3' : 'w-full'} transition-all`}>
            {/* 搜索和过滤 */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索知识点..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
                </button>
              </div>

              {/* 科目筛选 */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => setFilterSubject('all')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    filterSubject === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  全部
                </button>
                {SUBJECTS.map(subject => {
                  const Icon = subject.icon;
                  const colors = colorClasses[subject.color];
                  return (
                    <button
                      key={subject.id}
                      onClick={() => setFilterSubject(subject.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all ${
                        filterSubject === subject.id 
                          ? 'bg-slate-800 text-white' 
                          : `${colors.bg} ${colors.text} hover:opacity-80`
                      }`}
                    >
                      <Icon size={14} />
                      {subject.name}
                    </button>
                  );
                })}
              </div>

              {/* 标签筛选 */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <Tag size={14} className="text-slate-400 mt-1" />
                  {allTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                      className={`px-2 py-0.5 rounded text-xs transition-all ${
                        filterTag === tag
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 笔记列表 */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
              {filteredNotes.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-slate-500">
                  {searchQuery || filterSubject !== 'all' || filterTag
                    ? '没有找到匹配的知识点'
                    : '还没有知识点，点击"新建知识点"开始'}
                </div>
              ) : (
                filteredNotes.map(note => {
                  const subject = getSubjectInfo(note.subject);
                  const colors = colorClasses[subject.color];
                  const links = parseLinks(note.content);
                  const backlinks = getBacklinks(note.title);

                  return (
                    <div
                      key={note.id}
                      onClick={() => { setSelectedNote(note); setIsEditing(false); }}
                      className={`bg-white rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedNote?.id === note.id ? 'ring-2 ring-blue-500' : 'shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-slate-800 line-clamp-1">{note.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${colors.bg} ${colors.text}`}>
                          {subject.name}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                        {note.content.replace(/\[\[[^\]]+\]\]/g, '').slice(0, 100)}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          {links.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Link2 size={12} /> {links.length}
                            </span>
                          )}
                          {backlinks.length > 0 && (
                            <span className="flex items-center gap-1 text-green-600">
                              <ArrowLeft size={12} /> {backlinks.length}
                            </span>
                          )}
                        </div>
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>

                      {note.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 右侧详情/编辑 */}
          {selectedNote && (
            <div className="w-2/3 bg-white rounded-xl shadow-sm overflow-hidden">
              {isEditing ? (
                /* 编辑模式 */
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                    <span className="font-medium">
                      {selectedNote ? '编辑知识点' : '新建知识点'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        取消
                      </button>
                      <button
                        onClick={saveNote}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Save size={16} />
                        保存
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-auto">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="知识点标题"
                      className="w-full text-xl font-medium border-none outline-none mb-4"
                    />

                    <div className="flex items-center gap-4 mb-4">
                      <select
                        value={editForm.subject}
                        onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                        className="px-3 py-2 border rounded-lg"
                      >
                        {SUBJECTS.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>

                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addTag()}
                          placeholder="添加标签..."
                          className="flex-1 px-3 py-2 border rounded-lg"
                        />
                        <button onClick={addTag} className="p-2 hover:bg-slate-100 rounded-lg">
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>

                    {editForm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {editForm.tags.map(tag => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm"
                          >
                            #{tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-red-600">
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="输入内容... 使用 [[标题]] 创建双向链接"
                      className="w-full h-64 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                    />

                    <p className="text-xs text-slate-400 mt-2">
                      提示：使用 [[知识点标题]] 创建双向链接
                    </p>
                  </div>
                </div>
              ) : (
                /* 查看模式 */
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const subject = getSubjectInfo(selectedNote.subject);
                        const Icon = subject.icon;
                        const colors = colorClasses[subject.color];
                        return (
                          <span className={`flex items-center gap-1 px-2 py-1 rounded ${colors.bg} ${colors.text}`}>
                            <Icon size={14} />
                            {subject.name}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editNote(selectedNote)}
                        className="flex items-center gap-1 px-3 py-1.5 hover:bg-slate-200 rounded-lg"
                      >
                        <Edit3 size={16} />
                        编辑
                      </button>
                      <button
                        onClick={() => deleteNote(selectedNote.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                        删除
                      </button>
                      <button
                        onClick={() => setSelectedNote(null)}
                        className="p-1.5 hover:bg-slate-200 rounded-lg"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-auto">
                    <h1 className="text-2xl font-bold text-slate-800 mb-4">{selectedNote.title}</h1>

                    {selectedNote.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedNote.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="prose prose-slate max-w-none mb-6">
                      {renderContent(selectedNote.content)}
                    </div>

                    {/* 反向链接 */}
                    {showBacklinks && (() => {
                      const backlinks = getBacklinks(selectedNote.title);
                      if (backlinks.length === 0) return null;
                      
                      return (
                        <div className="mt-6 pt-6 border-t">
                          <h3 className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2">
                            <ArrowLeft size={16} />
                            反向链接 ({backlinks.length})
                          </h3>
                          <div className="space-y-2">
                            {backlinks.map(note => (
                              <button
                                key={note.id}
                                onClick={() => setSelectedNote(note)}
                                className="w-full text-left p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <div className="font-medium text-slate-800">{note.title}</div>
                                <div className="text-sm text-slate-500 line-clamp-1">
                                  {note.content.slice(0, 100)}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="mt-6 pt-4 border-t text-xs text-slate-400 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        创建于 {new Date(selectedNote.createdAt).toLocaleString()}
                      </span>
                      <span>
                        更新于 {new Date(selectedNote.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 新建笔记面板 */}
          {!selectedNote && isEditing && (
            <div className="w-2/3 bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                  <span className="font-medium">新建知识点</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      取消
                    </button>
                    <button
                      onClick={saveNote}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Save size={16} />
                      保存
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-auto">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="知识点标题"
                    className="w-full text-xl font-medium border-none outline-none mb-4"
                    autoFocus
                  />

                  <div className="flex items-center gap-4 mb-4">
                    <select
                      value={editForm.subject}
                      onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="px-3 py-2 border rounded-lg"
                    >
                      {SUBJECTS.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>

                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTag()}
                        placeholder="添加标签..."
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <button onClick={addTag} className="p-2 hover:bg-slate-100 rounded-lg">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {editForm.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {editForm.tags.map(tag => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm"
                        >
                          #{tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-red-600">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="输入内容... 使用 [[标题]] 创建双向链接"
                    className="w-full h-64 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  />

                  <p className="text-xs text-slate-400 mt-2">
                    提示：使用 [[知识点标题]] 创建双向链接，链接到其他知识点
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;

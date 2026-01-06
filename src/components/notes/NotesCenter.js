import React, { useState } from 'react';
import {
  FileText, Brain, BookOpen, StickyNote, PenTool, Edit3,
  ChevronRight, Plus, Search, Filter, Clock, Star,
  BookOpen as BookIcon, Cpu, HardDrive, Network
} from 'lucide-react';
import MindMapPro from './MindMapPro';
import MarkdownEditorPro from './MarkdownEditorPro';
import KnowledgeBase from './KnowledgeBase';
import StickyNotes from './StickyNotes';

// 功能卡片配置
const FEATURES = [
  {
    id: 'mindmap',
    name: '思维导图',
    icon: Brain,
    color: 'from-purple-500 to-indigo-600',
    description: '可视化知识结构，梳理408各科目知识点',
    features: ['408科目模板', '自由拖拽节点', '导出图片']
  },
  {
    id: 'markdown',
    name: 'Markdown笔记',
    icon: Edit3,
    color: 'from-blue-500 to-cyan-600',
    description: '专业的Markdown编辑器，实时预览',
    features: ['实时预览', '快捷键支持', '模板库']
  },
  {
    id: 'knowledge',
    name: '知识库',
    icon: BookOpen,
    color: 'from-green-500 to-emerald-600',
    description: '构建知识网络，支持双向链接',
    features: ['双向链接', '标签分类', '全文搜索']
  },
  {
    id: 'sticky',
    name: '便签板',
    icon: StickyNote,
    color: 'from-amber-500 to-orange-600',
    description: '桌面便签，记录重点公式和提醒',
    features: ['拖拽布局', '多种颜色', '置顶功能']
  }
];

// 快速入口 - 408科目
const SUBJECTS = [
  { id: 'ds', name: '数据结构', icon: BookIcon, color: 'blue' },
  { id: 'co', name: '计算机组成', icon: Cpu, color: 'purple' },
  { id: 'os', name: '操作系统', icon: HardDrive, color: 'green' },
  { id: 'cn', name: '计算机网络', icon: Network, color: 'orange' },
];

const NotesCenter = () => {
  const [activeView, setActiveView] = useState('home'); // home, mindmap, markdown, knowledge, sticky
  const [showMindMap, setShowMindMap] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [mindMapSubject, setMindMapSubject] = useState(null);

  // 获取最近笔记（从localStorage）
  const getRecentNotes = () => {
    try {
      const knowledge = JSON.parse(localStorage.getItem('408_knowledge_base') || '[]');
      const notes = JSON.parse(localStorage.getItem('408_notes') || '[]');
      const all = [...knowledge, ...notes]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 5);
      return all;
    } catch {
      return [];
    }
  };

  // 获取统计数据
  const getStats = () => {
    try {
      const knowledge = JSON.parse(localStorage.getItem('408_knowledge_base') || '[]');
      const notes = JSON.parse(localStorage.getItem('408_notes') || '[]');
      const sticky = JSON.parse(localStorage.getItem('408_sticky_notes') || '[]');
      return {
        knowledge: knowledge.length,
        notes: notes.length,
        sticky: sticky.length,
        total: knowledge.length + notes.length + sticky.length
      };
    } catch {
      return { knowledge: 0, notes: 0, sticky: 0, total: 0 };
    }
  };

  const recentNotes = getRecentNotes();
  const stats = getStats();

  // 打开思维导图
  const openMindMap = (subject = null) => {
    setMindMapSubject(subject);
    setShowMindMap(true);
  };

  // 渲染主页
  const renderHome = () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2"> 笔记中心</h1>
        <p className="text-slate-500">
          强大的笔记工具集，助你高效整理408知识点
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-slate-500">总笔记数</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-green-600">{stats.knowledge}</div>
          <div className="text-sm text-slate-500">知识点</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-purple-600">{stats.notes}</div>
          <div className="text-sm text-slate-500">笔记</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-amber-600">{stats.sticky}</div>
          <div className="text-sm text-slate-500">便签</div>
        </div>
      </div>

      {/* 功能卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {FEATURES.map(feature => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              onClick={() => {
                if (feature.id === 'mindmap') openMindMap();
                else if (feature.id === 'markdown') setShowMarkdown(true);
                else if (feature.id === 'knowledge') setActiveView('knowledge');
                else if (feature.id === 'sticky') setActiveView('sticky');
              }}
              className={`bg-gradient-to-br ${feature.color} rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all shadow-lg`}
            >
              <Icon className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.name}</h3>
              <p className="text-white/80 text-sm mb-4">{feature.description}</p>
              <div className="space-y-1">
                {feature.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-white/70">
                    <ChevronRight size={12} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 快速创建思维导图 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Brain className="text-purple-600" />
          快速创建思维导图
        </h2>
        <p className="text-slate-500 text-sm mb-4">选择科目，使用预设模板快速开始</p>
        <div className="grid grid-cols-4 gap-4">
          {SUBJECTS.map(subject => {
            const Icon = subject.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
              purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
              green: 'bg-green-100 text-green-700 hover:bg-green-200',
              orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
            };
            return (
              <button
                key={subject.id}
                onClick={() => openMindMap(subject.id)}
                className={`flex items-center gap-3 p-4 rounded-xl ${colorClasses[subject.color]} transition-all`}
              >
                <Icon size={24} />
                <div className="text-left">
                  <div className="font-medium">{subject.name}</div>
                  <div className="text-xs opacity-70">思维导图</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 最近笔记 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-slate-400" />
            最近笔记
          </h2>
          <button
            onClick={() => setActiveView('knowledge')}
            className="text-blue-600 text-sm hover:underline"
          >
            查看全部 →
          </button>
        </div>

        {recentNotes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText size={48} className="mx-auto mb-2 opacity-50" />
            <p>还没有笔记，开始创建吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentNotes.map((note, index) => (
              <div
                key={note.id || index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                onClick={() => setActiveView('knowledge')}
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-slate-400" size={20} />
                  <div>
                    <div className="font-medium text-slate-800">{note.title}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(note.updatedAt || note.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                {note.subject && (
                  <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs">
                    {SUBJECTS.find(s => s.id === note.subject)?.name || note.subject}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航标签 */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 py-2">
            <button
              onClick={() => setActiveView('home')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'home' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🏠 首页
            </button>
            <button
              onClick={() => openMindMap()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showMindMap 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🧠 思维导图
            </button>
            <button
              onClick={() => setShowMarkdown(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showMarkdown 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ✏️ Markdown
            </button>
            <button
              onClick={() => setActiveView('knowledge')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'knowledge' 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📚 知识库
            </button>
            <button
              onClick={() => setActiveView('sticky')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'sticky' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📌 便签板
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      {activeView === 'home' && renderHome()}
      {activeView === 'knowledge' && <KnowledgeBase />}
      {activeView === 'sticky' && <StickyNotes />}

      {/* 思维导图弹窗 - 使用ReactFlow Pro版本 */}
      <MindMapPro
        isOpen={showMindMap}
        onClose={() => setShowMindMap(false)}
        onSave={(data) => {
          console.log('MindMap saved:', data);
          const saved = JSON.parse(localStorage.getItem('408_mindmaps') || '[]');
          saved.push({ ...data, id: Date.now(), savedAt: new Date().toISOString() });
          localStorage.setItem('408_mindmaps', JSON.stringify(saved));
        }}
        subject={mindMapSubject}
      />

      {/* Markdown编辑器弹窗 - 使用uiw/react-md-editor Pro版本 */}
      <MarkdownEditorPro
        isOpen={showMarkdown}
        onClose={() => setShowMarkdown(false)}
        onSave={(data) => {
          console.log('Markdown saved:', data);
          const knowledge = JSON.parse(localStorage.getItem('408_knowledge_base') || '[]');
          knowledge.unshift({
            id: `note_${Date.now()}`,
            title: data.title,
            content: data.content,
            subject: 'ds',
            tags: ['markdown'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          localStorage.setItem('408_knowledge_base', JSON.stringify(knowledge));
        }}
        title="新建笔记"
      />
    </div>
  );
};

export default NotesCenter;

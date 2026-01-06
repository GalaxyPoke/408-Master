import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { zh } from '@blocknote/core/locales';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { 
  X, FileText, FolderOpen, Plus, Trash2, Download, Upload,
  Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare,
  Quote, Code, Table, Image, Minus, Type
} from 'lucide-react';

// 默认笔记内容
const DEFAULT_CONTENT = [
  {
    type: "heading",
    props: { level: 1 },
    content: "数据结构笔记"
  },
  {
    type: "heading", 
    props: { level: 2 },
    content: "线性表"
  },
  {
    type: "bulletListItem",
    content: "顺序表：用连续的存储单元存储数据"
  },
  {
    type: "bulletListItem",
    content: "链表：用任意存储单元存储数据，通过指针链接"
  },
  {
    type: "heading",
    props: { level: 2 },
    content: "栈和队列"
  },
  {
    type: "paragraph",
    content: "栈：后进先出 (LIFO)"
  },
  {
    type: "paragraph",
    content: "队列：先进先出 (FIFO)"
  }
];

// 工具栏按钮配置
const TOOLBAR_ITEMS = [
  { type: 'heading', props: { level: 1 }, icon: Heading1, label: 'H1' },
  { type: 'heading', props: { level: 2 }, icon: Heading2, label: 'H2' },
  { type: 'heading', props: { level: 3 }, icon: Heading3, label: 'H3' },
  { type: 'divider' },
  { type: 'paragraph', icon: Type, label: '段落' },
  { type: 'bulletListItem', icon: List, label: '无序' },
  { type: 'numberedListItem', icon: ListOrdered, label: '有序' },
  { type: 'checkListItem', icon: CheckSquare, label: '待办' },
  { type: 'divider' },
  { type: 'quote', icon: Quote, label: '引用' },
  { type: 'codeBlock', icon: Code, label: '代码' },
  { type: 'table', icon: Table, label: '表格' },
  { type: 'image', icon: Image, label: '图片' },
];

// 编辑器包装组件
const EditorWrapper = ({ initialContent, onChange }) => {
  const editor = useCreateBlockNote({
    initialContent: initialContent || undefined,
    dictionary: zh
  });

  useEffect(() => {
    if (onChange) {
      const handleChange = () => {
        onChange(editor.document);
      };
      editor.onEditorContentChange(handleChange);
    }
  }, [editor, onChange]);

  // 插入块
  const insertBlock = useCallback((type, props = {}) => {
    const currentBlock = editor.getTextCursorPosition().block;
    
    if (type === 'table') {
      editor.insertBlocks([{
        type: 'table',
        content: {
          type: 'tableContent',
          rows: [
            { cells: [[''], [''], ['']] },
            { cells: [[''], [''], ['']] },
            { cells: [[''], [''], ['']] }
          ]
        }
      }], currentBlock, 'after');
    } else if (type === 'image') {
      editor.insertBlocks([{
        type: 'image',
        props: { url: '' }
      }], currentBlock, 'after');
    } else {
      editor.insertBlocks([{
        type,
        props,
        content: []
      }], currentBlock, 'after');
    }
    
    editor.focus();
  }, [editor]);

  return (
    <div className="h-full flex flex-col">
      {/* 快捷工具栏 */}
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-slate-50 flex-wrap">
        {TOOLBAR_ITEMS.map((item, index) => {
          if (item.type === 'divider') {
            return <div key={index} className="w-px h-6 bg-slate-300 mx-1" />;
          }
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => insertBlock(item.type, item.props)}
              className="flex items-center gap-1 px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded transition-colors"
              title={item.label}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* 编辑器 */}
      <div className="flex-1 overflow-hidden">
        <BlockNoteView 
          editor={editor} 
          theme="light"
        />
      </div>
    </div>
  );
};

const MarkdownEditor = ({ onClose }) => {
  // 笔记列表
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('408_blocknote_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [{ id: 1, title: '数据结构笔记', content: DEFAULT_CONTENT, updatedAt: Date.now() }];
      }
    }
    return [{ id: 1, title: '数据结构笔记', content: DEFAULT_CONTENT, updatedAt: Date.now() }];
  });
  
  // 当前选中的笔记
  const [currentNoteId, setCurrentNoteId] = useState(() => notes[0]?.id || null);
  const currentNote = useMemo(() => notes.find(n => n.id === currentNoteId), [notes, currentNoteId]);
  
  // 侧边栏显示
  const [showSidebar, setShowSidebar] = useState(true);
  
  // 编辑标题
  const [editingTitle, setEditingTitle] = useState(null);
  const [titleInput, setTitleInput] = useState('');

  // 保存笔记到 localStorage
  useEffect(() => {
    localStorage.setItem('408_blocknote_notes', JSON.stringify(notes));
  }, [notes]);

  // 更新当前笔记内容
  const handleContentChange = (content) => {
    if (!currentNoteId) return;
    setNotes(prev => prev.map(note => 
      note.id === currentNoteId 
        ? { ...note, content, updatedAt: Date.now() }
        : note
    ));
  };

  // 创建新笔记
  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: '新笔记',
      content: [{ type: "paragraph", content: "开始写作..." }],
      updatedAt: Date.now()
    };
    setNotes([newNote, ...notes]);
    setCurrentNoteId(newNote.id);
  };

  // 删除笔记
  const deleteNote = (id) => {
    if (notes.length <= 1) return;
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    if (currentNoteId === id) {
      setCurrentNoteId(newNotes[0]?.id || null);
    }
  };

  // 重命名笔记
  const renameNote = (id) => {
    if (!titleInput.trim()) return;
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, title: titleInput.trim() } : note
    ));
    setEditingTitle(null);
    setTitleInput('');
  };

  // 导出笔记为 JSON
  const exportNote = () => {
    if (!currentNote) return;
    const blob = new Blob([JSON.stringify(currentNote.content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNote.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入笔记
  const importNote = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = JSON.parse(event.target?.result);
        const newNote = {
          id: Date.now(),
          title: file.name.replace(/\.json$/, ''),
          content: content,
          updatedAt: Date.now()
        };
        setNotes([newNote, ...notes]);
        setCurrentNoteId(newNote.id);
      } catch {
        alert('导入失败，文件格式不正确');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            title="切换侧边栏"
          >
            <FolderOpen className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">
              {currentNote?.title || '未选择笔记'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="p-2 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors" title="导入">
            <Upload className="h-5 w-5 text-slate-600" />
            <input type="file" accept=".json" onChange={importNote} className="hidden" />
          </label>
          <button
            onClick={exportNote}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            title="导出"
          >
            <Download className="h-5 w-5 text-slate-600" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 - 笔记列表 */}
        {showSidebar && (
          <div className="w-64 border-r bg-slate-50 flex flex-col">
            <div className="p-3 border-b">
              <button
                onClick={createNote}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                新建笔记
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notes.map(note => (
                <div
                  key={note.id}
                  className={`group px-3 py-3 border-b cursor-pointer transition-colors ${
                    currentNoteId === note.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : 'hover:bg-slate-100'
                  }`}
                  onClick={() => setCurrentNoteId(note.id)}
                >
                  {editingTitle === note.id ? (
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onBlur={() => renameNote(note.id)}
                      onKeyDown={(e) => e.key === 'Enter' && renameNote(note.id)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div
                        className="flex-1 truncate"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingTitle(note.id);
                          setTitleInput(note.title);
                        }}
                      >
                        <div className="font-medium text-gray-900 truncate">{note.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{formatTime(note.updatedAt)}</div>
                      </div>
                      {notes.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('确定删除这个笔记吗？')) {
                              deleteNote(note.id);
                            }
                          }}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 编辑器主体 */}
        <div className="flex-1 overflow-hidden">
          {currentNote && (
            <EditorWrapper
              key={currentNoteId}
              initialContent={currentNote.content}
              onChange={handleContentChange}
            />
          )}
        </div>
      </div>

      {/* 自定义样式 */}
      <style>{`
        .bn-container {
          height: 100%;
        }
        .bn-editor {
          padding: 20px 40px;
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;

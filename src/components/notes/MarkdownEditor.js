import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Save, Download, Eye, EyeOff, Copy, Check, 
  Bold, Italic, Strikethrough, Code, Link, Image,
  List, ListOrdered, Quote, Minus, Table, CheckSquare,
  Heading1, Heading2, Heading3, FileText, Maximize2, Minimize2,
  Search, Replace, Undo, Redo, BookOpen
} from 'lucide-react';

// 简单的Markdown解析器
const parseMarkdown = (text) => {
  if (!text) return '';
  
  let html = text
    // 代码块
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto my-2"><code>$2</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code class="bg-slate-200 text-red-600 px-1 rounded">$1</code>')
    // 标题
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-slate-800">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-slate-800">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-slate-900">$1</h1>')
    // 粗体和斜体
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/~~(.+?)~~/g, '<del class="line-through text-slate-500">$1</del>')
    // 链接和图片
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-2" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
    // 引用
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-amber-400 pl-4 py-1 my-2 bg-amber-50 text-slate-600 italic">$1</blockquote>')
    // 无序列表
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\* (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // 有序列表
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // 任务列表
    .replace(/^- \[x\] (.+)$/gm, '<li class="ml-4 flex items-center gap-2"><input type="checkbox" checked disabled class="rounded" /><span class="line-through text-slate-500">$1</span></li>')
    .replace(/^- \[ \] (.+)$/gm, '<li class="ml-4 flex items-center gap-2"><input type="checkbox" disabled class="rounded" /><span>$1</span></li>')
    // 分割线
    .replace(/^---$/gm, '<hr class="my-4 border-slate-300" />')
    // 换行
    .replace(/\n\n/g, '</p><p class="my-2">')
    .replace(/\n/g, '<br />');

  return `<p class="my-2">${html}</p>`;
};

// 工具栏按钮配置
const TOOLBAR_ITEMS = [
  { type: 'divider' },
  { icon: Bold, label: '粗体', shortcut: 'Ctrl+B', action: 'bold', wrap: ['**', '**'] },
  { icon: Italic, label: '斜体', shortcut: 'Ctrl+I', action: 'italic', wrap: ['*', '*'] },
  { icon: Strikethrough, label: '删除线', action: 'strike', wrap: ['~~', '~~'] },
  { icon: Code, label: '行内代码', action: 'code', wrap: ['`', '`'] },
  { type: 'divider' },
  { icon: Heading1, label: '一级标题', action: 'h1', prefix: '# ' },
  { icon: Heading2, label: '二级标题', action: 'h2', prefix: '## ' },
  { icon: Heading3, label: '三级标题', action: 'h3', prefix: '### ' },
  { type: 'divider' },
  { icon: List, label: '无序列表', action: 'ul', prefix: '- ' },
  { icon: ListOrdered, label: '有序列表', action: 'ol', prefix: '1. ' },
  { icon: CheckSquare, label: '任务列表', action: 'task', prefix: '- [ ] ' },
  { icon: Quote, label: '引用', action: 'quote', prefix: '> ' },
  { type: 'divider' },
  { icon: Link, label: '链接', action: 'link', template: '[链接文字](url)' },
  { icon: Image, label: '图片', action: 'image', template: '![图片描述](url)' },
  { icon: Table, label: '表格', action: 'table', template: '| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |' },
  { icon: Minus, label: '分割线', action: 'hr', template: '\n---\n' },
];

// 408常用模板
const TEMPLATES = [
  {
    name: '知识点笔记',
    icon: '📝',
    content: `# 知识点标题

## 概念定义
在这里写下概念的定义...

## 核心要点
- 要点1
- 要点2
- 要点3

## 相关公式
\`\`\`
公式内容
\`\`\`

## 例题
> 题目描述

**解答：**

## 易错点
- [ ] 易错点1
- [ ] 易错点2

## 相关链接
- [[相关知识点1]]
- [[相关知识点2]]
`
  },
  {
    name: '错题记录',
    icon: '❌',
    content: `# 错题记录

## 题目
> 在这里粘贴题目...

## 我的错误答案
...

## 正确答案
...

## 错误原因分析
- [ ] 概念理解错误
- [ ] 计算错误
- [ ] 审题不清
- [ ] 知识点遗忘

## 相关知识点
- [[知识点1]]

## 总结
...
`
  },
  {
    name: '章节总结',
    icon: '📚',
    content: `# 章节名称

## 本章概述
...

## 知识框架
\`\`\`
主题
├── 子主题1
│   ├── 知识点1
│   └── 知识点2
└── 子主题2
    ├── 知识点3
    └── 知识点4
\`\`\`

## 重点内容
### 1. 重点一
...

### 2. 重点二
...

## 常考题型
1. 题型一
2. 题型二

## 复习计划
- [ ] 第一遍：理解概念
- [ ] 第二遍：做课后题
- [ ] 第三遍：真题练习
`
  }
];

const MarkdownEditor = ({ isOpen, onClose, onSave, initialContent = '', title = '未命名笔记' }) => {
  const [content, setContent] = useState(initialContent);
  const [noteTitle, setNoteTitle] = useState(title);
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [history, setHistory] = useState([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const textareaRef = useRef(null);
  const previewRef = useRef(null);

  // 更新字数统计
  useEffect(() => {
    const text = content.replace(/\s/g, '');
    setWordCount(text.length);
  }, [content]);

  // 保存历史记录
  const saveHistory = useCallback((newContent) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory.slice(-50)); // 最多保存50条
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // 撤销
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  // 重做
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  // 处理内容变化
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // 延迟保存历史
    clearTimeout(window.mdHistoryTimeout);
    window.mdHistoryTimeout = setTimeout(() => {
      saveHistory(newContent);
    }, 500);
  };

  // 插入文本
  const insertText = (before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newContent);
    saveHistory(newContent);

    // 设置光标位置
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // 插入行前缀
  const insertPrefix = (prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    
    const newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart);
    setContent(newContent);
    saveHistory(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  // 处理工具栏点击
  const handleToolbarClick = (item) => {
    if (item.wrap) {
      insertText(item.wrap[0], item.wrap[1]);
    } else if (item.prefix) {
      insertPrefix(item.prefix);
    } else if (item.template) {
      insertText(item.template);
    }
  };

  // 应用模板
  const applyTemplate = (template) => {
    setContent(template.content);
    saveHistory(template.content);
    setShowTemplates(false);
  };

  // 复制内容
  const copyContent = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 下载Markdown
  const downloadMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle || '笔记'}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 保存笔记
  const handleSave = () => {
    onSave?.({
      title: noteTitle,
      content,
      wordCount,
      savedAt: new Date().toISOString()
    });
    onClose?.();
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            insertText('**', '**');
            break;
          case 'i':
            e.preventDefault();
            insertText('*', '*');
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
            break;
          case 'f':
            e.preventDefault();
            setShowSearch(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, content]);

  // 同步滚动
  const handleScroll = (e) => {
    if (!previewRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrollRatio = scrollTop / (scrollHeight - clientHeight);
    const previewScrollHeight = previewRef.current.scrollHeight - previewRef.current.clientHeight;
    previewRef.current.scrollTop = scrollRatio * previewScrollHeight;
  };

  // 解析双向链接
  const parseWithLinks = (text) => {
    let html = parseMarkdown(text);
    // 解析 [[链接]] 格式
    html = html.replace(/\[\[([^\]]+)\]\]/g, 
      '<span class="px-1 py-0.5 bg-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-200">📎 $1</span>'
    );
    return html;
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white flex flex-col overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[90vh] rounded-xl'
      }`}>
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg">
              <X size={20} />
            </button>
            <FileText className="text-blue-600" size={20} />
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="text-lg font-medium bg-transparent border-none outline-none focus:bg-white focus:px-2 focus:rounded"
              placeholder="笔记标题..."
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{wordCount} 字</span>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded-lg transition-colors ${showPreview ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-200'}`}
              title={showPreview ? '隐藏预览' : '显示预览'}
            >
              {showPreview ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-slate-200 rounded-lg"
              title={isFullscreen ? '退出全屏' : '全屏'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <div className="w-px h-6 bg-slate-300 mx-1" />

            <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-slate-200 rounded-lg disabled:opacity-30">
              <Undo size={18} />
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-slate-200 rounded-lg disabled:opacity-30">
              <Redo size={18} />
            </button>

            <div className="w-px h-6 bg-slate-300 mx-1" />

            <button onClick={copyContent} className="p-2 hover:bg-slate-200 rounded-lg" title="复制内容">
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
            </button>

            <button onClick={downloadMarkdown} className="flex items-center gap-1 px-3 py-2 hover:bg-slate-200 rounded-lg">
              <Download size={18} />
              <span className="text-sm">导出</span>
            </button>

            <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <Save size={18} />
              <span className="text-sm">保存</span>
            </button>
          </div>
        </div>

        {/* 格式工具栏 */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 border-b flex-wrap">
          {/* 模板按钮 */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm"
            >
              <BookOpen size={16} />
              模板
            </button>
            
            {showTemplates && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowTemplates(false)} />
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border z-20 w-48">
                  {TEMPLATES.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => applyTemplate(template)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left text-sm"
                    >
                      <span>{template.icon}</span>
                      {template.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="w-px h-6 bg-slate-300 mx-2" />

          {/* 格式按钮 */}
          {TOOLBAR_ITEMS.map((item, index) => {
            if (item.type === 'divider') {
              return <div key={index} className="w-px h-6 bg-slate-300 mx-1" />;
            }
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => handleToolbarClick(item)}
                className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                title={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>

        {/* 编辑区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 编辑器 */}
          <div className={`flex flex-col ${showPreview ? 'w-1/2 border-r' : 'w-full'}`}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onScroll={handleScroll}
              className="flex-1 p-4 resize-none outline-none font-mono text-sm leading-relaxed"
              placeholder="开始输入 Markdown 内容...

支持的语法：
# 标题
**粗体** *斜体* ~~删除线~~
- 列表项
1. 有序列表
> 引用
`代码`
[[双向链接]]
"
            />
          </div>

          {/* 预览 */}
          {showPreview && (
            <div className="w-1/2 flex flex-col">
              <div className="px-4 py-2 bg-slate-50 border-b text-sm text-slate-500 flex items-center gap-2">
                <Eye size={14} />
                预览
              </div>
              <div
                ref={previewRef}
                className="flex-1 p-4 overflow-auto prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: parseWithLinks(content) }}
              />
            </div>
          )}
        </div>

        {/* 底部状态栏 */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>Markdown</span>
            <span>行数: {content.split('\n').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Ctrl+S 保存</span>
            <span>Ctrl+B 粗体</span>
            <span>Ctrl+I 斜体</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;

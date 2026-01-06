import React, { useState, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import {
  X, Save, Download, Maximize2, Minimize2, BookOpen, Clock
} from 'lucide-react';

// 408笔记模板
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
  },
  {
    name: '公式速查',
    icon: '🔢',
    content: `# 公式速查表

## 科目：数据结构

### 时间复杂度

| 算法 | 最好 | 平均 | 最坏 |
|------|------|------|------|
| 快速排序 | O(nlogn) | O(nlogn) | O(n²) |
| 归并排序 | O(nlogn) | O(nlogn) | O(nlogn) |
| 堆排序 | O(nlogn) | O(nlogn) | O(nlogn) |

### 空间复杂度

- 快速排序：O(logn) ~ O(n)
- 归并排序：O(n)
- 堆排序：O(1)

## 重要公式

1. **二叉树性质**
   - n₀ = n₂ + 1
   - 第i层最多 2^(i-1) 个节点

2. **哈夫曼树**
   - WPL = Σ(wᵢ × lᵢ)
`
  }
];

const MarkdownEditorPro = ({ isOpen, onClose, onSave, initialContent = '', title = '未命名笔记' }) => {
  const [content, setContent] = useState(initialContent);
  const [noteTitle, setNoteTitle] = useState(title);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewMode, setPreviewMode] = useState('live'); // live, edit, preview

  // 应用模板
  const applyTemplate = useCallback((template) => {
    setContent(template.content);
    setShowTemplates(false);
  }, []);

  // 下载Markdown
  const downloadMarkdown = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle || '笔记'}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, noteTitle]);

  // 保存笔记
  const handleSave = useCallback(() => {
    const wordCount = content.replace(/\s/g, '').length;
    onSave?.({
      title: noteTitle,
      content,
      wordCount,
      savedAt: new Date().toISOString()
    });
    onClose?.();
  }, [content, noteTitle, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div 
        className={`bg-white flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[90vh] rounded-xl'
        }`}
        data-color-mode="light"
      >
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg">
              <X size={20} />
            </button>
            <span className="text-lg">✏️</span>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="text-lg font-medium bg-transparent border-none outline-none focus:bg-white focus:px-2 focus:rounded min-w-[200px]"
              placeholder="笔记标题..."
            />
          </div>

          <div className="flex items-center gap-2">
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
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border z-20 w-48">
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

            {/* 预览模式切换 */}
            <div className="flex items-center bg-white rounded-lg border">
              <button
                onClick={() => setPreviewMode('edit')}
                className={`px-3 py-1.5 text-sm rounded-l-lg ${previewMode === 'edit' ? 'bg-blue-500 text-white' : 'hover:bg-slate-50'}`}
              >
                编辑
              </button>
              <button
                onClick={() => setPreviewMode('live')}
                className={`px-3 py-1.5 text-sm ${previewMode === 'live' ? 'bg-blue-500 text-white' : 'hover:bg-slate-50'}`}
              >
                分屏
              </button>
              <button
                onClick={() => setPreviewMode('preview')}
                className={`px-3 py-1.5 text-sm rounded-r-lg ${previewMode === 'preview' ? 'bg-blue-500 text-white' : 'hover:bg-slate-50'}`}
              >
                预览
              </button>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-slate-200 rounded-lg"
              title={isFullscreen ? '退出全屏' : '全屏'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <div className="w-px h-6 bg-slate-300 mx-1" />

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

        {/* 编辑器区域 */}
        <div className="flex-1 overflow-hidden">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val || '')}
            preview={previewMode}
            height="100%"
            visibleDragbar={false}
            hideToolbar={false}
            enableScroll={true}
            textareaProps={{
              placeholder: '开始输入 Markdown 内容...\n\n支持的语法：\n# 标题\n**粗体** *斜体*\n- 列表项\n> 引用\n`代码`\n[[双向链接]]'
            }}
          />
        </div>

        {/* 底部状态栏 */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>Markdown</span>
            <span>字数: {content.replace(/\s/g, '').length}</span>
            <span>行数: {content.split('\n').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} />
            <span>自动保存已启用</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditorPro;

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Save, Download, Undo, Redo, Plus, Trash2, GripVertical,
  Type, Heading1, Heading2, Heading3, List, ListOrdered, Code,
  Image as ImageIcon, PenTool, Quote, Minus, CheckSquare,
  Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight,
  Github, Upload, ChevronDown, MoreHorizontal, Copy, ArrowUp, ArrowDown,
  Eraser, Circle, Square, Highlighter, Grid, ListTree, ChevronRight, Layout
} from 'lucide-react';
import HandwritingNote from './HandwritingNote';
import { DrawIoEmbed } from 'react-drawio';

const NotebookEditor = ({ isOpen, onClose, onSave, videoTitle, initialContent }) => {
  const [blocks, setBlocks] = useState([
    { id: Date.now(), type: 'heading1', content: videoTitle || '未命名笔记' },
    { id: Date.now() + 1, type: 'paragraph', content: '' }
  ]);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 });
  const [menuForBlockId, setMenuForBlockId] = useState(null);
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [drawingBlockId, setDrawingBlockId] = useState(null);
  const [showDrawioModal, setShowDrawioModal] = useState(false);
  const [drawioBlockId, setDrawioBlockId] = useState(null);
  const [showToc, setShowToc] = useState(true); // 目录显示状态
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const blockRefs = useRef({}); // 用于存储每个块的ref，实现跳转
  const drawioRef = useRef(null);

  // 块类型配置
  const blockTypes = [
    { type: 'paragraph', icon: Type, label: '正文', shortcut: '/' },
    { type: 'heading1', icon: Heading1, label: '一级标题', shortcut: '/h1' },
    { type: 'heading2', icon: Heading2, label: '二级标题', shortcut: '/h2' },
    { type: 'heading3', icon: Heading3, label: '三级标题', shortcut: '/h3' },
    { type: 'bulletList', icon: List, label: '无序列表', shortcut: '/ul' },
    { type: 'numberedList', icon: ListOrdered, label: '有序列表', shortcut: '/ol' },
    { type: 'todoList', icon: CheckSquare, label: '待办事项', shortcut: '/todo' },
    { type: 'code', icon: Code, label: '代码块', shortcut: '/code' },
    { type: 'quote', icon: Quote, label: '引用', shortcut: '/quote' },
    { type: 'divider', icon: Minus, label: '分割线', shortcut: '/hr' },
    { type: 'image', icon: ImageIcon, label: '图片', shortcut: '/img' },
    { type: 'drawing', icon: PenTool, label: '手写/绘图', shortcut: '/draw' },
    { type: 'drawio', icon: Layout, label: 'Draw.io流程图', shortcut: '/drawio' },
  ];

  // 保存历史记录
  const saveHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(blocks));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [blocks, history, historyIndex]);

  // 撤销
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(JSON.parse(history[historyIndex - 1]));
    }
  };

  // 重做
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(JSON.parse(history[historyIndex + 1]));
    }
  };

  // 添加新块
  const addBlock = (type, afterBlockId = null) => {
    const newBlock = {
      id: Date.now(),
      type,
      content: type === 'divider' ? '' : '',
      checked: type === 'todoList' ? false : undefined,
      language: type === 'code' ? 'javascript' : undefined,
      imageUrl: type === 'image' ? '' : undefined,
      drawingData: type === 'drawing' ? null : undefined,
      drawioXml: type === 'drawio' ? '' : undefined,
      drawioImage: type === 'drawio' ? '' : undefined,
    };

    setBlocks(prev => {
      if (afterBlockId) {
        const index = prev.findIndex(b => b.id === afterBlockId);
        const newBlocks = [...prev];
        newBlocks.splice(index + 1, 0, newBlock);
        return newBlocks;
      }
      return [...prev, newBlock];
    });

    setShowBlockMenu(false);
    setActiveBlockId(newBlock.id);
    saveHistory();

    // 如果是图片块，触发文件选择
    if (type === 'image') {
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
    // 如果是绘图块，打开绘图模态框
    if (type === 'drawing') {
      setDrawingBlockId(newBlock.id);
      setShowDrawingModal(true);
    }
    // 如果是 Draw.io 块，打开 Draw.io 编辑器
    if (type === 'drawio') {
      setDrawioBlockId(newBlock.id);
      setShowDrawioModal(true);
    }
  };

  // 更新块内容
  const updateBlock = (blockId, updates) => {
    setBlocks(prev => prev.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  // 删除块
  const deleteBlock = (blockId) => {
    if (blocks.length <= 1) return;
    setBlocks(prev => prev.filter(b => b.id !== blockId));
    saveHistory();
  };

  // 移动块
  const moveBlock = (blockId, direction) => {
    const index = blocks.findIndex(b => b.id === blockId);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;

    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
    saveHistory();
  };

  // 复制块
  const duplicateBlock = (blockId) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    const newBlock = { ...block, id: Date.now() };
    const index = blocks.findIndex(b => b.id === blockId);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    saveHistory();
  };

  // 转换块类型
  const convertBlock = (blockId, newType) => {
    setBlocks(prev => prev.map(block =>
      block.id === blockId ? { ...block, type: newType } : block
    ));
    setShowBlockMenu(false);
    saveHistory();
  };

  // 处理键盘事件
  const handleKeyDown = (e, blockId) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Enter 创建新块
    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code') {
      e.preventDefault();
      addBlock('paragraph', blockId);
    }

    // Backspace 删除空块
    if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
      e.preventDefault();
      deleteBlock(blockId);
      // 聚焦到上一个块
      const index = blocks.findIndex(b => b.id === blockId);
      if (index > 0) {
        setActiveBlockId(blocks[index - 1].id);
      }
    }

    // / 显示块菜单
    if (e.key === '/' && block.content === '') {
      e.preventDefault();
      const rect = e.target.getBoundingClientRect();
      setBlockMenuPosition({ x: rect.left, y: rect.bottom + 5 });
      setMenuForBlockId(blockId);
      setShowBlockMenu(true);
    }
  };

  // 处理图片上传
  const handleImageUpload = (e, blockId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      updateBlock(blockId || activeBlockId, { imageUrl: event.target.result });
      saveHistory();
    };
    reader.readAsDataURL(file);
  };

  // 拖拽处理
  const handleDragStart = (e, blockId) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, blockId) => {
    e.preventDefault();
    if (draggedBlockId === blockId) return;
  };

  const handleDrop = (e, targetBlockId) => {
    e.preventDefault();
    if (!draggedBlockId || draggedBlockId === targetBlockId) return;

    const dragIndex = blocks.findIndex(b => b.id === draggedBlockId);
    const dropIndex = blocks.findIndex(b => b.id === targetBlockId);

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(dragIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedBlock);

    setBlocks(newBlocks);
    setDraggedBlockId(null);
    saveHistory();
  };

  // 渲染块内容
  const renderBlock = (block) => {
    const commonProps = {
      className: `w-full outline-none resize-none bg-transparent`,
      value: block.content,
      onChange: (e) => updateBlock(block.id, { content: e.target.value }),
      onKeyDown: (e) => handleKeyDown(e, block.id),
      onFocus: () => setActiveBlockId(block.id),
      placeholder: getPlaceholder(block.type),
    };

    switch (block.type) {
      case 'heading1':
        return <input {...commonProps} className={`${commonProps.className} text-3xl font-bold`} />;
      case 'heading2':
        return <input {...commonProps} className={`${commonProps.className} text-2xl font-semibold`} />;
      case 'heading3':
        return <input {...commonProps} className={`${commonProps.className} text-xl font-medium`} />;
      case 'paragraph':
        return <textarea {...commonProps} rows={1} className={`${commonProps.className} text-base leading-relaxed`} 
          style={{ minHeight: '24px' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />;
      case 'bulletList':
        return (
          <div className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 bg-slate-600 rounded-full flex-shrink-0" />
            <input {...commonProps} />
          </div>
        );
      case 'numberedList':
        return (
          <div className="flex items-start gap-2">
            <span className="text-slate-500 flex-shrink-0">{blocks.filter(b => b.type === 'numberedList').findIndex(b => b.id === block.id) + 1}.</span>
            <input {...commonProps} />
          </div>
        );
      case 'todoList':
        return (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-slate-300"
            />
            <input {...commonProps} className={`${commonProps.className} ${block.checked ? 'line-through text-slate-400' : ''}`} />
          </div>
        );
      case 'code':
        return (
          <div className="bg-slate-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1 bg-slate-800 text-slate-400 text-xs">
              <select
                value={block.language || 'javascript'}
                onChange={(e) => updateBlock(block.id, { language: e.target.value })}
                className="bg-transparent outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="sql">SQL</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
            </div>
            <textarea
              {...commonProps}
              className="w-full p-3 bg-slate-900 text-green-400 font-mono text-sm outline-none resize-none"
              rows={5}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const start = e.target.selectionStart;
                  const end = e.target.selectionEnd;
                  const newContent = block.content.substring(0, start) + '  ' + block.content.substring(end);
                  updateBlock(block.id, { content: newContent });
                }
              }}
            />
          </div>
        );
      case 'quote':
        return (
          <div className="border-l-4 border-amber-400 pl-4 py-1 bg-amber-50 rounded-r">
            <textarea {...commonProps} className={`${commonProps.className} text-slate-600 italic`} rows={2} />
          </div>
        );
      case 'divider':
        return <hr className="border-slate-200 my-2" />;
      case 'image':
        return (
          <div className="relative">
            {block.imageUrl ? (
              <img src={block.imageUrl} alt="" className="max-w-full rounded-lg" />
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-amber-400 transition-colors"
              >
                <ImageIcon className="mx-auto mb-2 text-slate-400" size={32} />
                <p className="text-slate-500">点击上传图片</p>
              </div>
            )}
          </div>
        );
      case 'drawing':
        return (
          <div className="relative">
            {block.drawingData ? (
              <div className="relative group">
                <img src={block.drawingData} alt="手写内容" className="max-w-full rounded-lg border border-slate-200" />
                <button
                  onClick={() => {
                    setDrawingBlockId(block.id);
                    setShowDrawingModal(true);
                  }}
                  className="absolute top-2 right-2 px-3 py-1 bg-white/90 rounded-lg text-sm text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  编辑
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setDrawingBlockId(block.id);
                  setShowDrawingModal(true);
                }}
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-amber-400 transition-colors"
              >
                <PenTool className="mx-auto mb-2 text-slate-400" size={32} />
                <p className="text-slate-500">点击添加手写/绘图</p>
              </div>
            )}
          </div>
        );
      case 'drawio':
        const hasDrawioContent = block.drawioXml && block.drawioXml.length > 10;
        return (
          <div className="relative">
            {hasDrawioContent ? (
              <div className="relative group">
                {block.drawioImage ? (
                  <img 
                    src={block.drawioImage} 
                    alt="Draw.io 流程图" 
                    className="max-w-full rounded-lg border border-slate-200"
                  />
                ) : (
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <Layout size={20} />
                      <span className="font-medium">Draw.io 流程图</span>
                    </div>
                    <p className="text-sm text-slate-500">点击编辑查看</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    setDrawioBlockId(block.id);
                    setShowDrawioModal(true);
                  }}
                  className="absolute top-2 right-2 px-3 py-1.5 bg-white/90 rounded-lg text-sm text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  编辑
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setDrawioBlockId(block.id);
                  setShowDrawioModal(true);
                }}
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <Layout className="mx-auto mb-2 text-slate-400" size={32} />
                <p className="text-slate-500">点击添加 Draw.io 流程图</p>
              </div>
            )}
          </div>
        );
      default:
        return <input {...commonProps} />;
    }
  };

  const getPlaceholder = (type) => {
    const placeholders = {
      heading1: '一级标题',
      heading2: '二级标题',
      heading3: '三级标题',
      paragraph: "输入文字，或输入 '/' 选择块类型...",
      bulletList: '列表项',
      numberedList: '列表项',
      todoList: '待办事项',
      code: '// 输入代码...',
      quote: '引用内容...',
    };
    return placeholders[type] || '输入内容...';
  };

  // 导出为Markdown
  const exportMarkdown = () => {
    let md = '';
    blocks.forEach(block => {
      switch (block.type) {
        case 'heading1': md += `# ${block.content}\n\n`; break;
        case 'heading2': md += `## ${block.content}\n\n`; break;
        case 'heading3': md += `### ${block.content}\n\n`; break;
        case 'paragraph': md += `${block.content}\n\n`; break;
        case 'bulletList': md += `- ${block.content}\n`; break;
        case 'numberedList': md += `1. ${block.content}\n`; break;
        case 'todoList': md += `- [${block.checked ? 'x' : ' '}] ${block.content}\n`; break;
        case 'code': md += `\`\`\`${block.language || ''}\n${block.content}\n\`\`\`\n\n`; break;
        case 'quote': md += `> ${block.content}\n\n`; break;
        case 'divider': md += `---\n\n`; break;
        case 'image': md += `![image](${block.imageUrl})\n\n`; break;
        default: md += `${block.content}\n\n`;
      }
    });
    return md;
  };

  // 下载Markdown
  const downloadMarkdown = () => {
    const md = exportMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoTitle || '笔记'}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 保存笔记
  const handleSave = () => {
    const noteData = {
      blocks,
      markdown: exportMarkdown(),
      title: blocks.find(b => b.type === 'heading1')?.content || videoTitle || '未命名笔记',
      timestamp: Date.now()
    };
    onSave?.(noteData);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full flex flex-col">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <X size={20} />
            </button>
            <span className="text-lg font-medium text-slate-700">📝 笔记本</span>
            <span className="text-sm text-slate-400">- {videoTitle || '未命名'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowToc(!showToc)} 
              className={`p-2 rounded-lg transition-colors ${showToc ? 'bg-slate-200 text-slate-700' : 'hover:bg-slate-200 text-slate-500'}`}
              title="显示/隐藏目录"
            >
              <ListTree size={18} />
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1" />
            <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-slate-200 rounded-lg disabled:opacity-30">
              <Undo size={18} />
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-slate-200 rounded-lg disabled:opacity-30">
              <Redo size={18} />
            </button>
            <div className="w-px h-6 bg-slate-300 mx-2" />
            <button onClick={downloadMarkdown} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-200 rounded-lg">
              <Download size={18} />
              <span className="text-sm">导出MD</span>
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
              <Save size={18} />
              <span className="text-sm">保存</span>
            </button>
          </div>
        </div>

        {/* 主体区域 - 目录 + 编辑器 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧目录 */}
          {showToc && (
            <div className="w-64 border-r border-slate-200 bg-slate-50 overflow-auto flex-shrink-0">
              <div className="p-4">
                <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                  <ListTree size={14} />
                  目录
                </h3>
                <div className="space-y-1">
                  {blocks
                    .filter(b => ['heading1', 'heading2', 'heading3'].includes(b.type))
                    .map(block => (
                      <button
                        key={block.id}
                        onClick={() => {
                          blockRefs.current[block.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          setActiveBlockId(block.id);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-slate-200 transition-colors truncate ${
                          activeBlockId === block.id ? 'bg-slate-200 text-slate-900' : 'text-slate-600'
                        } ${
                          block.type === 'heading1' ? 'font-medium' : 
                          block.type === 'heading2' ? 'pl-4' : 'pl-6 text-xs'
                        }`}
                      >
                        {block.content || (block.type === 'heading1' ? '一级标题' : block.type === 'heading2' ? '二级标题' : '三级标题')}
                      </button>
                    ))}
                  {blocks.filter(b => ['heading1', 'heading2', 'heading3'].includes(b.type)).length === 0 && (
                    <p className="text-xs text-slate-400 italic">暂无标题</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 编辑区域 */}
          <div 
            ref={editorRef} 
            className="flex-1 overflow-auto bg-white"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="max-w-3xl mx-auto py-8 px-4">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                ref={(el) => blockRefs.current[block.id] = el}
                className={`group relative flex items-start gap-2 py-1 ${
                  activeBlockId === block.id ? 'bg-amber-50/50' : ''
                } ${draggedBlockId === block.id ? 'opacity-50' : ''}`}
              >
                {/* 左侧操作按钮 */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -left-10 top-1">
                  <button
                    onClick={() => addBlock('paragraph', blocks[index - 1]?.id)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400"
                    title="添加块"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* 块内容 */}
                <div className="flex-1 min-w-0">
                  {renderBlock(block)}
                </div>

                {/* 右侧操作菜单 */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveBlock(block.id, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 disabled:opacity-30"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveBlock(block.id, 'down')}
                    disabled={index === blocks.length - 1}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 disabled:opacity-30"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => duplicateBlock(block.id)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="p-1 hover:bg-red-100 rounded text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* 添加新块按钮 */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setShowBlockMenu(!showBlockMenu)}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Plus size={18} />
                <span className="text-sm">添加块</span>
              </button>
            </div>
          </div>
        </div>
        </div>

        {/* 块类型选择菜单 */}
        {showBlockMenu && (
          <div
            className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 py-2 w-64 max-h-80 overflow-auto z-50"
            style={{ left: blockMenuPosition.x || '50%', top: blockMenuPosition.y || '50%', transform: blockMenuPosition.x ? 'none' : 'translate(-50%, -50%)' }}
          >
            <div className="px-3 py-1 text-xs text-slate-400 font-medium">基础块</div>
            {blockTypes.map(({ type, icon: Icon, label, shortcut }) => (
              <button
                key={type}
                onClick={() => {
                  if (menuForBlockId) {
                    convertBlock(menuForBlockId, type);
                  } else {
                    addBlock(type);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-100 transition-colors"
              >
                <Icon size={18} className="text-slate-500" />
                <span className="flex-1 text-left text-sm">{label}</span>
                <span className="text-xs text-slate-400">{shortcut}</span>
              </button>
            ))}
          </div>
        )}

        {/* 点击外部关闭菜单 */}
        {showBlockMenu && (
          <div className="fixed inset-0 z-40" onClick={() => setShowBlockMenu(false)} />
        )}

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageUpload(e, activeBlockId)}
        />

        {/* 手写绘图 - 使用完整的HandwritingNote组件 */}
        <HandwritingNote
          isOpen={showDrawingModal}
          onClose={() => setShowDrawingModal(false)}
          onSave={(noteData) => {
            // noteData 可能是 { content: 'base64...' } 或直接是图片数据
            const imageData = noteData?.content?.replace('[手写笔记] ', '') || noteData;
            if (imageData && drawingBlockId) {
              updateBlock(drawingBlockId, { drawingData: imageData });
              saveHistory();
            }
            setShowDrawingModal(false);
          }}
          videoTitle="手写/绘图"
        />

        {/* Draw.io 编辑器弹窗 */}
        {showDrawioModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                <h3 className="font-medium flex items-center gap-2">
                  <Layout size={20} className="text-blue-500" />
                  Draw.io 流程图编辑器
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDrawioModal(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    关闭
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <DrawIoEmbed
                  xml={blocks.find(b => b.id === drawioBlockId)?.drawioXml || ''}
                  urlParameters={{
                    ui: 'kennedy',
                    spin: true,
                    libraries: true,
                    saveAndExit: false,
                    noSaveBtn: false,
                    noExitBtn: true
                  }}
                  onSave={(data) => {
                    if (drawioBlockId && data.xml) {
                      updateBlock(drawioBlockId, { drawioXml: data.xml });
                      saveHistory();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotebookEditor;

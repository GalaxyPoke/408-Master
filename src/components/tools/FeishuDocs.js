import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ExternalLink, FileText, FolderOpen, Edit2, Check, Link } from 'lucide-react';

const FeishuDocs = ({ onClose }) => {
  // 文档列表
  const [docs, setDocs] = useState(() => {
    const saved = localStorage.getItem('408_feishu_docs');
    return saved ? JSON.parse(saved) : [];
  });

  // 当前选中的文档
  const [currentDocId, setCurrentDocId] = useState(null);
  const currentDoc = docs.find(d => d.id === currentDocId);

  // 添加文档弹窗
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');

  // 编辑文档名称
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // 侧边栏显示
  const [showSidebar, setShowSidebar] = useState(true);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('408_feishu_docs', JSON.stringify(docs));
  }, [docs]);

  // 解析飞书文档链接，转换为嵌入链接
  const parseFeishuUrl = (url) => {
    // 支持多种飞书链接格式
    // https://xxx.feishu.cn/docx/xxx
    // https://xxx.feishu.cn/wiki/xxx
    // https://xxx.feishu.cn/sheets/xxx
    // https://xxx.feishu.cn/base/xxx
    
    if (!url) return '';
    
    // 如果已经是嵌入链接，直接返回
    if (url.includes('?') && url.includes('mode=')) {
      return url;
    }
    
    // 添加嵌入参数
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}mode=edit`;
  };

  // 添加文档
  const addDoc = () => {
    if (!newDocName.trim() || !newDocUrl.trim()) return;
    
    const newDoc = {
      id: Date.now(),
      name: newDocName.trim(),
      url: newDocUrl.trim(),
      embedUrl: parseFeishuUrl(newDocUrl.trim()),
      createdAt: Date.now()
    };
    
    setDocs([newDoc, ...docs]);
    setCurrentDocId(newDoc.id);
    setNewDocName('');
    setNewDocUrl('');
    setShowAddModal(false);
  };

  // 删除文档
  const deleteDoc = (id) => {
    if (!window.confirm('确定删除这个文档吗？')) return;
    const newDocs = docs.filter(d => d.id !== id);
    setDocs(newDocs);
    if (currentDocId === id) {
      setCurrentDocId(newDocs[0]?.id || null);
    }
  };

  // 重命名文档
  const renameDoc = (id) => {
    if (!editingName.trim()) return;
    setDocs(docs.map(d => 
      d.id === id ? { ...d, name: editingName.trim() } : d
    ));
    setEditingId(null);
    setEditingName('');
  };

  // 在新窗口打开
  const openInNewWindow = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            title="切换侧边栏"
          >
            <FolderOpen className="h-5 w-5 text-blue-600" />
          </button>
          <div className="flex items-center gap-2">
            <img 
              src="https://sf3-scmcdn2-cn.feishucdn.com/ccm/pc/web/resource/bear/src/common/images/logo.png" 
              alt="飞书" 
              className="h-6 w-6"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="font-semibold text-gray-900">飞书文档</span>
            {currentDoc && (
              <span className="text-gray-500">· {currentDoc.name}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentDoc && (
            <button
              onClick={() => openInNewWindow(currentDoc.url)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="在新窗口打开"
            >
              <ExternalLink className="h-4 w-4" />
              新窗口
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 - 文档列表 */}
        {showSidebar && (
          <div className="w-64 border-r bg-slate-50 flex flex-col">
            <div className="p-3 border-b">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                添加文档
              </button>
            </div>
            
            {docs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4">
                <FileText className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm text-center">暂无文档</p>
                <p className="text-xs text-center mt-1">点击上方按钮添加飞书文档链接</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {docs.map(doc => (
                  <div
                    key={doc.id}
                    className={`group px-3 py-3 border-b cursor-pointer transition-colors ${
                      currentDocId === doc.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : 'hover:bg-slate-100'
                    }`}
                    onClick={() => setCurrentDocId(doc.id)}
                  >
                    {editingId === doc.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && renameDoc(doc.id)}
                          className="flex-1 px-2 py-1 border rounded text-sm"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); renameDoc(doc.id); }}
                          className="p-1 hover:bg-green-100 rounded"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1 truncate">
                          <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            {doc.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(doc.id);
                              setEditingName(doc.name);
                            }}
                            className="p-1 hover:bg-blue-100 rounded"
                            title="重命名"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-blue-500" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }}
                            className="p-1 hover:bg-red-100 rounded"
                            title="删除"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 文档内容区 */}
        <div className="flex-1 bg-gray-100">
          {currentDoc ? (
            <iframe
              src={currentDoc.embedUrl}
              className="w-full h-full border-0"
              title={currentDoc.name}
              allow="clipboard-read; clipboard-write"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <FileText className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg">选择或添加一个飞书文档</p>
              <p className="text-sm mt-2">支持飞书文档、表格、多维表格、知识库等</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                添加文档
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 添加文档弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Link className="h-5 w-5 text-blue-600" />
              添加飞书文档
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文档名称
                </label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="例如：数据结构笔记"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  飞书文档链接
                </label>
                <input
                  type="text"
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  placeholder="https://xxx.feishu.cn/docx/xxx"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  支持飞书文档、表格、多维表格、知识库链接
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewDocName('');
                  setNewDocUrl('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={addDoc}
                disabled={!newDocName.trim() || !newDocUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeishuDocs;

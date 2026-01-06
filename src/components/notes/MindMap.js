import React, { useState, useRef, useCallback } from 'react';
import {
  Plus, ZoomIn, ZoomOut, RotateCcw, Download, Save, Trash2,
  Edit3, X, BookOpen, Cpu, HardDrive, Network
} from 'lucide-react';

// 408科目预设模板
const SUBJECT_TEMPLATES = {
  ds: {
    name: '数据结构',
    icon: BookOpen,
    color: '#3B82F6',
    children: [
      { name: '线性结构', children: [
        { name: '数组' }, { name: '链表' }, { name: '栈' }, { name: '队列' }
      ]},
      { name: '树形结构', children: [
        { name: '二叉树' }, { name: 'BST' }, { name: 'AVL树' }, { name: 'B树/B+树' }, { name: '红黑树' }
      ]},
      { name: '图', children: [
        { name: '图的存储' }, { name: 'DFS/BFS' }, { name: '最短路径' }, { name: '最小生成树' }
      ]},
      { name: '查找', children: [
        { name: '顺序查找' }, { name: '二分查找' }, { name: '哈希查找' }
      ]},
      { name: '排序', children: [
        { name: '冒泡/选择/插入' }, { name: '快速排序' }, { name: '归并排序' }, { name: '堆排序' }
      ]}
    ]
  },
  co: {
    name: '计算机组成原理',
    icon: Cpu,
    color: '#8B5CF6',
    children: [
      { name: '数据表示', children: [
        { name: '进制转换' }, { name: '原码/反码/补码' }, { name: '浮点数' }
      ]},
      { name: '运算器', children: [
        { name: '加法器' }, { name: '乘法器' }, { name: 'ALU' }
      ]},
      { name: '存储系统', children: [
        { name: '主存' }, { name: 'Cache' }, { name: '虚拟存储' }
      ]},
      { name: 'CPU', children: [
        { name: '指令系统' }, { name: '数据通路' }, { name: '流水线' }
      ]},
      { name: '总线与I/O', children: [
        { name: '总线结构' }, { name: 'I/O方式' }, { name: '中断' }
      ]}
    ]
  },
  os: {
    name: '操作系统',
    icon: HardDrive,
    color: '#10B981',
    children: [
      { name: '进程管理', children: [
        { name: '进程/线程' }, { name: '调度算法' }, { name: '同步互斥' }, { name: '死锁' }
      ]},
      { name: '内存管理', children: [
        { name: '连续分配' }, { name: '分页' }, { name: '分段' }, { name: '虚拟内存' }
      ]},
      { name: '文件系统', children: [
        { name: '目录结构' }, { name: '文件分配' }, { name: '磁盘调度' }
      ]},
      { name: 'I/O管理', children: [
        { name: 'I/O控制' }, { name: '缓冲技术' }, { name: 'SPOOLing' }
      ]}
    ]
  },
  cn: {
    name: '计算机网络',
    icon: Network,
    color: '#F59E0B',
    children: [
      { name: '物理层', children: [
        { name: '传输介质' }, { name: '编码调制' }, { name: '信道复用' }
      ]},
      { name: '数据链路层', children: [
        { name: '差错控制' }, { name: 'CSMA/CD' }, { name: '以太网' }
      ]},
      { name: '网络层', children: [
        { name: 'IP协议' }, { name: '路由算法' }, { name: 'ARP/ICMP' }
      ]},
      { name: '传输层', children: [
        { name: 'TCP' }, { name: 'UDP' }, { name: '拥塞控制' }
      ]},
      { name: '应用层', children: [
        { name: 'HTTP' }, { name: 'DNS' }, { name: 'FTP/SMTP' }
      ]}
    ]
  }
};

const NODE_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const MindMap = ({ isOpen, onClose, onSave, initialData, subject }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // 初始化根节点
  const getInitialNodes = () => {
    if (initialData?.nodes) return initialData.nodes;
    if (subject && SUBJECT_TEMPLATES[subject]) {
      return convertTemplateToNodes(SUBJECT_TEMPLATES[subject]);
    }
    return [{
      id: 'root',
      text: '中心主题',
      x: 400,
      y: 300,
      color: '#3B82F6',
      children: [],
      expanded: true,
      isRoot: true
    }];
  };

  const convertTemplateToNodes = (template, parentId = null, level = 0) => {
    const nodes = [];
    const rootId = 'root';
    
    // 创建根节点
    const rootNode = {
      id: rootId,
      text: template.name,
      x: 400,
      y: 300,
      color: template.color,
      children: [],
      expanded: true,
      isRoot: true
    };
    nodes.push(rootNode);

    // 递归创建子节点
    const createChildren = (children, parentNode, depth) => {
      if (!children) return;
      
      const angleStep = Math.PI / (children.length + 1);
      const radius = 150 + depth * 80;
      
      children.forEach((child, index) => {
        const angle = -Math.PI / 2 + angleStep * (index + 1) + (depth % 2 === 0 ? 0 : Math.PI);
        const childId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const childNode = {
          id: childId,
          text: child.name,
          x: parentNode.x + Math.cos(angle) * radius,
          y: parentNode.y + Math.sin(angle) * radius,
          color: NODE_COLORS[(depth + index) % NODE_COLORS.length],
          children: [],
          expanded: depth < 1,
          parentId: parentNode.id
        };
        
        nodes.push(childNode);
        parentNode.children.push(childId);
        
        if (child.children) {
          createChildren(child.children, childNode, depth + 1);
        }
      });
    };

    if (template.children) {
      createChildren(template.children, rootNode, 0);
    }

    return nodes;
  };

  const [nodes, setNodes] = useState(getInitialNodes);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [editText, setEditText] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 获取节点
  const getNode = useCallback((id) => nodes.find(n => n.id === id), [nodes]);

  // 添加子节点
  const addChildNode = (parentId) => {
    const parent = getNode(parentId);
    if (!parent) return;

    const newId = `node_${Date.now()}`;
    const angle = Math.random() * Math.PI * 2;
    const distance = 120;

    const newNode = {
      id: newId,
      text: '新节点',
      x: parent.x + Math.cos(angle) * distance,
      y: parent.y + Math.sin(angle) * distance,
      color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
      children: [],
      expanded: true,
      parentId: parentId
    };

    setNodes(prev => {
      const updated = prev.map(n => 
        n.id === parentId 
          ? { ...n, children: [...n.children, newId], expanded: true }
          : n
      );
      return [...updated, newNode];
    });

    setSelectedNode(newId);
    setEditingNode(newId);
    setEditText('新节点');
  };

  // 删除节点
  const deleteNode = (nodeId) => {
    const node = getNode(nodeId);
    if (!node || node.isRoot) return;

    // 递归获取所有子节点ID
    const getAllChildIds = (id) => {
      const n = getNode(id);
      if (!n) return [id];
      return [id, ...n.children.flatMap(getAllChildIds)];
    };

    const idsToDelete = getAllChildIds(nodeId);

    setNodes(prev => {
      // 从父节点的children中移除
      const updated = prev.map(n => ({
        ...n,
        children: n.children.filter(cid => !idsToDelete.includes(cid))
      }));
      // 删除节点本身及其子节点
      return updated.filter(n => !idsToDelete.includes(n.id));
    });

    setSelectedNode(null);
  };

  // 开始编辑节点
  const startEditing = (nodeId) => {
    const node = getNode(nodeId);
    if (node) {
      setEditingNode(nodeId);
      setEditText(node.text);
    }
  };

  // 保存编辑
  const saveEditing = () => {
    if (editingNode && editText.trim()) {
      setNodes(prev => prev.map(n =>
        n.id === editingNode ? { ...n, text: editText.trim() } : n
      ));
    }
    setEditingNode(null);
    setEditText('');
  };

  // 切换展开/折叠
  const toggleExpand = (nodeId) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, expanded: !n.expanded } : n
    ));
  };

  // 修改节点颜色
  const changeNodeColor = (nodeId, color) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, color } : n
    ));
    setShowColorPicker(false);
  };

  // 鼠标事件处理
  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    if (e.button === 0) {
      setSelectedNode(nodeId);
      setDragNode(nodeId);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.tagName === 'svg') {
      setSelectedNode(null);
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;

    if (dragNode) {
      setNodes(prev => prev.map(n =>
        n.id === dragNode ? { ...n, x: n.x + dx / zoom, y: n.y + dy / zoom } : n
      ));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (isPanning) {
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDragNode(null);
    setIsPanning(false);
  };

  // 缩放
  const handleZoom = (delta) => {
    setZoom(prev => Math.max(0.3, Math.min(2, prev + delta)));
  };

  // 重置视图
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // 导出为图片
  const exportImage = () => {
    const svg = canvasRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1600;
    canvas.height = 1200;

    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `思维导图_${new Date().toLocaleDateString()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // 保存数据
  const handleSave = () => {
    const data = {
      nodes,
      zoom,
      pan,
      savedAt: new Date().toISOString()
    };
    onSave?.(data);
    onClose?.();
  };

  // 渲染连接线
  const renderConnections = () => {
    const lines = [];
    
    nodes.forEach(node => {
      if (!node.expanded) return;
      
      node.children.forEach(childId => {
        const child = getNode(childId);
        if (!child) return;

        // 贝塞尔曲线
        const midX = (node.x + child.x) / 2;
        const path = `M ${node.x} ${node.y} Q ${midX} ${node.y} ${midX} ${(node.y + child.y) / 2} T ${child.x} ${child.y}`;

        lines.push(
          <path
            key={`${node.id}-${childId}`}
            d={path}
            stroke={child.color}
            strokeWidth={2}
            fill="none"
            opacity={0.6}
          />
        );
      });
    });

    return lines;
  };

  // 渲染节点
  const renderNodes = () => {
    return nodes.map(node => {
      const isSelected = selectedNode === node.id;
      const isEditing = editingNode === node.id;
      const hasChildren = node.children.length > 0;

      return (
        <g
          key={node.id}
          transform={`translate(${node.x}, ${node.y})`}
          onMouseDown={(e) => handleMouseDown(e, node.id)}
          onDoubleClick={() => startEditing(node.id)}
          style={{ cursor: 'pointer' }}
        >
          {/* 节点背景 */}
          <rect
            x={-60}
            y={-20}
            width={120}
            height={40}
            rx={node.isRoot ? 20 : 8}
            fill={node.color}
            stroke={isSelected ? '#000' : 'transparent'}
            strokeWidth={2}
            opacity={isSelected ? 1 : 0.9}
            className="transition-all duration-200"
          />

          {/* 节点文字 */}
          {isEditing ? (
            <foreignObject x={-55} y={-15} width={110} height={30}>
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={saveEditing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEditing();
                  if (e.key === 'Escape') setEditingNode(null);
                }}
                autoFocus
                className="w-full h-full bg-white text-center text-sm rounded outline-none px-1"
              />
            </foreignObject>
          ) : (
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={node.isRoot ? 14 : 12}
              fontWeight={node.isRoot ? 'bold' : 'normal'}
              className="pointer-events-none select-none"
            >
              {node.text.length > 8 ? node.text.slice(0, 8) + '...' : node.text}
            </text>
          )}

          {/* 展开/折叠按钮 */}
          {hasChildren && (
            <g
              transform="translate(55, 0)"
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
              className="cursor-pointer"
            >
              <circle r={10} fill="white" stroke={node.color} strokeWidth={2} />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={14}
                fill={node.color}
              >
                {node.expanded ? '−' : '+'}
              </text>
            </g>
          )}
        </g>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full flex flex-col">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg">
              <X size={20} />
            </button>
            <span className="font-medium text-slate-700">🧠 思维导图</span>
            
            {/* 模板选择 */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-slate-500">快速模板:</span>
              {Object.entries(SUBJECT_TEMPLATES).map(([key, template]) => {
                const Icon = template.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setNodes(convertTemplateToNodes(template))}
                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg hover:bg-slate-200"
                    style={{ color: template.color }}
                  >
                    <Icon size={14} />
                    {template.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 缩放控制 */}
            <div className="flex items-center gap-1 bg-white rounded-lg border px-2 py-1">
              <button onClick={() => handleZoom(-0.1)} className="p-1 hover:bg-slate-100 rounded">
                <ZoomOut size={16} />
              </button>
              <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => handleZoom(0.1)} className="p-1 hover:bg-slate-100 rounded">
                <ZoomIn size={16} />
              </button>
            </div>

            <button onClick={resetView} className="p-2 hover:bg-slate-200 rounded-lg" title="重置视图">
              <RotateCcw size={18} />
            </button>

            <div className="w-px h-6 bg-slate-300 mx-2" />

            <button onClick={exportImage} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-200 rounded-lg">
              <Download size={18} />
              <span className="text-sm">导出图片</span>
            </button>

            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <Save size={18} />
              <span className="text-sm">保存</span>
            </button>
          </div>
        </div>

        {/* 主体区域 */}
        <div className="flex-1 flex">
          {/* 左侧工具面板 */}
          <div className="w-48 bg-slate-50 border-r p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">节点操作</h3>
              <div className="space-y-2">
                <button
                  onClick={() => selectedNode && addChildNode(selectedNode)}
                  disabled={!selectedNode}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Plus size={16} />
                  添加子节点
                </button>
                <button
                  onClick={() => selectedNode && startEditing(selectedNode)}
                  disabled={!selectedNode}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Edit3 size={16} />
                  编辑节点
                </button>
                <button
                  onClick={() => selectedNode && deleteNode(selectedNode)}
                  disabled={!selectedNode || getNode(selectedNode)?.isRoot}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Trash2 size={16} />
                  删除节点
                </button>
              </div>
            </div>

            {/* 颜色选择 */}
            {selectedNode && (
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">节点颜色</h3>
                <div className="grid grid-cols-5 gap-1">
                  {NODE_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => changeNodeColor(selectedNode, color)}
                      className="w-7 h-7 rounded-full border-2 border-white shadow hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 快捷键提示 */}
            <div className="text-xs text-slate-500 space-y-1 pt-4 border-t">
              <p><kbd className="px-1 bg-slate-200 rounded">双击</kbd> 编辑节点</p>
              <p><kbd className="px-1 bg-slate-200 rounded">拖拽</kbd> 移动节点</p>
              <p><kbd className="px-1 bg-slate-200 rounded">滚轮</kbd> 缩放画布</p>
            </div>
          </div>

          {/* 画布区域 */}
          <div
            ref={containerRef}
            className="flex-1 overflow-hidden bg-slate-100"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={(e) => handleZoom(e.deltaY > 0 ? -0.05 : 0.05)}
          >
            <div
              ref={canvasRef}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                width: '100%',
                height: '100%'
              }}
            >
              <svg width="100%" height="100%" className="absolute inset-0">
                {/* 网格背景 */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* 连接线 */}
                <g>{renderConnections()}</g>

                {/* 节点 */}
                <g>{renderNodes()}</g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindMap;

import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Plus, Save, Download, Trash2, X, RotateCcw,
  BookOpen, Cpu, HardDrive, Network, Palette
} from 'lucide-react';

// 408科目模板
const SUBJECT_TEMPLATES = {
  ds: {
    name: '数据结构',
    icon: BookOpen,
    color: '#3B82F6',
    nodes: [
      { id: 'root', data: { label: '数据结构' }, position: { x: 400, y: 50 }, type: 'input', style: { background: '#3B82F6', color: 'white', fontWeight: 'bold', borderRadius: 20, padding: '10px 20px' } },
      { id: 'n1', data: { label: '线性结构' }, position: { x: 100, y: 150 }, style: { background: '#60A5FA', color: 'white', borderRadius: 8 } },
      { id: 'n2', data: { label: '树形结构' }, position: { x: 300, y: 150 }, style: { background: '#60A5FA', color: 'white', borderRadius: 8 } },
      { id: 'n3', data: { label: '图' }, position: { x: 500, y: 150 }, style: { background: '#60A5FA', color: 'white', borderRadius: 8 } },
      { id: 'n4', data: { label: '查找' }, position: { x: 650, y: 150 }, style: { background: '#60A5FA', color: 'white', borderRadius: 8 } },
      { id: 'n5', data: { label: '排序' }, position: { x: 800, y: 150 }, style: { background: '#60A5FA', color: 'white', borderRadius: 8 } },
      // 线性结构子节点
      { id: 'n1-1', data: { label: '数组' }, position: { x: 20, y: 250 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n1-2', data: { label: '链表' }, position: { x: 100, y: 250 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n1-3', data: { label: '栈' }, position: { x: 180, y: 250 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n1-4', data: { label: '队列' }, position: { x: 20, y: 310 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      // 树形结构子节点
      { id: 'n2-1', data: { label: '二叉树' }, position: { x: 250, y: 250 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n2-2', data: { label: 'BST' }, position: { x: 330, y: 250 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n2-3', data: { label: 'AVL/红黑树' }, position: { x: 250, y: 310 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n2-4', data: { label: 'B树/B+树' }, position: { x: 350, y: 310 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      // 图子节点
      { id: 'n3-1', data: { label: 'DFS/BFS' }, position: { x: 450, y: 250 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n3-2', data: { label: '最短路径' }, position: { x: 530, y: 250 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n3-3', data: { label: '最小生成树' }, position: { x: 480, y: 310 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      // 查找子节点
      { id: 'n4-1', data: { label: '二分查找' }, position: { x: 620, y: 250 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n4-2', data: { label: '哈希查找' }, position: { x: 700, y: 250 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      // 排序子节点
      { id: 'n5-1', data: { label: '快速排序' }, position: { x: 770, y: 250 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n5-2', data: { label: '归并排序' }, position: { x: 850, y: 250 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n5-3', data: { label: '堆排序' }, position: { x: 810, y: 310 }, style: { background: '#93C5FD', borderRadius: 6, fontSize: 12 } },
    ],
    edges: [
      { id: 'e-root-1', source: 'root', target: 'n1', animated: true },
      { id: 'e-root-2', source: 'root', target: 'n2', animated: true },
      { id: 'e-root-3', source: 'root', target: 'n3', animated: true },
      { id: 'e-root-4', source: 'root', target: 'n4', animated: true },
      { id: 'e-root-5', source: 'root', target: 'n5', animated: true },
      { id: 'e-1-1', source: 'n1', target: 'n1-1' },
      { id: 'e-1-2', source: 'n1', target: 'n1-2' },
      { id: 'e-1-3', source: 'n1', target: 'n1-3' },
      { id: 'e-1-4', source: 'n1', target: 'n1-4' },
      { id: 'e-2-1', source: 'n2', target: 'n2-1' },
      { id: 'e-2-2', source: 'n2', target: 'n2-2' },
      { id: 'e-2-3', source: 'n2', target: 'n2-3' },
      { id: 'e-2-4', source: 'n2', target: 'n2-4' },
      { id: 'e-3-1', source: 'n3', target: 'n3-1' },
      { id: 'e-3-2', source: 'n3', target: 'n3-2' },
      { id: 'e-3-3', source: 'n3', target: 'n3-3' },
      { id: 'e-4-1', source: 'n4', target: 'n4-1' },
      { id: 'e-4-2', source: 'n4', target: 'n4-2' },
      { id: 'e-5-1', source: 'n5', target: 'n5-1' },
      { id: 'e-5-2', source: 'n5', target: 'n5-2' },
      { id: 'e-5-3', source: 'n5', target: 'n5-3' },
    ]
  },
  co: {
    name: '计算机组成原理',
    icon: Cpu,
    color: '#8B5CF6',
    nodes: [
      { id: 'root', data: { label: '计算机组成原理' }, position: { x: 400, y: 50 }, type: 'input', style: { background: '#8B5CF6', color: 'white', fontWeight: 'bold', borderRadius: 20, padding: '10px 20px' } },
      { id: 'n1', data: { label: '数据表示' }, position: { x: 100, y: 150 }, style: { background: '#A78BFA', color: 'white', borderRadius: 8 } },
      { id: 'n2', data: { label: '运算器' }, position: { x: 250, y: 150 }, style: { background: '#A78BFA', color: 'white', borderRadius: 8 } },
      { id: 'n3', data: { label: '存储系统' }, position: { x: 400, y: 150 }, style: { background: '#A78BFA', color: 'white', borderRadius: 8 } },
      { id: 'n4', data: { label: 'CPU' }, position: { x: 550, y: 150 }, style: { background: '#A78BFA', color: 'white', borderRadius: 8 } },
      { id: 'n5', data: { label: '总线与I/O' }, position: { x: 700, y: 150 }, style: { background: '#A78BFA', color: 'white', borderRadius: 8 } },
      { id: 'n1-1', data: { label: '原/反/补码' }, position: { x: 50, y: 250 }, style: { background: '#C4B5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n1-2', data: { label: '浮点数' }, position: { x: 150, y: 250 }, style: { background: '#C4B5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n3-1', data: { label: '主存' }, position: { x: 350, y: 250 }, style: { background: '#C4B5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n3-2', data: { label: 'Cache' }, position: { x: 420, y: 250 }, style: { background: '#C4B5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n3-3', data: { label: '虚拟存储' }, position: { x: 380, y: 310 }, style: { background: '#C4B5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n4-1', data: { label: '指令系统' }, position: { x: 500, y: 250 }, style: { background: '#C4B5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n4-2', data: { label: '流水线' }, position: { x: 580, y: 250 }, style: { background: '#C4B5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n5-1', data: { label: '中断' }, position: { x: 680, y: 250 }, style: { background: '#C4B5FD', borderRadius: 6, fontSize: 12 } },
      { id: 'n5-2', data: { label: 'DMA' }, position: { x: 750, y: 250 }, style: { background: '#C4B5FD', borderRadius: 6, fontSize: 12 } },
    ],
    edges: [
      { id: 'e-root-1', source: 'root', target: 'n1', animated: true },
      { id: 'e-root-2', source: 'root', target: 'n2', animated: true },
      { id: 'e-root-3', source: 'root', target: 'n3', animated: true },
      { id: 'e-root-4', source: 'root', target: 'n4', animated: true },
      { id: 'e-root-5', source: 'root', target: 'n5', animated: true },
      { id: 'e-1-1', source: 'n1', target: 'n1-1' },
      { id: 'e-1-2', source: 'n1', target: 'n1-2' },
      { id: 'e-3-1', source: 'n3', target: 'n3-1' },
      { id: 'e-3-2', source: 'n3', target: 'n3-2' },
      { id: 'e-3-3', source: 'n3', target: 'n3-3' },
      { id: 'e-4-1', source: 'n4', target: 'n4-1' },
      { id: 'e-4-2', source: 'n4', target: 'n4-2' },
      { id: 'e-5-1', source: 'n5', target: 'n5-1' },
      { id: 'e-5-2', source: 'n5', target: 'n5-2' },
    ]
  },
  os: {
    name: '操作系统',
    icon: HardDrive,
    color: '#10B981',
    nodes: [
      { id: 'root', data: { label: '操作系统' }, position: { x: 400, y: 50 }, type: 'input', style: { background: '#10B981', color: 'white', fontWeight: 'bold', borderRadius: 20, padding: '10px 20px' } },
      { id: 'n1', data: { label: '进程管理' }, position: { x: 150, y: 150 }, style: { background: '#34D399', color: 'white', borderRadius: 8 } },
      { id: 'n2', data: { label: '内存管理' }, position: { x: 350, y: 150 }, style: { background: '#34D399', color: 'white', borderRadius: 8 } },
      { id: 'n3', data: { label: '文件系统' }, position: { x: 550, y: 150 }, style: { background: '#34D399', color: 'white', borderRadius: 8 } },
      { id: 'n4', data: { label: 'I/O管理' }, position: { x: 700, y: 150 }, style: { background: '#34D399', color: 'white', borderRadius: 8 } },
      { id: 'n1-1', data: { label: '进程/线程' }, position: { x: 80, y: 250 }, style: { background: '#6EE7B7', borderRadius: 6, fontSize: 12 } },
      { id: 'n1-2', data: { label: '调度算法' }, position: { x: 170, y: 250 }, style: { background: '#6EE7B7', borderRadius: 6, fontSize: 12 } },
      { id: 'n1-3', data: { label: '同步互斥' }, position: { x: 80, y: 310 }, style: { background: '#6EE7B7', borderRadius: 6, fontSize: 12 } },
      { id: 'n1-4', data: { label: '死锁' }, position: { x: 170, y: 310 }, style: { background: '#6EE7B7', borderRadius: 6, fontSize: 12 } },
      { id: 'n2-1', data: { label: '分页' }, position: { x: 300, y: 250 }, style: { background: '#6EE7B7', borderRadius: 6, fontSize: 12 } },
      { id: 'n2-2', data: { label: '分段' }, position: { x: 370, y: 250 }, style: { background: '#6EE7B7', borderRadius: 6, fontSize: 12 } },
      { id: 'n2-3', data: { label: '虚拟内存' }, position: { x: 330, y: 310 }, style: { background: '#6EE7B7', borderRadius: 6, fontSize: 12 } },
      { id: 'n3-1', data: { label: '目录结构' }, position: { x: 500, y: 250 }, style: { background: '#6EE7B7', borderRadius: 6, fontSize: 12 } },
      { id: 'n3-2', data: { label: '磁盘调度' }, position: { x: 590, y: 250 }, style: { background: '#6EE7B7', borderRadius: 6, fontSize: 12 } },
    ],
    edges: [
      { id: 'e-root-1', source: 'root', target: 'n1', animated: true },
      { id: 'e-root-2', source: 'root', target: 'n2', animated: true },
      { id: 'e-root-3', source: 'root', target: 'n3', animated: true },
      { id: 'e-root-4', source: 'root', target: 'n4', animated: true },
      { id: 'e-1-1', source: 'n1', target: 'n1-1' },
      { id: 'e-1-2', source: 'n1', target: 'n1-2' },
      { id: 'e-1-3', source: 'n1', target: 'n1-3' },
      { id: 'e-1-4', source: 'n1', target: 'n1-4' },
      { id: 'e-2-1', source: 'n2', target: 'n2-1' },
      { id: 'e-2-2', source: 'n2', target: 'n2-2' },
      { id: 'e-2-3', source: 'n2', target: 'n2-3' },
      { id: 'e-3-1', source: 'n3', target: 'n3-1' },
      { id: 'e-3-2', source: 'n3', target: 'n3-2' },
    ]
  },
  cn: {
    name: '计算机网络',
    icon: Network,
    color: '#F59E0B',
    nodes: [
      { id: 'root', data: { label: '计算机网络' }, position: { x: 400, y: 50 }, type: 'input', style: { background: '#F59E0B', color: 'white', fontWeight: 'bold', borderRadius: 20, padding: '10px 20px' } },
      { id: 'n1', data: { label: '物理层' }, position: { x: 100, y: 150 }, style: { background: '#FBBF24', color: 'white', borderRadius: 8 } },
      { id: 'n2', data: { label: '数据链路层' }, position: { x: 250, y: 150 }, style: { background: '#FBBF24', color: 'white', borderRadius: 8 } },
      { id: 'n3', data: { label: '网络层' }, position: { x: 420, y: 150 }, style: { background: '#FBBF24', color: 'white', borderRadius: 8 } },
      { id: 'n4', data: { label: '传输层' }, position: { x: 570, y: 150 }, style: { background: '#FBBF24', color: 'white', borderRadius: 8 } },
      { id: 'n5', data: { label: '应用层' }, position: { x: 720, y: 150 }, style: { background: '#FBBF24', color: 'white', borderRadius: 8 } },
      { id: 'n2-1', data: { label: 'CSMA/CD' }, position: { x: 200, y: 250 }, style: { background: '#FCD34D', borderRadius: 6, fontSize: 12 } },
      { id: 'n2-2', data: { label: '以太网' }, position: { x: 290, y: 250 }, style: { background: '#FCD34D', borderRadius: 6, fontSize: 12 } },
      { id: 'n3-1', data: { label: 'IP协议' }, position: { x: 370, y: 250 }, style: { background: '#FCD34D', borderRadius: 6, fontSize: 12 } },
      { id: 'n3-2', data: { label: '路由算法' }, position: { x: 450, y: 250 }, style: { background: '#FCD34D', borderRadius: 6, fontSize: 12 } },
      { id: 'n4-1', data: { label: 'TCP' }, position: { x: 530, y: 250 }, style: { background: '#FCD34D', borderRadius: 6, fontSize: 12 } },
      { id: 'n4-2', data: { label: 'UDP' }, position: { x: 600, y: 250 }, style: { background: '#FCD34D', borderRadius: 6, fontSize: 12 } },
      { id: 'n4-3', data: { label: '拥塞控制' }, position: { x: 560, y: 310 }, style: { background: '#FCD34D', borderRadius: 6, fontSize: 12 } },
      { id: 'n5-1', data: { label: 'HTTP' }, position: { x: 680, y: 250 }, style: { background: '#FCD34D', borderRadius: 6, fontSize: 12 } },
      { id: 'n5-2', data: { label: 'DNS' }, position: { x: 750, y: 250 }, style: { background: '#FCD34D', borderRadius: 6, fontSize: 12 } },
    ],
    edges: [
      { id: 'e-root-1', source: 'root', target: 'n1', animated: true },
      { id: 'e-root-2', source: 'root', target: 'n2', animated: true },
      { id: 'e-root-3', source: 'root', target: 'n3', animated: true },
      { id: 'e-root-4', source: 'root', target: 'n4', animated: true },
      { id: 'e-root-5', source: 'root', target: 'n5', animated: true },
      { id: 'e-2-1', source: 'n2', target: 'n2-1' },
      { id: 'e-2-2', source: 'n2', target: 'n2-2' },
      { id: 'e-3-1', source: 'n3', target: 'n3-1' },
      { id: 'e-3-2', source: 'n3', target: 'n3-2' },
      { id: 'e-4-1', source: 'n4', target: 'n4-1' },
      { id: 'e-4-2', source: 'n4', target: 'n4-2' },
      { id: 'e-4-3', source: 'n4', target: 'n4-3' },
      { id: 'e-5-1', source: 'n5', target: 'n5-1' },
      { id: 'e-5-2', source: 'n5', target: 'n5-2' },
    ]
  }
};

const NODE_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const MindMapPro = ({ isOpen, onClose, onSave, subject }) => {
  const initialTemplate = subject && SUBJECT_TEMPLATES[subject] 
    ? SUBJECT_TEMPLATES[subject] 
    : { nodes: [{ id: 'root', data: { label: '中心主题' }, position: { x: 400, y: 200 }, type: 'input', style: { background: '#3B82F6', color: 'white', fontWeight: 'bold', borderRadius: 20, padding: '10px 20px' } }], edges: [] };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialTemplate.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialTemplate.edges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 连接节点
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#888' } }, eds)),
    [setEdges]
  );

  // 选择节点
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setEditingLabel(node.data.label);
  }, []);

  // 添加子节点
  const addChildNode = useCallback(() => {
    if (!selectedNode) return;

    const newId = `node_${Date.now()}`;
    const newNode = {
      id: newId,
      data: { label: '新节点' },
      position: {
        x: selectedNode.position.x + 150,
        y: selectedNode.position.y + 80
      },
      style: {
        background: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
        color: 'white',
        borderRadius: 8,
        padding: '8px 16px'
      }
    };

    const newEdge = {
      id: `e-${selectedNode.id}-${newId}`,
      source: selectedNode.id,
      target: newId,
      animated: false,
      style: { stroke: '#888' }
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
  }, [selectedNode, setNodes, setEdges]);

  // 删除节点
  const deleteNode = useCallback(() => {
    if (!selectedNode || selectedNode.id === 'root') return;

    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  // 更新节点标签
  const updateNodeLabel = useCallback(() => {
    if (!selectedNode || !editingLabel.trim()) return;

    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, label: editingLabel } }
          : n
      )
    );
  }, [selectedNode, editingLabel, setNodes]);

  // 修改节点颜色
  const changeNodeColor = useCallback((color) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, style: { ...n.style, background: color } }
          : n
      )
    );
    setShowColorPicker(false);
  }, [selectedNode, setNodes]);

  // 加载模板
  const loadTemplate = useCallback((templateKey) => {
    const template = SUBJECT_TEMPLATES[templateKey];
    if (template) {
      setNodes(template.nodes);
      setEdges(template.edges);
      setSelectedNode(null);
    }
  }, [setNodes, setEdges]);

  // 导出图片
  const exportImage = useCallback(() => {
    // 使用html2canvas或其他方式导出
    alert('导出功能开发中...');
  }, []);

  // 保存
  const handleSave = useCallback(() => {
    const data = {
      nodes,
      edges,
      savedAt: new Date().toISOString()
    };
    onSave?.(data);
    onClose?.();
  }, [nodes, edges, onSave, onClose]);

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
            <span className="font-medium text-slate-700">🧠 思维导图 Pro</span>
            
            {/* 模板选择 */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-slate-500">模板:</span>
              {Object.entries(SUBJECT_TEMPLATES).map(([key, template]) => {
                const Icon = template.icon;
                return (
                  <button
                    key={key}
                    onClick={() => loadTemplate(key)}
                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg hover:bg-slate-200 transition-colors"
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
            <button onClick={exportImage} className="flex items-center gap-1 px-3 py-2 hover:bg-slate-200 rounded-lg">
              <Download size={18} />
              <span className="text-sm">导出</span>
            </button>
            <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <Save size={18} />
              <span className="text-sm">保存</span>
            </button>
          </div>
        </div>

        {/* 主体区域 */}
        <div className="flex-1 flex">
          {/* 左侧工具面板 */}
          <div className="w-56 bg-slate-50 border-r p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">节点操作</h3>
              <div className="space-y-2">
                <button
                  onClick={addChildNode}
                  disabled={!selectedNode}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-slate-50 disabled:opacity-50 text-sm"
                >
                  <Plus size={16} />
                  添加子节点
                </button>
                <button
                  onClick={deleteNode}
                  disabled={!selectedNode || selectedNode?.id === 'root'}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-50 text-sm"
                >
                  <Trash2 size={16} />
                  删除节点
                </button>
              </div>
            </div>

            {/* 编辑节点 */}
            {selectedNode && (
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">编辑节点</h3>
                <input
                  type="text"
                  value={editingLabel}
                  onChange={(e) => setEditingLabel(e.target.value)}
                  onBlur={updateNodeLabel}
                  onKeyDown={(e) => e.key === 'Enter' && updateNodeLabel()}
                  className="w-full px-3 py-2 border rounded-lg text-sm mb-2"
                  placeholder="节点名称"
                />
                
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-sm"
                  >
                    <Palette size={16} />
                    修改颜色
                  </button>
                  
                  {showColorPicker && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border grid grid-cols-5 gap-1 z-10">
                      {NODE_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => changeNodeColor(color)}
                          className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 使用提示 */}
            <div className="text-xs text-slate-500 space-y-1 pt-4 border-t">
              <p>💡 <strong>使用提示</strong></p>
              <p>• 点击节点选中</p>
              <p>• 拖拽节点移动位置</p>
              <p>• 滚轮缩放画布</p>
              <p>• 从节点边缘拖出连接线</p>
            </div>
          </div>

          {/* ReactFlow 画布 */}
          <div className="flex-1">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              fitView
              attributionPosition="bottom-left"
              defaultEdgeOptions={{
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed }
              }}
            >
              <Controls />
              <Background variant="dots" gap={20} size={1} />
              <Panel position="top-right" className="bg-white/80 rounded-lg p-2 text-xs text-slate-500">
                节点: {nodes.length} | 连接: {edges.length}
              </Panel>
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindMapPro;

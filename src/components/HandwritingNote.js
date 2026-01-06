import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Pen, Eraser, Trash2, Save, Download, Undo, Redo, 
  Minus, Plus, Maximize2, Minimize2, ChevronDown, Circle, Square,
  Type, MousePointer, Move, ZoomIn, ZoomOut, RotateCcw, Grid,
  Highlighter, PenTool, Pipette, Layers, Image as ImageIcon,
  Github, Upload, Check, AlertCircle
} from 'lucide-react';

const HandwritingNote = ({ isOpen, onClose, onSave, videoTitle }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // pen, eraser, highlighter, line, rect, circle, text, select
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [paths, setPaths] = useState([]); // 所有路径
  const [currentPoints, setCurrentPoints] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizeSlider, setShowSizeSlider] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [images, setImages] = useState([]); // 插入的图片
  const [githubStatus, setGithubStatus] = useState({ configured: false, connected: false, username: null });
  const [uploading, setUploading] = useState(false);
  const [showGithubConfig, setShowGithubConfig] = useState(false);
  const [githubClientId, setGithubClientId] = useState('');
  const [githubClientSecret, setGithubClientSecret] = useState('');

  // 检查GitHub状态
  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:3001/api/github/status')
        .then(res => res.json())
        .then(data => setGithubStatus(data))
        .catch(console.error);
    }
  }, [isOpen]);

  const colors = [
    '#000000', '#333333', '#666666', '#999999',
    '#FF0000', '#FF6B6B', '#FF9500', '#FFCC00',
    '#00FF00', '#4ECDC4', '#00CED1', '#0066FF',
    '#6B5B95', '#9B59B6', '#E91E63', '#795548'
  ];

  const highlighterColors = [
    'rgba(255, 255, 0, 0.4)',
    'rgba(0, 255, 0, 0.4)',
    'rgba(255, 182, 193, 0.4)',
    'rgba(135, 206, 250, 0.4)',
    'rgba(255, 165, 0, 0.4)'
  ];

  // 保存到历史记录
  const saveToHistory = (newPaths) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newPaths]);
    setHistory(newHistory.slice(-50));
    setHistoryIndex(newHistory.length - 1);
  };

  // 撤销
  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setPaths([...history[newIndex]]);
  };

  // 重做
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setPaths([...history[newIndex]]);
  };

  // 清空画布
  const clearCanvas = () => {
    if (!window.confirm('确定要清空画布吗？')) return;
    setPaths([]);
    saveToHistory([]);
  };

  // 获取鼠标/触摸位置（相对于SVG）
  const getPosition = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // 将点数组转换为SVG路径
  const pointsToPath = (points) => {
    if (points.length < 2) return '';
    
    let d = `M ${points[0].x} ${points[0].y}`;
    
    // 使用贝塞尔曲线平滑路径
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x} ${points[i].y} ${xc} ${yc}`;
    }
    
    // 最后一个点
    if (points.length > 1) {
      const last = points[points.length - 1];
      d += ` L ${last.x} ${last.y}`;
    }
    
    return d;
  };

  // 开始绘制
  const startDrawing = (e) => {
    e.preventDefault();
    const pos = getPosition(e);
    setStartPoint(pos);
    setIsDrawing(true);
    
    if (tool === 'text') {
      setTextPosition(pos);
      return;
    }
    
    if (tool === 'pen' || tool === 'eraser' || tool === 'highlighter') {
      setCurrentPoints([pos]);
    }
  };

  // 绘制中
  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const pos = getPosition(e);
    
    if (tool === 'pen' || tool === 'eraser' || tool === 'highlighter') {
      setCurrentPoints(prev => [...prev, pos]);
    } else if (tool === 'line' || tool === 'rect' || tool === 'circle') {
      setCurrentPoints([startPoint, pos]);
    }
  };

  // 结束绘制
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (tool === 'text') return;
    
    let newPath = null;
    
    if ((tool === 'pen' || tool === 'highlighter') && currentPoints.length > 1) {
      newPath = {
        id: Date.now(),
        type: 'path',
        d: pointsToPath(currentPoints),
        color: tool === 'highlighter' ? 'rgba(255, 255, 0, 0.4)' : color,
        width: tool === 'highlighter' ? lineWidth * 3 : lineWidth,
        opacity: tool === 'highlighter' ? 0.5 : 1
      };
    } else if (tool === 'eraser' && currentPoints.length > 1) {
      newPath = {
        id: Date.now(),
        type: 'path',
        d: pointsToPath(currentPoints),
        color: '#ffffff',
        width: lineWidth * 5,
        opacity: 1
      };
    } else if (tool === 'line' && startPoint && currentPoints.length === 2) {
      newPath = {
        id: Date.now(),
        type: 'line',
        x1: startPoint.x,
        y1: startPoint.y,
        x2: currentPoints[1].x,
        y2: currentPoints[1].y,
        color: color,
        width: lineWidth
      };
    } else if (tool === 'rect' && startPoint && currentPoints.length === 2) {
      const endPoint = currentPoints[1];
      newPath = {
        id: Date.now(),
        type: 'rect',
        x: Math.min(startPoint.x, endPoint.x),
        y: Math.min(startPoint.y, endPoint.y),
        width: Math.abs(endPoint.x - startPoint.x),
        height: Math.abs(endPoint.y - startPoint.y),
        color: color,
        strokeWidth: lineWidth,
        fill: 'none'
      };
    } else if (tool === 'circle' && startPoint && currentPoints.length === 2) {
      const endPoint = currentPoints[1];
      const cx = (startPoint.x + endPoint.x) / 2;
      const cy = (startPoint.y + endPoint.y) / 2;
      const rx = Math.abs(endPoint.x - startPoint.x) / 2;
      const ry = Math.abs(endPoint.y - startPoint.y) / 2;
      newPath = {
        id: Date.now(),
        type: 'ellipse',
        cx, cy, rx, ry,
        color: color,
        strokeWidth: lineWidth,
        fill: 'none'
      };
    }
    
    if (newPath) {
      const newPaths = [...paths, newPath];
      setPaths(newPaths);
      saveToHistory(newPaths);
    }
    
    setCurrentPoints([]);
    setStartPoint(null);
  };

  // 添加文字
  const addText = () => {
    if (!textInput.trim() || !textPosition) return;
    
    const newPath = {
      id: Date.now(),
      type: 'text',
      x: textPosition.x,
      y: textPosition.y,
      text: textInput,
      color: color,
      fontSize: lineWidth * 6
    };
    
    const newPaths = [...paths, newPath];
    setPaths(newPaths);
    saveToHistory(newPaths);
    setTextInput('');
    setTextPosition(null);
  };

  // 插入图片
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const newImage = {
        id: Date.now(),
        type: 'image',
        src: event.target.result,
        x: 100,
        y: 100,
        width: 200,
        height: 150
      };
      setImages([...images, newImage]);
    };
    reader.readAsDataURL(file);
  };

  // 保存GitHub Token（简化方式）
  const saveGithubToken = async () => {
    if (!githubClientId || (!githubClientId.startsWith('ghp_') && !githubClientId.startsWith('github_pat_'))) {
      alert('请输入有效的GitHub Token（以ghp_或github_pat_开头）');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:3001/api/github/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: githubClientId })
      });
      const data = await res.json();
      
      if (data.success) {
        setShowGithubConfig(false);
        setGithubStatus({ configured: true, connected: true, username: data.username });
        setGithubClientId('');
        alert(`连接成功！欢迎 ${data.username}`);
      } else {
        alert('连接失败: ' + (data.error || '未知错误'));
      }
    } catch (e) {
      alert('连接失败: ' + e.message);
    }
  };

  // 上传到GitHub
  const uploadToGithub = async () => {
    if (!githubStatus.connected) {
      alert('请先登录GitHub');
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await exportPNG();
      if (!dataUrl) {
        alert('导出图片失败');
        return;
      }

      const filename = `note_${videoTitle || 'untitled'}_${Date.now()}.png`;
      
      const res = await fetch('http://localhost:3001/api/github/upload-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: dataUrl,
          filename: filename,
          message: `添加笔记: ${videoTitle || '未命名'}`
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`笔记已上传到GitHub！\n${data.url}`);
      } else {
        alert('上传失败: ' + (data.error || '未知错误'));
      }
    } catch (e) {
      alert('上传失败: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  // 断开GitHub
  const disconnectGithub = async () => {
    await fetch('http://localhost:3001/api/github/disconnect', { method: 'POST' });
    setGithubStatus({ configured: githubStatus.configured, connected: false, username: null });
  };

  // 导出为SVG字符串
  const exportSVG = () => {
    if (!svgRef.current) return '';
    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg);
  };

  // 导出为PNG
  const exportPNG = () => {
    return new Promise((resolve) => {
      const svg = svgRef.current;
      if (!svg) return resolve(null);
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const rect = svg.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });
  };

  // 保存笔记
  const handleSave = async () => {
    const dataUrl = await exportPNG();
    if (dataUrl) {
      onSave?.(dataUrl);
      onClose?.();
    }
  };

  // 下载图片
  const downloadImage = async () => {
    const dataUrl = await exportPNG();
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.download = `笔记_${videoTitle || '未命名'}_${new Date().toLocaleDateString()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // 下载SVG
  const downloadSVG = () => {
    const svgData = exportSVG();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `笔记_${videoTitle || '未命名'}_${new Date().toLocaleDateString()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 切换全屏
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-8'}`}>
      <div 
        className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-[90%] h-[85%] max-w-6xl'
        }`}
      >
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Pen className="text-amber-500" size={20} />
            <span className="font-medium text-slate-700">手写笔记</span>
            {videoTitle && (
              <span className="text-sm text-slate-500 ml-2">- {videoTitle}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              title={isFullscreen ? '退出全屏' : '全屏'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 border-b border-slate-200 flex-wrap">
          {/* 绘图工具 */}
          <div className="flex items-center gap-0.5 mr-2 p-1 bg-white rounded-lg border border-slate-200">
            <button
              onClick={() => setTool('pen')}
              className={`p-2 rounded transition-colors ${
                tool === 'pen' ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100'
              }`}
              title="画笔 (P)"
            >
              <Pen size={16} />
            </button>
            <button
              onClick={() => setTool('highlighter')}
              className={`p-2 rounded transition-colors ${
                tool === 'highlighter' ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100'
              }`}
              title="荧光笔 (H)"
            >
              <Highlighter size={16} />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded transition-colors ${
                tool === 'eraser' ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100'
              }`}
              title="橡皮擦 (E)"
            >
              <Eraser size={16} />
            </button>
          </div>

          {/* 形状工具 */}
          <div className="flex items-center gap-0.5 mr-2 p-1 bg-white rounded-lg border border-slate-200">
            <button
              onClick={() => setTool('line')}
              className={`p-2 rounded transition-colors ${
                tool === 'line' ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100'
              }`}
              title="直线 (L)"
            >
              <Minus size={16} />
            </button>
            <button
              onClick={() => setTool('rect')}
              className={`p-2 rounded transition-colors ${
                tool === 'rect' ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100'
              }`}
              title="矩形 (R)"
            >
              <Square size={16} />
            </button>
            <button
              onClick={() => setTool('circle')}
              className={`p-2 rounded transition-colors ${
                tool === 'circle' ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100'
              }`}
              title="椭圆 (O)"
            >
              <Circle size={16} />
            </button>
            <button
              onClick={() => setTool('text')}
              className={`p-2 rounded transition-colors ${
                tool === 'text' ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100'
              }`}
              title="文字 (T)"
            >
              <Type size={16} />
            </button>
          </div>

          {/* 插入图片 */}
          <div className="mr-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
              title="插入图片"
            >
              <ImageIcon size={16} />
            </button>
          </div>

          {/* 颜色选择 */}
          <div className="relative mr-4">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <div 
                className="w-5 h-5 rounded-full border-2 border-slate-300"
                style={{ backgroundColor: color }}
              />
              <ChevronDown size={14} />
            </button>
            
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border border-slate-200 grid grid-cols-4 gap-1 z-10">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setShowColorPicker(false); }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                      color === c ? 'border-amber-500 scale-110' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 线条粗细 */}
          <div className="relative mr-4">
            <button
              onClick={() => setShowSizeSlider(!showSizeSlider)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <div className="flex items-center gap-1">
                <Minus size={12} />
                <div 
                  className="rounded-full bg-slate-700"
                  style={{ width: lineWidth * 2 + 4, height: lineWidth * 2 + 4 }}
                />
                <Plus size={12} />
              </div>
            </button>
            
            {showSizeSlider && (
              <div className="absolute top-full left-0 mt-1 p-3 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  className="w-32"
                />
                <div className="text-center text-xs text-slate-500 mt-1">{lineWidth}px</div>
              </div>
            )}
          </div>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-slate-300 mx-2" />

          {/* 撤销/重做 */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="撤销"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="重做"
          >
            <Redo size={18} />
          </button>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-slate-300 mx-2" />

          {/* 清空 */}
          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
            title="清空画布"
          >
            <Trash2 size={18} />
          </button>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-slate-300 mx-2" />

          {/* 网格 */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-200'}`}
            title="显示网格"
          >
            <Grid size={18} />
          </button>

          {/* 右侧操作 */}
          <div className="flex-1" />
          
          <button
            onClick={downloadImage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
            title="下载PNG"
          >
            <Download size={18} />
            <span className="text-sm">PNG</span>
          </button>

          <button
            onClick={downloadSVG}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
            title="下载SVG"
          >
            <Download size={18} />
            <span className="text-sm">SVG</span>
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Save size={18} />
            <span className="text-sm">保存笔记</span>
          </button>

          {/* GitHub按钮 */}
          <div className="relative ml-2">
            {githubStatus.connected ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={uploadToGithub}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 transition-colors"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Github size={18} />
                  )}
                  <span className="text-sm">上传GitHub</span>
                </button>
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Check size={12} />
                  {githubStatus.username}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowGithubConfig(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Github size={18} />
                <span className="text-sm">连接GitHub</span>
              </button>
            )}
          </div>
        </div>

        {/* GitHub配置弹窗 - 简化版使用Token */}
        {showGithubConfig && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[420px] shadow-2xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Github size={20} />
                连接GitHub
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700">
                  <strong>简单3步：</strong><br/>
                  1. 点击下方链接生成Token<br/>
                  2. 勾选 <code className="bg-blue-100 px-1 rounded">repo</code> 权限<br/>
                  3. 复制Token粘贴到下方
                </p>
              </div>
              <a 
                href="https://github.com/settings/tokens/new?description=408%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0&scopes=repo"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 mb-4"
              >
                👉 点击生成GitHub Token
              </a>
              <div>
                <label className="text-sm text-slate-600">粘贴你的Token</label>
                <input
                  type="password"
                  value={githubClientId}
                  onChange={(e) => setGithubClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg mt-1"
                  placeholder="ghp_xxxxxxxxxxxx"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={saveGithubToken}
                  disabled={!githubClientId}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                >
                  连接GitHub
                </button>
                <button
                  onClick={() => setShowGithubConfig(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SVG画布区域 */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden bg-white relative"
          style={{ 
            cursor: tool === 'pen' || tool === 'highlighter' ? 'crosshair' 
              : tool === 'eraser' ? 'cell' 
              : tool === 'text' ? 'text'
              : 'crosshair'
          }}
        >
          <svg
            ref={svgRef}
            className="w-full h-full touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ background: showGrid ? 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M 20 0 L 0 0 0 20\' fill=\'none\' stroke=\'%23e5e7eb\' stroke-width=\'0.5\'/%3E%3C/svg%3E")' : '#ffffff' }}
          >
            {/* 插入的图片 */}
            {images.map((img) => (
              <image
                key={img.id}
                href={img.src}
                x={img.x}
                y={img.y}
                width={img.width}
                height={img.height}
              />
            ))}

            {/* 已完成的图形 */}
            {paths.map((item) => {
              if (item.type === 'path' || !item.type) {
                return (
                  <path
                    key={item.id}
                    d={item.d}
                    stroke={item.color}
                    strokeWidth={item.width}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={item.opacity || 1}
                  />
                );
              } else if (item.type === 'line') {
                return (
                  <line
                    key={item.id}
                    x1={item.x1}
                    y1={item.y1}
                    x2={item.x2}
                    y2={item.y2}
                    stroke={item.color}
                    strokeWidth={item.width}
                    strokeLinecap="round"
                  />
                );
              } else if (item.type === 'rect') {
                return (
                  <rect
                    key={item.id}
                    x={item.x}
                    y={item.y}
                    width={item.width}
                    height={item.height}
                    stroke={item.color}
                    strokeWidth={item.strokeWidth}
                    fill={item.fill}
                  />
                );
              } else if (item.type === 'ellipse') {
                return (
                  <ellipse
                    key={item.id}
                    cx={item.cx}
                    cy={item.cy}
                    rx={item.rx}
                    ry={item.ry}
                    stroke={item.color}
                    strokeWidth={item.strokeWidth}
                    fill={item.fill}
                  />
                );
              } else if (item.type === 'text') {
                return (
                  <text
                    key={item.id}
                    x={item.x}
                    y={item.y}
                    fill={item.color}
                    fontSize={item.fontSize}
                    fontFamily="sans-serif"
                  >
                    {item.text}
                  </text>
                );
              }
              return null;
            })}
            
            {/* 当前正在绘制的图形预览 */}
            {currentPoints.length > 1 && (tool === 'pen' || tool === 'eraser' || tool === 'highlighter') && (
              <path
                d={pointsToPath(currentPoints)}
                stroke={tool === 'eraser' ? '#ffffff' : tool === 'highlighter' ? 'rgba(255,255,0,0.4)' : color}
                strokeWidth={tool === 'eraser' ? lineWidth * 5 : tool === 'highlighter' ? lineWidth * 3 : lineWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={tool === 'highlighter' ? 0.5 : 1}
              />
            )}
            
            {/* 直线预览 */}
            {tool === 'line' && startPoint && currentPoints.length === 2 && (
              <line
                x1={startPoint.x}
                y1={startPoint.y}
                x2={currentPoints[1].x}
                y2={currentPoints[1].y}
                stroke={color}
                strokeWidth={lineWidth}
                strokeLinecap="round"
                strokeDasharray="5,5"
              />
            )}
            
            {/* 矩形预览 */}
            {tool === 'rect' && startPoint && currentPoints.length === 2 && (
              <rect
                x={Math.min(startPoint.x, currentPoints[1].x)}
                y={Math.min(startPoint.y, currentPoints[1].y)}
                width={Math.abs(currentPoints[1].x - startPoint.x)}
                height={Math.abs(currentPoints[1].y - startPoint.y)}
                stroke={color}
                strokeWidth={lineWidth}
                fill="none"
                strokeDasharray="5,5"
              />
            )}
            
            {/* 椭圆预览 */}
            {tool === 'circle' && startPoint && currentPoints.length === 2 && (
              <ellipse
                cx={(startPoint.x + currentPoints[1].x) / 2}
                cy={(startPoint.y + currentPoints[1].y) / 2}
                rx={Math.abs(currentPoints[1].x - startPoint.x) / 2}
                ry={Math.abs(currentPoints[1].y - startPoint.y) / 2}
                stroke={color}
                strokeWidth={lineWidth}
                fill="none"
                strokeDasharray="5,5"
              />
            )}
          </svg>

          {/* 文字输入框 */}
          {textPosition && (
            <div
              className="absolute bg-white border-2 border-amber-400 rounded shadow-lg p-2"
              style={{ left: textPosition.x, top: textPosition.y }}
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addText()}
                placeholder="输入文字..."
                className="border-none outline-none text-sm w-40"
                autoFocus
              />
              <div className="flex gap-1 mt-1">
                <button
                  onClick={addText}
                  className="px-2 py-1 bg-amber-500 text-white text-xs rounded hover:bg-amber-600"
                >
                  确定
                </button>
                <button
                  onClick={() => { setTextPosition(null); setTextInput(''); }}
                  className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded hover:bg-slate-300"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 底部状态栏 */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>
              工具: {
                tool === 'pen' ? '画笔' : 
                tool === 'eraser' ? '橡皮擦' : 
                tool === 'highlighter' ? '荧光笔' :
                tool === 'line' ? '直线' :
                tool === 'rect' ? '矩形' :
                tool === 'circle' ? '椭圆' :
                tool === 'text' ? '文字' : tool
              }
            </span>
            <span>线宽: {lineWidth}px</span>
            <span>图形: {paths.length}个</span>
          </div>
          <div className="flex items-center gap-4">
            <span>历史: {historyIndex + 1}/{history.length}</span>
            {showGrid && <span className="text-blue-500">网格已开启</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandwritingNote;

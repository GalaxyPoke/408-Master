import React, { useState, useRef, useCallback } from 'react';
import {
  Pencil, Square, Circle, Type, Eraser, Undo, Redo, Download, Trash2,
  Move, Minus, ArrowRight, Save, FolderOpen, ZoomIn, ZoomOut, Palette
} from 'lucide-react';

const TOOLS = [
  { id: 'select', icon: Move, label: '选择' },
  { id: 'pen', icon: Pencil, label: '画笔' },
  { id: 'line', icon: Minus, label: '直线' },
  { id: 'arrow', icon: ArrowRight, label: '箭头' },
  { id: 'rect', icon: Square, label: '矩形' },
  { id: 'circle', icon: Circle, label: '圆形' },
  { id: 'text', icon: Type, label: '文字' },
  { id: 'eraser', icon: Eraser, label: '橡皮擦' },
];

const COLORS = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FF8000', '#8000FF', '#FFFFFF'
];

const DrawingBoard = () => {
  const svgRef = useRef(null);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fill, setFill] = useState('none');
  const [shapes, setShapes] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState(null);
  const [zoom, setZoom] = useState(1);

  // 保存到历史
  const saveToHistory = useCallback((newShapes) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newShapes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // 撤销
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setShapes(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  // 重做
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setShapes(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // 获取鼠标位置
  const getMousePos = useCallback((e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  }, [zoom]);

  // 开始绘制
  const handleMouseDown = useCallback((e) => {
    const pos = getMousePos(e);
    
    if (tool === 'text') {
      setTextPosition(pos);
      return;
    }
    
    setIsDrawing(true);
    setStartPoint(pos);
    
    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPath([pos]);
    }
  }, [tool, getMousePos]);

  // 绘制中
  const handleMouseMove = useCallback((e) => {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    
    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPath(prev => [...prev, pos]);
    } else {
      setStartPoint(prev => ({ ...prev, end: pos }));
    }
  }, [isDrawing, tool, getMousePos]);

  // 结束绘制
  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    let newShape = null;
    
    if (tool === 'pen' && currentPath.length > 1) {
      newShape = {
        type: 'path',
        points: currentPath,
        stroke: color,
        strokeWidth,
        fill: 'none'
      };
    } else if (tool === 'eraser' && currentPath.length > 1) {
      newShape = {
        type: 'path',
        points: currentPath,
        stroke: '#FFFFFF',
        strokeWidth: strokeWidth * 3,
        fill: 'none'
      };
    } else if (tool === 'line' && startPoint?.end) {
      newShape = {
        type: 'line',
        x1: startPoint.x,
        y1: startPoint.y,
        x2: startPoint.end.x,
        y2: startPoint.end.y,
        stroke: color,
        strokeWidth
      };
    } else if (tool === 'arrow' && startPoint?.end) {
      newShape = {
        type: 'arrow',
        x1: startPoint.x,
        y1: startPoint.y,
        x2: startPoint.end.x,
        y2: startPoint.end.y,
        stroke: color,
        strokeWidth
      };
    } else if (tool === 'rect' && startPoint?.end) {
      newShape = {
        type: 'rect',
        x: Math.min(startPoint.x, startPoint.end.x),
        y: Math.min(startPoint.y, startPoint.end.y),
        width: Math.abs(startPoint.end.x - startPoint.x),
        height: Math.abs(startPoint.end.y - startPoint.y),
        stroke: color,
        strokeWidth,
        fill
      };
    } else if (tool === 'circle' && startPoint?.end) {
      const cx = (startPoint.x + startPoint.end.x) / 2;
      const cy = (startPoint.y + startPoint.end.y) / 2;
      const rx = Math.abs(startPoint.end.x - startPoint.x) / 2;
      const ry = Math.abs(startPoint.end.y - startPoint.y) / 2;
      newShape = {
        type: 'ellipse',
        cx, cy, rx, ry,
        stroke: color,
        strokeWidth,
        fill
      };
    }
    
    if (newShape) {
      const newShapes = [...shapes, newShape];
      setShapes(newShapes);
      saveToHistory(newShapes);
    }
    
    setCurrentPath([]);
    setStartPoint(null);
  }, [isDrawing, tool, currentPath, startPoint, color, strokeWidth, fill, shapes, saveToHistory]);

  // 添加文字
  const addText = useCallback(() => {
    if (!textInput || !textPosition) return;
    
    const newShape = {
      type: 'text',
      x: textPosition.x,
      y: textPosition.y,
      text: textInput,
      fill: color,
      fontSize: strokeWidth * 6
    };
    
    const newShapes = [...shapes, newShape];
    setShapes(newShapes);
    saveToHistory(newShapes);
    setTextInput('');
    setTextPosition(null);
  }, [textInput, textPosition, color, strokeWidth, shapes, saveToHistory]);

  // 清空画布
  const clearCanvas = useCallback(() => {
    setShapes([]);
    saveToHistory([]);
  }, [saveToHistory]);

  // 导出 SVG
  const exportSVG = useCallback(() => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `绘图_${Date.now()}.svg`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  }, []);

  // 导出 PNG
  const exportPNG = useCallback(() => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `绘图_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, []);

  // 渲染形状
  const renderShape = (shape, index) => {
    switch (shape.type) {
      case 'path':
        return (
          <path
            key={index}
            d={shape.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case 'line':
        return (
          <line
            key={index}
            x1={shape.x1} y1={shape.y1}
            x2={shape.x2} y2={shape.y2}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
          />
        );
      case 'arrow':
        const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
        const arrowLen = 15;
        return (
          <g key={index}>
            <line
              x1={shape.x1} y1={shape.y1}
              x2={shape.x2} y2={shape.y2}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
            <polygon
              points={`
                ${shape.x2},${shape.y2}
                ${shape.x2 - arrowLen * Math.cos(angle - Math.PI / 6)},${shape.y2 - arrowLen * Math.sin(angle - Math.PI / 6)}
                ${shape.x2 - arrowLen * Math.cos(angle + Math.PI / 6)},${shape.y2 - arrowLen * Math.sin(angle + Math.PI / 6)}
              `}
              fill={shape.stroke}
            />
          </g>
        );
      case 'rect':
        return (
          <rect
            key={index}
            x={shape.x} y={shape.y}
            width={shape.width} height={shape.height}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            fill={shape.fill}
          />
        );
      case 'ellipse':
        return (
          <ellipse
            key={index}
            cx={shape.cx} cy={shape.cy}
            rx={shape.rx} ry={shape.ry}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            fill={shape.fill}
          />
        );
      case 'text':
        return (
          <text
            key={index}
            x={shape.x} y={shape.y}
            fill={shape.fill}
            fontSize={shape.fontSize}
            fontFamily="sans-serif"
          >
            {shape.text}
          </text>
        );
      default:
        return null;
    }
  };

  // 渲染当前绘制预览
  const renderPreview = () => {
    if (!isDrawing || !startPoint) return null;
    
    if ((tool === 'pen' || tool === 'eraser') && currentPath.length > 1) {
      return (
        <path
          d={currentPath.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
          stroke={tool === 'eraser' ? '#CCCCCC' : color}
          strokeWidth={tool === 'eraser' ? strokeWidth * 3 : strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={tool === 'eraser' ? '5,5' : 'none'}
        />
      );
    }
    
    if (!startPoint.end) return null;
    
    if (tool === 'line' || tool === 'arrow') {
      return (
        <line
          x1={startPoint.x} y1={startPoint.y}
          x2={startPoint.end.x} y2={startPoint.end.y}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray="5,5"
        />
      );
    }
    
    if (tool === 'rect') {
      return (
        <rect
          x={Math.min(startPoint.x, startPoint.end.x)}
          y={Math.min(startPoint.y, startPoint.end.y)}
          width={Math.abs(startPoint.end.x - startPoint.x)}
          height={Math.abs(startPoint.end.y - startPoint.y)}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray="5,5"
        />
      );
    }
    
    if (tool === 'circle') {
      const cx = (startPoint.x + startPoint.end.x) / 2;
      const cy = (startPoint.y + startPoint.end.y) / 2;
      const rx = Math.abs(startPoint.end.x - startPoint.x) / 2;
      const ry = Math.abs(startPoint.end.y - startPoint.y) / 2;
      return (
        <ellipse
          cx={cx} cy={cy} rx={rx} ry={ry}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray="5,5"
        />
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 p-3 border-b bg-slate-50 flex-wrap">
        {/* 绘图工具 */}
        <div className="flex items-center gap-1 border-r pr-2">
          {TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`p-2 rounded-lg transition-colors ${
                tool === t.id ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-200 text-slate-600'
              }`}
              title={t.label}
            >
              <t.icon size={18} />
            </button>
          ))}
        </div>

        {/* 颜色选择 */}
        <div className="flex items-center gap-1 border-r pr-2">
          {COLORS.slice(0, 6).map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                color === c ? 'border-indigo-500 scale-110' : 'border-slate-300'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* 线宽 */}
        <div className="flex items-center gap-2 border-r pr-2">
          <span className="text-xs text-slate-500">线宽</span>
          <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-16"
          />
          <span className="text-xs text-slate-600 w-4">{strokeWidth}</span>
        </div>

        {/* 填充 */}
        <div className="flex items-center gap-2 border-r pr-2">
          <label className="flex items-center gap-1 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={fill !== 'none'}
              onChange={(e) => setFill(e.target.checked ? color : 'none')}
              className="rounded"
            />
            填充
          </label>
        </div>

        {/* 缩放 */}
        <div className="flex items-center gap-1 border-r pr-2">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 hover:bg-slate-200 rounded">
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-slate-600 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1 hover:bg-slate-200 rounded">
            <ZoomIn size={16} />
          </button>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-slate-200 rounded-lg disabled:opacity-30" title="撤销">
            <Undo size={18} />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-slate-200 rounded-lg disabled:opacity-30" title="重做">
            <Redo size={18} />
          </button>
          <button onClick={clearCanvas} className="p-2 hover:bg-red-100 text-red-500 rounded-lg" title="清空">
            <Trash2 size={18} />
          </button>
          <button onClick={exportSVG} className="p-2 hover:bg-slate-200 rounded-lg" title="导出SVG">
            <Download size={18} />
          </button>
          <button onClick={exportPNG} className="px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600" title="导出PNG">
            导出PNG
          </button>
        </div>
      </div>

      {/* 画布 */}
      <div className="relative overflow-auto bg-slate-100" style={{ height: '500px' }}>
        <svg
          ref={svgRef}
          width={800 * zoom}
          height={600 * zoom}
          viewBox="0 0 800 600"
          className="bg-white shadow-inner cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 网格背景 */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* 已绘制的形状 */}
          {shapes.map((shape, index) => renderShape(shape, index))}
          
          {/* 当前绘制预览 */}
          {renderPreview()}
        </svg>

        {/* 文字输入框 */}
        {textPosition && (
          <div
            className="absolute bg-white border border-indigo-300 rounded shadow-lg p-2"
            style={{ left: textPosition.x * zoom + 10, top: textPosition.y * zoom + 10 }}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="输入文字..."
              className="border border-slate-300 rounded px-2 py-1 text-sm w-40"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') addText();
                if (e.key === 'Escape') setTextPosition(null);
              }}
            />
            <div className="flex gap-1 mt-1">
              <button onClick={addText} className="px-2 py-0.5 bg-indigo-500 text-white text-xs rounded">确定</button>
              <button onClick={() => setTextPosition(null)} className="px-2 py-0.5 bg-slate-200 text-xs rounded">取消</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingBoard;

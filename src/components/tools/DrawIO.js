import React, { useRef, useState, useCallback } from 'react';
import { DrawIoEmbed } from 'react-drawio';
import { Save, Download, FolderOpen, X, Maximize2, Minimize2 } from 'lucide-react';

const DrawIO = ({ onClose }) => {
  const drawioRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedXml, setSavedXml] = useState('');

  // 导出图片
  const handleExport = useCallback((data) => {
    if (data.event === 'export') {
      // 下载导出的图片
      const link = document.createElement('a');
      link.download = `diagram_${Date.now()}.png`;
      link.href = data.data;
      link.click();
    }
  }, []);

  // 保存
  const handleSave = useCallback((data) => {
    if (data.event === 'save') {
      setSavedXml(data.xml);
      console.log('Diagram saved');
    }
  }, []);

  // 请求导出
  const exportDiagram = useCallback(() => {
    if (drawioRef.current) {
      drawioRef.current.exportDiagram({
        format: 'png'
      });
    }
  }, []);

  return (
    <div className={`bg-white rounded-xl overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[600px]'}`}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50">
        <h3 className="font-medium text-slate-700">Draw.io 绘图</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={exportDiagram}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Download size={16} />
            导出PNG
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-slate-200 rounded"
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Draw.io 编辑器 - 使用本地版本 */}
      <div className="flex-1">
        <DrawIoEmbed
          ref={drawioRef}
          baseUrl="/drawio-local/src/main/webapp"
          urlParameters={{
            ui: 'kennedy',
            spin: true,
            libraries: true,
            saveAndExit: false,
            noSaveBtn: false,
            noExitBtn: true
          }}
          onExport={handleExport}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default DrawIO;

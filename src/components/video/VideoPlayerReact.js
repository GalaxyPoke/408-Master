import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactPlayer from 'react-player';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, Camera, Film,
  Download, X, Loader2, Pencil, Square, Circle, 
  Type, Eraser, Undo, RotateCcw, FileText
} from 'lucide-react';

// 倍速选项
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

// 截图标注工具
const ANNOTATION_TOOLS = [
  { id: 'pen', icon: Pencil, label: '画笔' },
  { id: 'rect', icon: Square, label: '矩形' },
  { id: 'circle', icon: Circle, label: '圆形' },
  { id: 'text', icon: Type, label: '文字' },
  { id: 'eraser', icon: Eraser, label: '橡皮擦' },
];

const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF'];

const VideoPlayerReact = ({ 
  src, 
  title, 
  type = 'local',
  onTimeUpdate,
  className = ''
}) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const annotationCanvasRef = useRef(null);

  // 播放状态
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 截图标注状态
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [screenshotImage, setScreenshotImage] = useState(null);
  const [annotationTool, setAnnotationTool] = useState('pen');
  const [annotationColor, setAnnotationColor] = useState('#FF0000');
  const [annotationSize, setAnnotationSize] = useState(3);
  const [annotations, setAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);

  // GIF录制状态
  const [isRecordingGif, setIsRecordingGif] = useState(false);
  const [gifFrames, setGifFrames] = useState([]);
  const [gifProgress, setGifProgress] = useState(0);
  const [showGifModal, setShowGifModal] = useState(false);
  const gifIntervalRef = useRef(null);

  // 字幕状态
  const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState(false);

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 播放进度更新
  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
    }
    onTimeUpdate?.(state.playedSeconds);
  };

  // 跳转
  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    playerRef.current?.seekTo(parseFloat(e.target.value));
  };

  // 快进快退
  const skip = (seconds) => {
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    playerRef.current?.seekTo(currentTime + seconds);
  };

  // 全屏
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 生成字幕
  const generateSubtitles = useCallback(async () => {
    if (!src || type === 'bilibili') {
      alert('字幕生成仅支持本地视频');
      return;
    }

    setIsGeneratingSubtitles(true);
    try {
      const response = await fetch('http://localhost:3001/api/audio/transcribe-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: src })
      });

      const data = await response.json();
      if (data.success && data.text) {
        alert(`字幕生成成功！\n\n${data.text.slice(0, 200)}...`);
      } else {
        throw new Error(data.error || '字幕生成失败');
      }
    } catch (error) {
      console.error('Subtitle generation error:', error);
      alert('字幕生成失败: ' + error.message);
    } finally {
      setIsGeneratingSubtitles(false);
    }
  }, [src, type]);

  // 截图功能
  const takeScreenshot = useCallback(() => {
    const video = playerRef.current?.getInternalPlayer();
    if (!video || video.tagName !== 'VIDEO') {
      alert('截图功能仅支持本地视频');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/png');
    setScreenshotImage(imageData);
    setAnnotations([]);
    setShowScreenshotModal(true);
  }, []);

  // 标注绘制
  const startDrawing = useCallback((e) => {
    if (!annotationCanvasRef.current) return;
    const rect = annotationCanvasRef.current.getBoundingClientRect();
    setIsDrawing(true);
    setCurrentPath([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  }, []);

  const draw = useCallback((e) => {
    if (!isDrawing || !annotationCanvasRef.current) return;
    const rect = annotationCanvasRef.current.getBoundingClientRect();
    setCurrentPath(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    if (currentPath.length > 1) {
      setAnnotations(prev => [...prev, {
        tool: annotationTool,
        color: annotationColor,
        size: annotationSize,
        points: currentPath
      }]);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, annotationTool, annotationColor, annotationSize]);

  // 渲染标注
  useEffect(() => {
    if (!annotationCanvasRef.current || !showScreenshotModal) return;
    
    const canvas = annotationCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    [...annotations, { tool: annotationTool, color: annotationColor, size: annotationSize, points: currentPath }]
      .filter(ann => ann.points.length > 1)
      .forEach(ann => {
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ann.points.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      });
  }, [annotations, currentPath, annotationColor, annotationSize, annotationTool, showScreenshotModal]);

  // 保存标注截图
  const saveAnnotatedScreenshot = useCallback(() => {
    if (!screenshotImage) return;
    
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const scaleX = img.width / (annotationCanvasRef.current?.width || 800);
      const scaleY = img.height / (annotationCanvasRef.current?.height || 450);
      
      annotations.forEach(ann => {
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.size * scaleX;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ann.points.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x * scaleX, point.y * scaleY);
          else ctx.lineTo(point.x * scaleX, point.y * scaleY);
        });
        ctx.stroke();
      });
      
      const link = document.createElement('a');
      link.download = `截图_${title || 'video'}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setShowScreenshotModal(false);
    };
    img.src = screenshotImage;
  }, [screenshotImage, annotations, title]);

  // GIF录制
  const startGifRecording = useCallback(() => {
    const video = playerRef.current?.getInternalPlayer();
    if (!video || video.tagName !== 'VIDEO') {
      alert('GIF录制仅支持本地视频');
      return;
    }
    
    setIsRecordingGif(true);
    setGifFrames([]);
    setGifProgress(0);
    
    const maxFrames = 50;
    let frameCount = 0;
    
    gifIntervalRef.current = setInterval(() => {
      if (frameCount >= maxFrames) {
        stopGifRecording();
        return;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 270;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      setGifFrames(prev => [...prev, canvas.toDataURL('image/png')]);
      frameCount++;
      setGifProgress((frameCount / maxFrames) * 100);
    }, 100);
  }, []);

  const stopGifRecording = useCallback(() => {
    if (gifIntervalRef.current) {
      clearInterval(gifIntervalRef.current);
      gifIntervalRef.current = null;
    }
    setIsRecordingGif(false);
    setShowGifModal(true);
  }, []);

  const downloadGif = useCallback(() => {
    if (gifFrames.length === 0) return;
    const link = document.createElement('a');
    link.download = `录制_${title || 'video'}_${Date.now()}.png`;
    link.href = gifFrames[Math.floor(gifFrames.length / 2)];
    link.click();
    setShowGifModal(false);
    setGifFrames([]);
  }, [gifFrames, title]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case ' ': e.preventDefault(); setPlaying(p => !p); break;
        case 'ArrowLeft': skip(-5); break;
        case 'ArrowRight': skip(5); break;
        case 'ArrowUp': e.preventDefault(); setVolume(v => Math.min(1, v + 0.1)); break;
        case 'ArrowDown': e.preventDefault(); setVolume(v => Math.max(0, v - 0.1)); break;
        case 'f': toggleFullscreen(); break;
        case 'm': setMuted(m => !m); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-2xl overflow-hidden group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* 视频播放器 */}
      <div className="aspect-video">
        {!src ? (
          <div className="flex items-center justify-center h-full text-white">
            视频URL为空
          </div>
        ) : (
          <video
            ref={playerRef}
            src={src.startsWith('/') ? `http://localhost:3001${src}` : src}
            className="w-full h-full"
            controls
            onTimeUpdate={(e) => {
              const video = e.target;
              setPlayed(video.currentTime / video.duration);
              onTimeUpdate?.(video.currentTime);
            }}
            onLoadedMetadata={(e) => setDuration(e.target.duration)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        )}
      </div>

      {/* GIF录制指示器 */}
      {isRecordingGif && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full animate-pulse z-20">
          <div className="w-3 h-3 bg-white rounded-full" />
          录制中 {Math.round(gifProgress)}%
        </div>
      )}

      {/* 自定义控制栏 */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* 进度条 */}
        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={0.999999}
            step="any"
            value={played}
            onMouseDown={handleSeekMouseDown}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${played * 100}%, rgba(255,255,255,0.3) ${played * 100}%)`
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* 左侧控制 */}
          <div className="flex items-center gap-3">
            <button onClick={() => setPlaying(!playing)} className="text-white hover:text-blue-400 transition-colors">
              {playing ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button onClick={() => skip(-10)} className="text-white hover:text-blue-400 transition-colors">
              <SkipBack size={20} />
            </button>
            
            <button onClick={() => skip(10)} className="text-white hover:text-blue-400 transition-colors">
              <SkipForward size={20} />
            </button>

            <div className="flex items-center gap-2">
              <button onClick={() => setMuted(!muted)} className="text-white hover:text-blue-400 transition-colors">
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={muted ? 0 : volume}
                onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                className="w-20 accent-blue-500"
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(played * duration)} / {formatTime(duration)}
            </span>
          </div>

          {/* 右侧控制 */}
          <div className="flex items-center gap-3">
            {/* 倍速控制 */}
            <div className="relative">
              <button 
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-white hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                <Settings size={18} />
                <span className="text-sm">{playbackRate}x</span>
              </button>
              
              {showSpeedMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSpeedMenu(false)} />
                  <div className="absolute bottom-full right-0 mb-2 bg-slate-800 rounded-lg shadow-xl py-2 z-20 min-w-[100px]">
                    <div className="px-3 py-1 text-xs text-slate-400 border-b border-slate-700 mb-1">播放速度</div>
                    {PLAYBACK_RATES.map(rate => (
                      <button
                        key={rate}
                        onClick={() => { setPlaybackRate(rate); setShowSpeedMenu(false); }}
                        className={`w-full px-3 py-1.5 text-left text-sm hover:bg-slate-700 transition-colors ${
                          playbackRate === rate ? 'text-blue-400' : 'text-white'
                        }`}
                      >
                        {rate}x {playbackRate === rate && '✓'}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 生成字幕 */}
            <button 
              onClick={generateSubtitles}
              disabled={isGeneratingSubtitles}
              className="text-white hover:text-blue-400 transition-colors disabled:text-slate-500"
              title="生成字幕"
            >
              {isGeneratingSubtitles ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
            </button>

            {/* 截图 */}
            <button onClick={takeScreenshot} className="text-white hover:text-blue-400 transition-colors" title="截图标注">
              <Camera size={20} />
            </button>

            {/* GIF录制 */}
            <button 
              onClick={isRecordingGif ? stopGifRecording : startGifRecording}
              className={`transition-colors ${isRecordingGif ? 'text-red-500' : 'text-white hover:text-blue-400'}`}
              title={isRecordingGif ? '停止录制' : '录制GIF'}
            >
              <Film size={20} />
            </button>

            {/* 全屏 */}
            <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors">
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* 底部功能提示 */}
      <div className="absolute bottom-0 left-0 right-0 translate-y-full pt-3">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            ReactPlayer 开源播放器
          </span>
          <span>快捷键: 空格(播放) ←→(快进) ↑↓(音量) F(全屏) M(静音)</span>
        </div>
      </div>

      {/* 截图标注弹窗 */}
      {showScreenshotModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
              <h3 className="font-medium">📷 截图标注</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setAnnotations([])} className="p-2 hover:bg-slate-200 rounded-lg" title="清除">
                  <RotateCcw size={18} />
                </button>
                <button onClick={() => setAnnotations(prev => prev.slice(0, -1))} className="p-2 hover:bg-slate-200 rounded-lg" title="撤销">
                  <Undo size={18} />
                </button>
                <button onClick={() => setShowScreenshotModal(false)} className="p-2 hover:bg-slate-200 rounded-lg">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-2 border-b bg-slate-50">
              <div className="flex items-center gap-1">
                {ANNOTATION_TOOLS.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setAnnotationTool(tool.id)}
                      className={`p-2 rounded-lg transition-colors ${annotationTool === tool.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-200'}`}
                      title={tool.label}
                    >
                      <Icon size={18} />
                    </button>
                  );
                })}
              </div>
              <div className="w-px h-6 bg-slate-300" />
              <div className="flex items-center gap-1">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setAnnotationColor(color)}
                    className={`w-6 h-6 rounded-full border-2 ${annotationColor === color ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="w-px h-6 bg-slate-300" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">粗细:</span>
                <input type="range" min="1" max="10" value={annotationSize} onChange={(e) => setAnnotationSize(Number(e.target.value))} className="w-20" />
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-slate-100">
              <div className="relative inline-block">
                <img src={screenshotImage} alt="Screenshot" className="max-w-full" draggable={false} />
                <canvas
                  ref={annotationCanvasRef}
                  width={800}
                  height={450}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-slate-50">
              <button onClick={() => setShowScreenshotModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">取消</button>
              <button onClick={saveAnnotatedScreenshot} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                <Download size={18} />保存截图
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GIF预览弹窗 */}
      {showGifModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="font-medium mb-4">🎬 GIF录制完成</h3>
            {gifFrames.length > 0 ? (
              <div className="mb-4">
                <img src={gifFrames[Math.floor(gifFrames.length / 2)]} alt="GIF Preview" className="w-full rounded-lg" />
                <p className="text-sm text-slate-500 mt-2">已捕获 {gifFrames.length} 帧</p>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowGifModal(false); setGifFrames([]); }} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">取消</button>
              <button onClick={downloadGif} disabled={gifFrames.length === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-300">
                <Download size={18} />下载
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayerReact;

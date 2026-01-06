import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, Camera, Film,
  MessageSquare, Download, X, Loader2, Pencil,
  Square, Circle, Type, Eraser, Undo, RotateCcw,
  FileText, Mic, Copy, CheckCircle
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

const VideoPlayerPro = ({ 
  src, 
  title, 
  type = 'local',
  onTimeUpdate,
  onSubtitleGenerated,
  className = ''
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // 播放状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // 字幕状态
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);

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
  const [generatedGif, setGeneratedGif] = useState(null);
  const gifIntervalRef = useRef(null);

  // 音频转文字状态
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [transcriptProgress, setTranscriptProgress] = useState(0);
  const [transcriptError, setTranscriptError] = useState('');

  // 播放控制
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      onTimeUpdate?.(videoRef.current.currentTime);

      // 更新当前字幕
      const current = subtitles.find(
        sub => videoRef.current.currentTime >= sub.start && videoRef.current.currentTime <= sub.end
      );
      setCurrentSubtitle(current?.text || '');
    }
  }, [subtitles, onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [duration]);

  const handleVolumeChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
    setIsMuted(value === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const changePlaybackRate = useCallback((rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
    setShowSpeedMenu(false);
  }, []);

  const skip = useCallback((seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  }, [duration]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 格式化时间
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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
        // 简单分割字幕（每30字一段）
        const text = data.text;
        const segmentLength = 30;
        const segments = [];
        const totalDuration = duration || 60;
        
        for (let i = 0; i < text.length; i += segmentLength) {
          const segment = text.slice(i, i + segmentLength);
          const startTime = (i / text.length) * totalDuration;
          const endTime = ((i + segmentLength) / text.length) * totalDuration;
          segments.push({
            start: startTime,
            end: Math.min(endTime, totalDuration),
            text: segment
          });
        }
        
        setSubtitles(segments);
        onSubtitleGenerated?.(segments);
        alert('字幕生成成功！');
      } else {
        throw new Error(data.error || '字幕生成失败');
      }
    } catch (error) {
      console.error('Subtitle generation error:', error);
      alert('字幕生成失败: ' + error.message);
    } finally {
      setIsGeneratingSubtitles(false);
    }
  }, [src, type, duration, onSubtitleGenerated]);

  // 截图功能
  const takeScreenshot = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    const imageData = canvas.toDataURL('image/png');
    setScreenshotImage(imageData);
    setAnnotations([]);
    setShowScreenshotModal(true);
  }, []);

  // 标注绘制 (SVG)
  const startDrawing = useCallback((e) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  }, []);

  const draw = useCallback((e) => {
    if (!isDrawing || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPath(prev => [...prev, { x, y }]);
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

  // 生成 SVG path 数据
  const pointsToPath = (points) => {
    if (points.length < 2) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  // 渲染 SVG 标注元素
  const renderAnnotation = (ann, index) => {
    const { tool, color, size, points } = ann;
    
    if (tool === 'pen' || tool === 'eraser') {
      return (
        <path
          key={index}
          d={pointsToPath(points)}
          stroke={tool === 'eraser' ? '#FFFFFF' : color}
          strokeWidth={size}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    } else if (tool === 'rect' && points.length >= 2) {
      const start = points[0];
      const end = points[points.length - 1];
      return (
        <rect
          key={index}
          x={Math.min(start.x, end.x)}
          y={Math.min(start.y, end.y)}
          width={Math.abs(end.x - start.x)}
          height={Math.abs(end.y - start.y)}
          stroke={color}
          strokeWidth={size}
          fill="none"
        />
      );
    } else if (tool === 'circle' && points.length >= 2) {
      const start = points[0];
      const end = points[points.length - 1];
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      return (
        <ellipse
          key={index}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          stroke={color}
          strokeWidth={size}
          fill="none"
        />
      );
    }
    return null;
  };

  // 保存标注截图 (SVG转Canvas导出)
  const saveAnnotatedScreenshot = useCallback(() => {
    if (!screenshotImage || !svgRef.current) return;
    
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      const svgRect = svgRef.current.getBoundingClientRect();
      const scaleX = img.width / svgRect.width;
      const scaleY = img.height / svgRect.height;
      
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // 绘制原图
      ctx.drawImage(img, 0, 0);
      
      // 绘制标注
      annotations.forEach(ann => {
        ctx.strokeStyle = ann.tool === 'eraser' ? '#FFFFFF' : ann.color;
        ctx.lineWidth = ann.size * scaleX;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (ann.tool === 'pen' || ann.tool === 'eraser') {
          ctx.beginPath();
          ann.points.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x * scaleX, point.y * scaleY);
            else ctx.lineTo(point.x * scaleX, point.y * scaleY);
          });
          ctx.stroke();
        } else if (ann.tool === 'rect' && ann.points.length >= 2) {
          const start = ann.points[0];
          const end = ann.points[ann.points.length - 1];
          ctx.strokeRect(
            Math.min(start.x, end.x) * scaleX,
            Math.min(start.y, end.y) * scaleY,
            Math.abs(end.x - start.x) * scaleX,
            Math.abs(end.y - start.y) * scaleY
          );
        } else if (ann.tool === 'circle' && ann.points.length >= 2) {
          const start = ann.points[0];
          const end = ann.points[ann.points.length - 1];
          const cx = ((start.x + end.x) / 2) * scaleX;
          const cy = ((start.y + end.y) / 2) * scaleY;
          const rx = (Math.abs(end.x - start.x) / 2) * scaleX;
          const ry = (Math.abs(end.y - start.y) / 2) * scaleY;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      
      // 下载
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
    if (!videoRef.current) return;
    
    setIsRecordingGif(true);
    setGifFrames([]);
    setGifProgress(0);
    
    // 每100ms捕获一帧，最多录制5秒
    const maxFrames = 50;
    let frameCount = 0;
    
    gifIntervalRef.current = setInterval(() => {
      if (frameCount >= maxFrames || !videoRef.current) {
        stopGifRecording();
        return;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = 480; // GIF宽度
      canvas.height = 270; // GIF高度
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
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
    
    if (gifFrames.length > 0) {
      generateGif();
    }
  }, [gifFrames]);

  const generateGif = useCallback(async () => {
    if (gifFrames.length === 0) return;
    
    setShowGifModal(true);
    setGifProgress(0);
    
    try {
      // 使用简单的方式生成GIF - 创建一个动画预览
      // 实际项目中可以使用gif.js库
      const gifDataUrl = gifFrames[0]; // 暂时使用第一帧作为预览
      setGeneratedGif(gifDataUrl);
      setGifProgress(100);
      
      // 提示用户
      alert(`已捕获 ${gifFrames.length} 帧，GIF预览已生成。\n实际GIF生成需要gif.js库的Worker支持。`);
    } catch (error) {
      console.error('GIF generation error:', error);
      alert('GIF生成失败');
    }
  }, [gifFrames]);

  const downloadGif = useCallback(() => {
    if (!generatedGif) return;
    
    const link = document.createElement('a');
    link.download = `录制_${title || 'video'}_${Date.now()}.png`; // 暂时保存为PNG
    link.href = generatedGif;
    link.click();
    
    setShowGifModal(false);
    setGeneratedGif(null);
    setGifFrames([]);
  }, [generatedGif, title]);

  // 音频转文字
  const startTranscription = useCallback(async () => {
    if (!src) return;
    
    setShowTranscriptModal(true);
    setIsTranscribing(true);
    setTranscriptText('');
    setTranscriptProgress(0);
    setTranscriptError('');
    
    try {
      // 尝试调用后端 API
      const progressInterval = setInterval(() => {
        setTranscriptProgress(p => Math.min(p + 5, 90));
      }, 500);
      
      const response = await fetch('http://localhost:3001/api/transcribe-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: src, title })
      });
      
      clearInterval(progressInterval);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Transcription response:', data);
        setTranscriptText(data.text || '转写完成，但未识别到文字');
        setTranscriptProgress(100);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Transcription error:', errorData);
        setTranscriptError(errorData.error || '转写失败，请稍后重试');
        setTranscriptProgress(0);
      }
    } catch (err) {
      setTranscriptError('视频转写服务暂不可用。\n\n提示：您可以：\n1. 下载视频后使用专业转写工具\n2. 使用学习工具中的音频转文字功能录制');
      setTranscriptProgress(0);
    } finally {
      setIsTranscribing(false);
    }
  }, [src, title]);

  // 复制转写文字
  const copyTranscript = useCallback(() => {
    if (transcriptText) {
      navigator.clipboard.writeText(transcriptText);
    }
  }, [transcriptText]);

  // 下载转写文字
  const downloadTranscript = useCallback(() => {
    if (!transcriptText) return;
    
    const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `转写_${title || 'video'}_${Date.now()}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [transcriptText, title]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          skip(-5);
          break;
        case 'ArrowRight':
          skip(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(v => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(v => Math.max(0, v - 0.1));
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skip, toggleFullscreen, toggleMute]);

  // B站视频使用iframe
  if (type === 'bilibili') {
    const bvMatch = src?.match(/BV[\w]+/);
    return (
      <div className={`relative bg-black rounded-2xl overflow-hidden ${className}`}>
        <div className="aspect-video">
          {bvMatch ? (
            <iframe
              src={`//player.bilibili.com/player.html?bvid=${bvMatch[0]}&high_quality=1&danmaku=0`}
              className="w-full h-full"
              allowFullScreen
              title={title}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              无法解析B站链接
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-2xl overflow-hidden group ${className}`}
    >
      {/* 视频元素 */}
      <video
        ref={videoRef}
        src={src}
        crossOrigin="anonymous"
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* 字幕显示 */}
      {showSubtitles && currentSubtitle && (
        <div className="absolute bottom-20 left-0 right-0 text-center px-4">
          <span className="bg-black/70 text-white px-4 py-2 rounded-lg text-lg">
            {currentSubtitle}
          </span>
        </div>
      )}

      {/* GIF录制指示器 */}
      {isRecordingGif && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full animate-pulse">
          <div className="w-3 h-3 bg-white rounded-full" />
          录制中 {Math.round(gifProgress)}%
        </div>
      )}

      {/* 控制栏 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* 进度条 */}
        <div 
          className="h-1 bg-white/30 rounded-full mb-4 cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-blue-500 rounded-full relative"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* 左侧控制 */}
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button onClick={() => skip(-10)} className="text-white hover:text-blue-400 transition-colors">
              <SkipBack size={20} />
            </button>
            
            <button onClick={() => skip(10)} className="text-white hover:text-blue-400 transition-colors">
              <SkipForward size={20} />
            </button>

            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-blue-500"
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
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
                        onClick={() => changePlaybackRate(rate)}
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

            {/* 字幕按钮 */}
            <button 
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`transition-colors ${showSubtitles ? 'text-blue-400' : 'text-white hover:text-blue-400'}`}
              title="字幕"
            >
              <MessageSquare size={20} />
            </button>

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
            <button 
              onClick={takeScreenshot}
              className="text-white hover:text-blue-400 transition-colors"
              title="截图标注"
            >
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

            {/* 音频转文字 */}
            <button 
              onClick={startTranscription}
              className="text-white hover:text-blue-400 transition-colors"
              title="视频转文字"
            >
              <Mic size={20} />
            </button>

            {/* 全屏 */}
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* 截图标注弹窗 */}
      {showScreenshotModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
              <h3 className="font-medium flex items-center gap-2"><Camera size={18} /> 截图标注</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAnnotations([])}
                  className="p-2 hover:bg-slate-200 rounded-lg"
                  title="清除标注"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={() => setAnnotations(prev => prev.slice(0, -1))}
                  className="p-2 hover:bg-slate-200 rounded-lg"
                  title="撤销"
                >
                  <Undo size={18} />
                </button>
                <button
                  onClick={() => setShowScreenshotModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 工具栏 */}
            <div className="flex items-center gap-4 px-4 py-2 border-b bg-slate-50">
              <div className="flex items-center gap-1">
                {ANNOTATION_TOOLS.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setAnnotationTool(tool.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        annotationTool === tool.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-200'
                      }`}
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
                    className={`w-6 h-6 rounded-full border-2 ${
                      annotationColor === color ? 'border-blue-500 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="w-px h-6 bg-slate-300" />

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">粗细:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={annotationSize}
                  onChange={(e) => setAnnotationSize(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>

            {/* 画布区域 (SVG) */}
            <div className="flex-1 overflow-auto p-4 bg-slate-100">
              <div className="relative inline-block">
                <img 
                  src={screenshotImage} 
                  alt="Screenshot" 
                  className="max-w-full"
                  draggable={false}
                />
                <svg
                  ref={svgRef}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                >
                  {/* 已保存的标注 */}
                  {annotations.map((ann, index) => renderAnnotation(ann, index))}
                  {/* 当前正在绘制的标注 */}
                  {currentPath.length > 1 && renderAnnotation({
                    tool: annotationTool,
                    color: annotationColor,
                    size: annotationSize,
                    points: currentPath
                  }, 'current')}
                </svg>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-slate-50">
              <button
                onClick={() => setShowScreenshotModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={saveAnnotatedScreenshot}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Download size={18} />
                保存截图
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GIF预览弹窗 */}
      {showGifModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="font-medium mb-4">GIF录制完成</h3>
            
            {generatedGif ? (
              <div className="mb-4">
                <img src={generatedGif} alt="GIF Preview" className="w-full rounded-lg" />
                <p className="text-sm text-slate-500 mt-2">已捕获 {gifFrames.length} 帧</p>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <span className="ml-2">生成中 {Math.round(gifProgress)}%</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowGifModal(false);
                  setGeneratedGif(null);
                  setGifFrames([]);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={downloadGif}
                disabled={!generatedGif}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-300"
              >
                <Download size={18} />
                下载
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 音频转文字弹窗 */}
      {showTranscriptModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-medium flex items-center gap-2">
                <Mic className="h-5 w-5 text-green-500" />
                视频转文字 - {title || '当前视频'}
              </h3>
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {isTranscribing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin text-green-500 mb-4" size={40} />
                  <p className="text-slate-600 mb-2">正在转写视频...</p>
                  <div className="w-64 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${transcriptProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{transcriptProgress}%</p>
                </div>
              ) : transcriptError ? (
                <div className="py-8">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 whitespace-pre-line">{transcriptError}</p>
                  </div>
                </div>
              ) : transcriptText ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                      <CheckCircle size={16} className="text-green-500" />
                      转写完成
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={copyTranscript}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                        title="复制"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={downloadTranscript}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                        title="下载"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    className="w-full h-64 p-3 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Mic size={48} className="mb-4 text-slate-300" />
                  <p>点击下方按钮开始转写</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-slate-50">
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                关闭
              </button>
              {!isTranscribing && !transcriptText && (
                <button
                  onClick={startTranscription}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <Mic size={18} />
                  开始转写
                </button>
              )}
              {transcriptText && (
                <button
                  onClick={downloadTranscript}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <Download size={18} />
                  下载文字
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayerPro;

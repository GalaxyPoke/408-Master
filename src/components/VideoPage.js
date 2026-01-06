import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Plus, Trash2, ExternalLink, ChevronRight, ChevronDown, X, PlayCircle, Loader2, FileText, Mic, Edit3, Save, Clock, PenTool, BookOpen, ClipboardList, Link } from 'lucide-react';
import { api } from '../services/api';
import HandwritingNote from './HandwritingNote';
import NotebookEditor from './NotebookEditor';
import ExercisePanel from './ExercisePanel';
import ChapterQuiz from './ChapterQuiz';
import ReactPlayer from 'react-player';
import { VideoPlayerPro } from './video';
import STTTool from './tools/STTTool';

const defaultVideoData = {
  ds: {
    name: '数据结构',
    icon: 'DS',
    gradient: 'from-blue-500 to-blue-600',
    chapters: [
      { id: 'ds-ch1', name: '绪论', videos: [] },
      { id: 'ds-ch2', name: '线性表', videos: [] },
      { id: 'ds-ch3', name: '栈', videos: [] },
      { id: 'ds-ch4', name: '队列', videos: [] },
      { id: 'ds-ch5', name: '串', videos: [] },
      { id: 'ds-ch6', name: '树', videos: [] },
      { id: 'ds-ch7', name: '二叉树', videos: [] },
      { id: 'ds-ch8', name: '图', videos: [] },
      { id: 'ds-ch9', name: '查找', videos: [] },
      { id: 'ds-ch10', name: '排序', videos: [] },
    ]
  },
  co: {
    name: '计算机组成',
    icon: 'CO',
    gradient: 'from-purple-500 to-purple-600',
    chapters: [
      { id: 'co-ch1', name: '计算机系统概述', videos: [] },
      { id: 'co-ch2', name: '数据的表示', videos: [] },
      { id: 'co-ch3', name: '数据的运算', videos: [] },
      { id: 'co-ch4', name: '存储器概述', videos: [] },
      { id: 'co-ch5', name: 'Cache', videos: [] },
      { id: 'co-ch6', name: '虚拟存储器', videos: [] },
      { id: 'co-ch7', name: '指令系统', videos: [] },
      { id: 'co-ch8', name: 'CPU结构', videos: [] },
      { id: 'co-ch9', name: '指令流水线', videos: [] },
      { id: 'co-ch10', name: '总线', videos: [] },
      { id: 'co-ch11', name: '输入输出系统', videos: [] },
    ]
  },
  os: {
    name: '操作系统',
    icon: 'OS',
    gradient: 'from-emerald-500 to-emerald-600',
    chapters: [
      { id: 'os-ch1', name: '操作系统概述', videos: [] },
      { id: 'os-ch2', name: '进程', videos: [] },
      { id: 'os-ch3', name: '线程', videos: [] },
      { id: 'os-ch4', name: '处理机调度', videos: [] },
      { id: 'os-ch5', name: '进程同步', videos: [] },
      { id: 'os-ch6', name: '死锁', videos: [] },
      { id: 'os-ch7', name: '内存管理', videos: [] },
      { id: 'os-ch8', name: '虚拟内存', videos: [] },
      { id: 'os-ch9', name: '文件系统', videos: [] },
      { id: 'os-ch10', name: '磁盘管理', videos: [] },
      { id: 'os-ch11', name: 'I/O管理', videos: [] },
    ]
  },
  cn: {
    name: '计算机网络',
    icon: 'CN',
    gradient: 'from-orange-500 to-orange-600',
    chapters: [
      { id: 'cn-ch1', name: '网络体系结构', videos: [] },
      { id: 'cn-ch2', name: '物理层', videos: [] },
      { id: 'cn-ch3', name: '数据链路层', videos: [] },
      { id: 'cn-ch4', name: '网络层', videos: [] },
      { id: 'cn-ch5', name: 'IP协议', videos: [] },
      { id: 'cn-ch6', name: '路由算法', videos: [] },
      { id: 'cn-ch7', name: '传输层', videos: [] },
      { id: 'cn-ch8', name: 'TCP协议', videos: [] },
      { id: 'cn-ch9', name: 'UDP协议', videos: [] },
      { id: 'cn-ch10', name: '应用层', videos: [] },
      { id: 'cn-ch11', name: 'HTTP协议', videos: [] },
      { id: 'cn-ch12', name: 'DNS', videos: [] },
    ]
  }
};

const loadVideoData = () => {
  try {
    const saved = localStorage.getItem('408-video-data-v2');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Load error:', e);
  }
  return defaultVideoData;
};

const saveVideoData = (data) => {
  try {
    localStorage.setItem('408-video-data-v2', JSON.stringify(data));
  } catch (e) {
    console.error('Save error:', e);
  }
};

const videoTypes = [
  { value: 'bilibili', label: 'B站', placeholder: 'https://www.bilibili.com/video/BV...' },
  { value: 'link', label: '链接', placeholder: 'https://example.com/video.mp4' },
  { value: 'local', label: '本地', placeholder: 'C:/Videos/xxx.mp4' },
  { value: 'netdisk', label: '网盘', placeholder: '百度网盘/夸克网盘分享链接' },
];

const VideoPage = () => {
  const [videoData, setVideoData] = useState(defaultVideoData);
  const [activeSubject, setActiveSubject] = useState('ds');
  const [activeChapter, setActiveChapter] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [newChapterName, setNewChapterName] = useState('');
  const [newVideo, setNewVideo] = useState({ title: '', type: 'bilibili', url: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [useBackend, setUseBackend] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [isRealTimeTranscribing, setIsRealTimeTranscribing] = useState(false);
  const [realTimeText, setRealTimeText] = useState('');
  const videoRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const recognitionRef = React.useRef(null);
  
  // 笔记相关状态
  const [notes, setNotes] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [showHandwriting, setShowHandwriting] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [showExercises, setShowExercises] = useState(false);
  const [showChapterQuiz, setShowChapterQuiz] = useState(false);
  const [quizChapter, setQuizChapter] = useState(null);
  
  // 飞书文档状态
  const [showFeishuDoc, setShowFeishuDoc] = useState(false);
  const [showSTT, setShowSTT] = useState(false);
  const [feishuDocUrl, setFeishuDocUrl] = useState(() => {
    return localStorage.getItem('408_current_feishu_doc') || '';
  });
  const [showFeishuUrlInput, setShowFeishuUrlInput] = useState(false);
  const [tempFeishuUrl, setTempFeishuUrl] = useState('');
  const videoPlayerRef = useRef(null);

  // 从后台加载数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getData();
        setVideoData(data);
        setUseBackend(true);
      } catch (e) {
        console.log('Backend not available, using localStorage');
        setVideoData(loadVideoData());
        setUseBackend(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 打开飞书文档（暂停视频）
  const openFeishuDoc = useCallback(() => {
    if (!feishuDocUrl) {
      setShowFeishuUrlInput(true);
      return;
    }
    // 暂停视频
    if (videoPlayerRef.current) {
      const video = videoPlayerRef.current.querySelector('video');
      if (video && !video.paused) {
        video.pause();
      }
    }
    setShowFeishuDoc(true);
  }, [feishuDocUrl]);

  // 保存飞书文档链接
  const saveFeishuUrl = useCallback(() => {
    if (tempFeishuUrl.trim()) {
      setFeishuDocUrl(tempFeishuUrl.trim());
      localStorage.setItem('408_current_feishu_doc', tempFeishuUrl.trim());
      setShowFeishuUrlInput(false);
      setTempFeishuUrl('');
      // 打开文档
      if (videoPlayerRef.current) {
        const video = videoPlayerRef.current.querySelector('video');
        if (video && !video.paused) {
          video.pause();
        }
      }
      setShowFeishuDoc(true);
    }
  }, [tempFeishuUrl]);

  // 快捷键监听 (Ctrl+Shift+F 打开飞书文档)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+F 打开飞书文档
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        openFeishuDoc();
      }
      // ESC 关闭飞书文档
      if (e.key === 'Escape' && showFeishuDoc) {
        setShowFeishuDoc(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openFeishuDoc, showFeishuDoc]);

  const currentSubject = videoData[activeSubject];
  const currentChapter = activeChapter ? currentSubject?.chapters?.find(c => c.id === activeChapter) : null;

  const handleAddChapter = async () => {
    if (!newChapterName.trim()) return;
    const chapterId = activeSubject + '-ch-' + Date.now();
    const newChapter = { id: chapterId, name: newChapterName.trim(), videos: [] };
    
    if (useBackend) {
      await api.addChapter(chapterId, activeSubject, newChapterName.trim());
    }
    
    const updatedData = {
      ...videoData,
      [activeSubject]: {
        ...videoData[activeSubject],
        chapters: [...(videoData[activeSubject].chapters || []), newChapter]
      }
    };
    setVideoData(updatedData);
    if (!useBackend) saveVideoData(updatedData);
    setNewChapterName('');
    setShowAddChapterModal(false);
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('确定删除此章节?')) return;
    
    if (useBackend) {
      await api.deleteChapter(chapterId);
    }
    
    const updatedData = {
      ...videoData,
      [activeSubject]: {
        ...videoData[activeSubject],
        chapters: videoData[activeSubject].chapters.filter(c => c.id !== chapterId)
      }
    };
    setVideoData(updatedData);
    if (!useBackend) saveVideoData(updatedData);
    if (activeChapter === chapterId) setActiveChapter(null);
  };

  const handleAddVideo = async () => {
    if (!newVideo.title || !newVideo.url || !activeChapter) return;
    
    let videoId = Date.now();
    if (useBackend) {
      const result = await api.addVideo(activeChapter, newVideo.title, newVideo.type, newVideo.url, newVideo.description);
      videoId = result.id;
    }
    
    const video = { id: videoId, ...newVideo };
    const updatedData = {
      ...videoData,
      [activeSubject]: {
        ...videoData[activeSubject],
        chapters: videoData[activeSubject].chapters.map(ch =>
          ch.id === activeChapter ? { ...ch, videos: [...ch.videos, video] } : ch
        )
      }
    };
    setVideoData(updatedData);
    if (!useBackend) saveVideoData(updatedData);
    setNewVideo({ title: '', type: 'bilibili', url: '', description: '' });
    setShowAddModal(false);
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('确定删除此视频?')) return;
    
    if (useBackend) {
      await api.deleteVideo(videoId);
    }
    
    const updatedData = {
      ...videoData,
      [activeSubject]: {
        ...videoData[activeSubject],
        chapters: videoData[activeSubject].chapters.map(ch =>
          ch.id === activeChapter ? { ...ch, videos: ch.videos.filter(v => v.id !== videoId) } : ch
        )
      }
    };
    setVideoData(updatedData);
    if (!useBackend) saveVideoData(updatedData);
    if (playingVideo?.id === videoId) setPlayingVideo(null);
  };

  const handlePlayVideo = (video) => {
    if (video.type === 'netdisk') {
      window.open(video.url, '_blank');
    } else {
      setPlayingVideo(video);
      setShowTranscript(false);
      setTranscriptText('');
    }
  };

  // 视频转文字
  const handleTranscribe = async () => {
    if (!playingVideo || !playingVideo.url) return;
    
    setTranscribing(true);
    setTranscriptText('');
    
    try {
      // 使用新的API，直接传视频URL让后端处理
      const result = await fetch('http://localhost:3001/api/audio/transcribe-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: playingVideo.url })
      });
      
      const data = await result.json();
      
      if (data.success) {
        setTranscriptText(data.text);
        setShowTranscript(true);
      } else {
        alert('转写失败: ' + (data.error || data.details || '未知错误'));
      }
    } catch (error) {
      console.error('Transcribe error:', error);
      alert('转写失败: ' + error.message);
    } finally {
      setTranscribing(false);
    }
  };

  // 加载笔记
  const loadNotes = async (videoId) => {
    if (!useBackend) return;
    try {
      const res = await fetch(`http://localhost:3001/api/notes?video_id=${videoId}`);
      const data = await res.json();
      setNotes(data);
    } catch (e) {
      console.error('Load notes error:', e);
    }
  };

  // 添加笔记
  const handleAddNote = async () => {
    if (!noteContent.trim() || !playingVideo) return;
    
    try {
      const res = await fetch('http://localhost:3001/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: playingVideo.id,
          chapter_id: activeChapter,
          subject_id: activeSubject,
          content: noteContent,
          timestamp: 0 // 可以后续添加视频时间戳
        })
      });
      const data = await res.json();
      if (data.id) {
        setNotes([{ id: data.id, content: noteContent, created_at: new Date().toISOString() }, ...notes]);
        setNoteContent('');
      }
    } catch (e) {
      console.error('Add note error:', e);
    }
  };

  // 更新笔记
  const handleUpdateNote = async (id) => {
    if (!editingContent.trim()) return;
    
    try {
      await fetch(`http://localhost:3001/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingContent })
      });
      setNotes(notes.map(n => n.id === id ? { ...n, content: editingContent } : n));
      setEditingNoteId(null);
      setEditingContent('');
    } catch (e) {
      console.error('Update note error:', e);
    }
  };

  // 删除笔记
  const handleDeleteNote = async (id) => {
    if (!window.confirm('确定删除这条笔记?')) return;
    
    try {
      await fetch(`http://localhost:3001/api/notes/${id}`, { method: 'DELETE' });
      setNotes(notes.filter(n => n.id !== id));
    } catch (e) {
      console.error('Delete note error:', e);
    }
  };

  // 保存手写笔记
  const handleSaveHandwriting = async (imageData) => {
    if (!playingVideo) {
      alert('请先选择一个视频再保存笔记');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:3001/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: playingVideo.id,
          chapter_id: activeChapter,
          subject_id: activeSubject,
          content: `[手写笔记] ${imageData}`,
          timestamp: 0
        })
      });
      const data = await res.json();
      if (data.id) {
        loadNotes(playingVideo.id);
        alert('笔记已保存！');
      }
    } catch (e) {
      console.error('Save handwriting error:', e);
      alert('保存失败: ' + e.message);
    }
  };

  // 当播放视频变化时加载笔记
  useEffect(() => {
    if (playingVideo?.id) {
      loadNotes(playingVideo.id);
      setShowNotes(true);
    }
  }, [playingVideo?.id]);

  // 实时语音转文字（使用浏览器Web Speech API）
  const toggleRealTimeTranscribe = () => {
    if (isRealTimeTranscribing) {
      // 停止识别
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRealTimeTranscribing(false);
    } else {
      // 开始识别
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('您的浏览器不支持语音识别，请使用Chrome浏览器');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setRealTimeText(prev => prev + finalTranscript);
        }
        setShowTranscript(true);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // 没有检测到语音，继续监听
        } else {
          setIsRealTimeTranscribing(false);
        }
      };
      
      recognition.onend = () => {
        // 如果还在转写状态，自动重启
        if (isRealTimeTranscribing && recognitionRef.current) {
          recognition.start();
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      setIsRealTimeTranscribing(true);
      setRealTimeText('');
      setShowTranscript(true);
    }
  };

  // 处理拖拽上传
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeChapter) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!activeChapter) {
      alert('请先选择一个章节');
      return;
    }

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
    if (files.length === 0) {
      alert('请拖入视频文件');
      return;
    }

    for (const file of files) {
      await uploadVideoFile(file);
    }
  };

  const uploadVideoFile = async (file) => {
    if (!useBackend) {
      alert('拖拽上传需要启动后端服务\n请运行: npm run server');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:3001/api/upload');
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      const result = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const errData = JSON.parse(xhr.responseText);
              reject(new Error(errData.error || '上传失败'));
            } catch {
              reject(new Error(`上传失败 (${xhr.status})`));
            }
          }
        };
        xhr.onerror = () => reject(new Error('网络错误，请确保后端服务已启动'));
        xhr.send(formData);
      });

      // 上传成功，添加视频到列表
      const videoTitle = file.name.replace(/\.[^/.]+$/, '');
      const videoData = {
        title: videoTitle,
        type: 'local',
        url: result.url,
        description: `文件大小: ${(file.size / 1024 / 1024).toFixed(1)}MB`
      };

      // 调用添加视频
      const addResult = await api.addVideo(activeChapter, videoData.title, videoData.type, videoData.url, videoData.description);
      
      const video = { id: addResult.id || Date.now(), ...videoData };
      const updatedData = {
        ...videoData,
        [activeSubject]: {
          ...videoData[activeSubject],
          chapters: videoData[activeSubject].chapters.map(ch =>
            ch.id === activeChapter ? { ...ch, videos: [...ch.videos, video] } : ch
          )
        }
      };
      
      // 重新加载数据
      const freshData = await api.getData();
      setVideoData(freshData);

    } catch (error) {
      console.error('Upload error:', error);
      alert('上传失败: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const renderPlayer = () => {
    if (!playingVideo) {
      return (
        <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <PlayCircle className="w-20 h-20 text-slate-600 mx-auto mb-4" strokeWidth={1} />
            <p className="text-slate-500 text-lg">选择视频开始播放</p>
            <p className="text-slate-400 text-sm mt-2">支持倍速播放(0.5x-3x)、截图标注、GIF录制</p>
          </div>
        </div>
      );
    }

    // 处理视频URL
    const videoUrl = playingVideo.url.startsWith('/') 
      ? `http://localhost:3001${playingVideo.url}` 
      : playingVideo.url;

    return (
      <div className="relative">
        <VideoPlayerPro
          src={videoUrl}
          title={playingVideo.title}
          type={playingVideo.type}
        />
        <button
          onClick={() => setPlayingVideo(null)}
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-[60]"
        >
          <X size={20} />
        </button>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{playingVideo.title}</h2>
              {playingVideo.description && <p className="text-slate-500 mt-1">{playingVideo.description}</p>}
            </div>
          </div>

          {/* 五个功能卡片 - 一排显示 */}
          <div className="mt-4 grid grid-cols-5 gap-3">
            {/* 王道真题 */}
            <div 
              onClick={() => {
                const chapter = currentSubject?.chapters?.find(c => c.id === activeChapter);
                setQuizChapter(chapter || { id: activeChapter, name: '本章' });
                setShowChapterQuiz(true);
              }}
              className="p-4 bg-white rounded-xl border border-purple-200 shadow-sm hover:shadow-md hover:border-purple-400 cursor-pointer transition-all group"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                  <BookOpen size={24} className="text-purple-500" />
                </div>
                <h4 className="font-medium text-slate-700 mb-1">王道真题</h4>
                <p className="text-xs text-purple-500">
                  {activeSubject === 'os' ? '549' : activeSubject === 'cn' ? '475' : activeSubject === 'ds' ? '389' : '524'}道题
                </p>
              </div>
            </div>

            {/* 课后习题 */}
            <div 
              onClick={() => setShowExercises(true)}
              className="p-4 bg-white rounded-xl border border-blue-200 shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer transition-all group"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                  <ClipboardList size={24} className="text-blue-500" />
                </div>
                <h4 className="font-medium text-slate-700 mb-1">课后习题</h4>
                <p className="text-xs text-blue-500">AI生成</p>
              </div>
            </div>

            {/* 字幕转写 */}
            <div 
              onClick={() => {
                if (playingVideo?.type === 'local' && playingVideo?.url) {
                  setShowSTT(true);
                } else {
                  alert('请先选择一个本地视频');
                }
              }}
              className="p-4 bg-white rounded-xl border border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-400 cursor-pointer transition-all group"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-200 transition-colors">
                  <Mic size={24} className="text-emerald-500" />
                </div>
                <h4 className="font-medium text-slate-700 mb-1">字幕转写</h4>
                <p className="text-xs text-emerald-500">AI识别</p>
              </div>
            </div>

            {/* 飞书文档 */}
            <div 
              onClick={openFeishuDoc}
              className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm hover:shadow-md hover:border-indigo-400 cursor-pointer transition-all group"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition-colors">
                  <FileText size={24} className="text-indigo-500" />
                </div>
                <h4 className="font-medium text-slate-700 mb-1">飞书文档</h4>
                <p className="text-xs text-indigo-500">Ctrl+Shift+F</p>
              </div>
            </div>

            {/* 边学边记 */}
            <div 
              onClick={() => setShowNotebook(true)}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 cursor-pointer transition-all group"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-slate-200 transition-colors">
                  <PenTool size={24} className="text-slate-500" />
                </div>
                <h4 className="font-medium text-slate-700 mb-1">边学边记</h4>
                <p className="text-xs text-slate-500">{notes.length} 条笔记</p>
              </div>
            </div>
          </div>

          {/* 笔记列表 */}
          {notes.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                <PenTool size={16} />
                最近笔记
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {notes.slice(0, 4).map((note) => (
                  <div key={note.id} className="relative group bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                    {note.content.startsWith('[手写笔记]') || note.content.startsWith('data:image') ? (
                      <img 
                        src={note.content.replace('[手写笔记] ', '').replace('[手写笔记]', '')} 
                        alt="手写笔记" 
                        className="w-full h-24 object-contain bg-white cursor-pointer hover:opacity-90"
                        onClick={() => window.open(note.content.replace('[手写笔记] ', '').replace('[手写笔记]', ''), '_blank')}
                      />
                    ) : (
                      <div className="p-2 h-24 overflow-hidden">
                        <p className="text-xs text-slate-600 line-clamp-4">{note.content}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between px-2 py-1 bg-slate-100 border-t border-slate-200">
                      <span className="text-xs text-slate-400">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-50 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 拖拽上传遮罩 */}
      {isDragging && (
        <div className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl p-12 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-blue-500" />
            </div>
            <p className="text-xl font-semibold text-slate-800">释放以上传视频</p>
            <p className="text-slate-500 mt-2">视频将添加到当前章节</p>
          </div>
        </div>
      )}

      {/* 上传进度 */}
      {uploading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center min-w-80">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-800 mb-2">正在上传...</p>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-slate-500">{uploadProgress}%</p>
          </div>
        </div>
      )}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">视频课程</h1>
              <p className="text-slate-500 mt-2">系统化学习408核心知识</p>
            </div>
            <div className={'px-3 py-1 rounded-full text-sm ' + (useBackend ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
              {useBackend ? '已连接后台' : '本地模式'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Object.entries(videoData).map(([id, subject]) => {
            const totalVideos = (subject.chapters || []).reduce((sum, ch) => sum + ch.videos.length, 0);
            return (
              <button
                key={id}
                onClick={() => { setActiveSubject(id); setActiveChapter(null); setPlayingVideo(null); }}
                className={'relative p-5 rounded-2xl text-left transition-all duration-300 ' + (
                  activeSubject === id
                    ? 'bg-gradient-to-br ' + subject.gradient + ' text-white shadow-lg scale-105'
                    : 'bg-white text-slate-700 hover:shadow-md border border-slate-200'
                )}
              >
                <div className={'text-2xl font-bold mb-1 ' + (activeSubject === id ? 'text-white/90' : 'text-slate-400')}>
                  {subject.icon}
                </div>
                <div className="font-semibold">{subject.name}</div>
                <div className={'text-sm mt-1 ' + (activeSubject === id ? 'text-white/70' : 'text-slate-400')}>
                  {(subject.chapters || []).length} 章节 - {totalVideos} 视频
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700">章节目录</h3>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {(!currentSubject?.chapters || currentSubject.chapters.length === 0) ? (
                  <div className="p-8 text-center text-slate-400">暂无章节</div>
                ) : (
                  currentSubject.chapters.map((chapter) => {
                    const isExpanded = expandedChapters[chapter.id];
                    return (
                      <div key={chapter.id} className="border-b border-slate-100 last:border-b-0">
                        {/* 章节标题 */}
                        <div
                          className={'group flex items-center justify-between p-3 cursor-pointer transition-colors ' + (
                            isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'
                          )}
                          onClick={() => {
                            setExpandedChapters(prev => ({ ...prev, [chapter.id]: !prev[chapter.id] }));
                            setActiveChapter(chapter.id);
                          }}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            {isExpanded ? (
                              <ChevronDown size={16} className="text-slate-400 mr-2 flex-shrink-0" />
                            ) : (
                              <ChevronRight size={16} className="text-slate-400 mr-2 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-700 truncate text-sm">{chapter.name}</div>
                              <div className="text-xs text-slate-400">{chapter.videos.length} 个视频</div>
                            </div>
                          </div>
                          {/* 做题按钮 */}
                          {activeSubject === 'os' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuizChapter(chapter);
                                setShowChapterQuiz(true);
                              }}
                              className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors opacity-0 group-hover:opacity-100"
                              title="做题练习"
                            >
                              做题
                            </button>
                          )}
                        </div>
                        {/* 子目录：视频列表 */}
                        {isExpanded && (
                          <div className="bg-slate-50/50">
                            {chapter.videos.length === 0 ? (
                              <div className="pl-10 pr-3 py-3 text-xs text-slate-400">暂无视频</div>
                            ) : (
                              chapter.videos.map((video, index) => (
                                <div
                                  key={video.id}
                                  className={'flex items-center pl-8 pr-3 py-2 cursor-pointer transition-colors ' + (
                                    playingVideo?.id === video.id ? 'bg-blue-100' : 'hover:bg-slate-100'
                                  )}
                                  onClick={() => handlePlayVideo(video)}
                                >
                                  <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-slate-500 text-xs mr-2 flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-slate-600 truncate">{video.title}</div>
                                  </div>
                                  {playingVideo?.id === video.id && (
                                    <Play size={12} className="text-blue-500 ml-2" />
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="col-span-8">
            <div className="mb-6">{renderPlayer()}</div>

            {!playingVideo && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <PlayCircle size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-500">展开左侧章节，选择视频播放</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddChapterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">添加章节</h3>
            <input
              type="text"
              value={newChapterName}
              onChange={(e) => setNewChapterName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="输入章节名称"
              autoFocus
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => { setShowAddChapterModal(false); setNewChapterName(''); }}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddChapter}
                className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">添加视频</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="视频标题"
                autoFocus
              />
              <div className="grid grid-cols-4 gap-2">
                {videoTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setNewVideo({ ...newVideo, type: type.value })}
                    className={'py-2 px-3 rounded-lg text-sm transition-colors ' + (
                      newVideo.type === type.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={newVideo.url}
                onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder={videoTypes.find(t => t.value === newVideo.type)?.placeholder}
              />
              <input
                type="text"
                value={newVideo.description}
                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="描述(可选)"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); setNewVideo({ title: '', type: 'bilibili', url: '', description: '' }); }}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddVideo}
                className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 手写笔记组件 */}
      <HandwritingNote
        isOpen={showHandwriting}
        onClose={() => setShowHandwriting(false)}
        onSave={handleSaveHandwriting}
        videoTitle={playingVideo?.title}
      />

      {/* 笔记本编辑器 */}
      <NotebookEditor
        isOpen={showNotebook}
        onClose={() => setShowNotebook(false)}
        onSave={(noteData) => {
          // 笔记本保存的是完整的笔记数据，不需要视频
          console.log('笔记本已保存', noteData);
        }}
        videoTitle={playingVideo?.title || '学习笔记'}
      />

      {/* 习题面板 */}
      <ExercisePanel
        isOpen={showExercises}
        onClose={() => setShowExercises(false)}
        videoId={playingVideo?.id}
        chapterId={activeChapter}
        subjectId={activeSubject}
        videoTitle={playingVideo?.title}
      />

      {/* 章节习题 */}
      <ChapterQuiz
        isOpen={showChapterQuiz}
        onClose={() => setShowChapterQuiz(false)}
        chapterId={quizChapter?.id}
        chapterName={quizChapter?.name}
        subjectId={activeSubject}
      />

      {/* 飞书文档弹窗 - 全屏 */}
      {showFeishuDoc && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="bg-white w-full h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">飞书文档</span>
                <span className="text-xs text-slate-400">(ESC 关闭)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(feishuDocUrl, '_blank')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <ExternalLink size={14} />
                  新窗口
                </button>
                <button
                  onClick={() => setShowFeishuDoc(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="flex-1">
              <iframe
                src={feishuDocUrl.includes('?') ? feishuDocUrl : `${feishuDocUrl}?mode=edit`}
                className="w-full h-full border-0"
                title="飞书文档"
                allow="clipboard-read; clipboard-write"
              />
            </div>
          </div>
        </div>
      )}

      {/* 飞书文档链接输入弹窗 */}
      {showFeishuUrlInput && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Link className="h-5 w-5 text-blue-600" />
              设置飞书文档链接
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  飞书文档链接
                </label>
                <input
                  type="text"
                  value={tempFeishuUrl}
                  onChange={(e) => setTempFeishuUrl(e.target.value)}
                  placeholder="https://xxx.feishu.cn/docx/xxx"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && saveFeishuUrl()}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  支持飞书文档、表格、多维表格、知识库链接
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowFeishuUrlInput(false);
                  setTempFeishuUrl('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveFeishuUrl}
                disabled={!tempFeishuUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存并打开
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STT 字幕转写工具 */}
      {showSTT && (
        <STTTool 
          onClose={() => setShowSTT(false)} 
          videoUrl={playingVideo?.url}
          videoTitle={playingVideo?.title}
        />
      )}
    </div>
  );
};

export default VideoPage;

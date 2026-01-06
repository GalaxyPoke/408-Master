import React, { useState, useRef, useCallback } from 'react';
import {
  Mic, Upload, Play, Pause, Square, Download, Copy, Loader2,
  FileAudio, Trash2, Volume2, CheckCircle, AlertCircle
} from 'lucide-react';

const AudioTranscriber = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);

  // 上传音频文件
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      setError('请上传音频或视频文件');
      return;
    }
    
    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setTranscript('');
    setError('');
  }, []);

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioFile(new File([blob], '录音.webm', { type: 'audio/webm' }));
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('无法访问麦克风，请检查权限设置');
    }
  }, []);

  // 停止录音
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // 播放/暂停
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // 转写音频 (使用 Web Speech API 或后端 API)
  const transcribeAudio = useCallback(async () => {
    if (!audioFile) {
      setError('请先上传或录制音频');
      return;
    }
    
    setIsTranscribing(true);
    setProgress(0);
    setError('');
    
    try {
      // 尝试使用后端 API
      const formData = new FormData();
      formData.append('audio', audioFile);
      
      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 500);
      
      const response = await fetch('http://localhost:3001/api/transcribe', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      
      if (response.ok) {
        const data = await response.json();
        setTranscript(data.text || '转写完成，但未识别到文字');
        setProgress(100);
      } else {
        // 后端不支持，使用浏览器 Web Speech API 作为备选
        await transcribeWithWebSpeech();
      }
    } catch (err) {
      // 后端不可用，使用浏览器 Web Speech API
      await transcribeWithWebSpeech();
    } finally {
      setIsTranscribing(false);
    }
  }, [audioFile]);

  // 使用 Web Speech API 转写
  const transcribeWithWebSpeech = useCallback(() => {
    return new Promise((resolve) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setError('您的浏览器不支持语音识别，请使用 Chrome 浏览器');
        setProgress(0);
        resolve();
        return;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';
      
      let finalTranscript = '';
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        setTranscript(finalTranscript + interimTranscript);
        setProgress(50);
      };
      
      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          setError('未检测到语音，请确保音频包含清晰的语音');
        } else {
          setError(`语音识别错误: ${event.error}`);
        }
        setProgress(0);
        resolve();
      };
      
      recognition.onend = () => {
        setProgress(100);
        if (!finalTranscript) {
          setTranscript('提示：浏览器语音识别需要实时麦克风输入。\n\n对于音频文件转写，建议：\n1. 播放音频并使用麦克风录制\n2. 或使用专业的语音转写服务');
        }
        resolve();
      };
      
      // 播放音频并开始识别
      if (audioRef.current) {
        audioRef.current.play();
        recognition.start();
        
        audioRef.current.onended = () => {
          recognition.stop();
        };
      } else {
        recognition.start();
        setTimeout(() => recognition.stop(), 10000);
      }
    });
  }, []);

  // 复制文字
  const copyTranscript = useCallback(() => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
    }
  }, [transcript]);

  // 下载文字
  const downloadTranscript = useCallback(() => {
    if (!transcript) return;
    
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `转写_${Date.now()}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [transcript]);

  // 清空
  const clearAll = useCallback(() => {
    setAudioFile(null);
    setAudioUrl(null);
    setTranscript('');
    setError('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* 标题 */}
      <div className="px-4 py-3 border-b bg-slate-50">
        <h3 className="font-medium text-slate-800 flex items-center gap-2">
          <Mic className="h-5 w-5 text-green-500" />
          音频转文字
        </h3>
        <p className="text-xs text-slate-500 mt-1">上传音频文件或录制语音，自动转换为文字</p>
      </div>

      <div className="p-4 space-y-4">
        {/* 上传/录音区域 */}
        <div className="flex gap-3">
          {/* 上传按钮 */}
          <label className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-green-400 hover:bg-green-50 cursor-pointer transition-colors">
            <Upload className="h-5 w-5 text-slate-400" />
            <span className="text-sm text-slate-600">上传音频/视频</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* 录音按钮 */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-colors ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="h-5 w-5" />
                <span className="text-sm">停止</span>
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                <span className="text-sm">录音</span>
              </>
            )}
          </button>
        </div>

        {/* 录音中提示 */}
        {isRecording && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-600">正在录音...</span>
          </div>
        )}

        {/* 音频播放器 */}
        {audioUrl && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FileAudio size={16} />
                  <span>{audioFile?.name || '录音文件'}</span>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full mt-2"
                  controls
                />
              </div>
              <button
                onClick={clearAll}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )}

        {/* 转写按钮 */}
        <button
          onClick={transcribeAudio}
          disabled={!audioFile || isTranscribing}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {isTranscribing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>转写中... {progress}%</span>
            </>
          ) : (
            <>
              <Volume2 className="h-5 w-5" />
              <span>开始转写</span>
            </>
          )}
        </button>

        {/* 进度条 */}
        {isTranscribing && (
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* 转写结果 */}
        {transcript && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <CheckCircle size={16} className="text-green-500" />
                转写结果
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
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full h-40 p-3 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="转写结果将显示在这里..."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioTranscriber;

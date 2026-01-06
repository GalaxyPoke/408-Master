import React, { useState } from 'react';
import { Mic, X, ExternalLink } from 'lucide-react';

export default function STTTool({ onClose, videoUrl, videoTitle }) {
  const [showIframe, setShowIframe] = useState(true);

  // 获取视频的完整本地路径
  const getVideoLocalPath = () => {
    if (!videoUrl) return '';
    // 视频存储在 public/videos 目录
    if (videoUrl.startsWith('/videos/')) {
      const fileName = decodeURIComponent(videoUrl.replace('/videos/', ''));
      return `C:\\Users\\LENOVO\\Desktop\\study\\考研工具\\408\\public\\videos\\${fileName}`;
    }
    return videoUrl;
  };

  const videoPath = getVideoLocalPath();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[95vw] max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-500 to-teal-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">字幕转写</h2>
              <p className="text-sm text-white/80 truncate max-w-md">{videoTitle || '视频转写'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('http://127.0.0.1:9977', '_blank')}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              新窗口打开
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* 视频路径提示 */}
        {videoPath && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100">
            <p className="text-sm text-emerald-700">
              <span className="font-medium">视频路径：</span>
              <code className="ml-2 px-2 py-0.5 bg-emerald-100 rounded text-xs select-all">{videoPath}</code>
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              请在下方 STT 工具中上传此视频文件进行转写
            </p>
          </div>
        )}

        {/* STT iframe */}
        <div className="flex-1 overflow-hidden">
          {showIframe ? (
            <iframe
              src="http://127.0.0.1:9977"
              className="w-full h-full border-0"
              title="STT 语音转写工具"
              allow="microphone"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Mic className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-lg font-medium text-slate-700 mb-2">STT 服务未启动</p>
              <p className="text-sm text-slate-500 mb-4">请先启动本地 STT 服务</p>
              <div className="text-left bg-slate-50 rounded-lg p-4 max-w-md">
                <p className="text-sm text-slate-600 mb-2">启动方式：</p>
                <code className="block text-xs bg-slate-200 rounded p-2 mb-2">
                  cd C:\Users\LENOVO\Desktop\study\github上的工具\stt
                </code>
                <code className="block text-xs bg-slate-200 rounded p-2">
                  python start.py 或双击 run.bat
                </code>
              </div>
              <button
                onClick={() => setShowIframe(true)}
                className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                重试连接
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

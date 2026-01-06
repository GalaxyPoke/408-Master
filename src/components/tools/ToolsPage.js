import React, { useState } from 'react';
import StudyProgress from './StudyProgress';
import NotesBook from './NotesBook';
import Countdown from './Countdown';
import Achievements from './Achievements';
import Dashboard from './Dashboard';
import DrawingBoard from './DrawingBoard';
import AudioTranscriber from './AudioTranscriber';
import DrawIO from './DrawIO';
import StudyCalendar from './StudyCalendar';
import MarkdownEditor from './MarkdownEditor';
import FeishuDocs from './FeishuDocs';
import STTTool from './STTTool';
import { Sparkles, PenTool, Mic, X, Layout, Calendar, FileEdit, FileText, Video } from 'lucide-react';

const ToolsPage = () => {
  const [showDrawing, setShowDrawing] = useState(false);
  const [showTranscriber, setShowTranscriber] = useState(false);
  const [showDrawIO, setShowDrawIO] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
  const [showFeishuDocs, setShowFeishuDocs] = useState(false);
  const [showSTT, setShowSTT] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 头部 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            高效学习工具箱
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">学习工具</h1>
          <p className="text-gray-500 max-w-md mx-auto">科学管理学习时间，追踪进度，助你高效备考408</p>
        </div>

        {/* 顶部：倒计时 + 数据看板 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Countdown />
          <Dashboard />
        </div>

        {/* 中部：进度 */}
        <div className="mb-6">
          <StudyProgress />
        </div>

        {/* 底部：成就 + 笔记 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Achievements />
          <NotesBook />
        </div>

        {/* 扩展工具入口 */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">扩展工具</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Draw.io 绘图 */}
            <button
              onClick={() => setShowDrawIO(true)}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group text-left"
            >
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Layout className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Draw.io</h3>
                <p className="text-sm text-gray-500">专业流程图、架构图绘制</p>
              </div>
            </button>

            {/* 简易绘图工具 */}
            <button
              onClick={() => setShowDrawing(true)}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group text-left"
            >
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <PenTool className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">简易画板</h3>
                <p className="text-sm text-gray-500">快速手绘、标注示意图</p>
              </div>
            </button>

            {/* 音频转文字 */}
            <button
              onClick={() => setShowTranscriber(true)}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-green-300 hover:shadow-md transition-all group text-left"
            >
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Mic className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">音频转文字</h3>
                <p className="text-sm text-gray-500">语音识别，音频/视频转文字</p>
              </div>
            </button>

            {/* 视频字幕转写 */}
            <button
              onClick={() => setShowSTT(true)}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group text-left"
            >
              <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <Video className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">视频字幕转写</h3>
                <p className="text-sm text-gray-500">本地 AI 转写，带时间戳字幕</p>
              </div>
            </button>

            {/* 学习日历 */}
            <button
              onClick={() => setShowCalendar(true)}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all group text-left"
            >
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">学习日历</h3>
                <p className="text-sm text-gray-500">规划复习计划，安排学习日程</p>
              </div>
            </button>

            {/* Markdown 编辑器 */}
            <button
              onClick={() => setShowMarkdownEditor(true)}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all group text-left"
            >
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <FileEdit className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Markdown 笔记</h3>
                <p className="text-sm text-gray-500">富文本编辑，支持代码高亮</p>
              </div>
            </button>

            {/* 飞书文档 */}
            <button
              onClick={() => setShowFeishuDocs(true)}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group text-left"
            >
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">飞书文档</h3>
                <p className="text-sm text-gray-500">云端同步，多人协作</p>
              </div>
            </button>
          </div>
        </div>

        {/* 绘图工具弹窗 */}
        {showDrawing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-indigo-500" />
                  绘图工具
                </h2>
                <button
                  onClick={() => setShowDrawing(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <DrawingBoard />
              </div>
            </div>
          </div>
        )}

        {/* 音频转文字弹窗 */}
        {showTranscriber && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Mic className="h-5 w-5 text-green-500" />
                  音频转文字
                </h2>
                <button
                  onClick={() => setShowTranscriber(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <AudioTranscriber />
              </div>
            </div>
          </div>
        )}

        {/* Draw.io 弹窗 */}
        {showDrawIO && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
              <DrawIO onClose={() => setShowDrawIO(false)} />
            </div>
          </div>
        )}

        {/* 学习日历弹窗 */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
              <StudyCalendar onClose={() => setShowCalendar(false)} />
            </div>
          </div>
        )}

        {/* Markdown 编辑器弹窗 */}
        {showMarkdownEditor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
              <MarkdownEditor onClose={() => setShowMarkdownEditor(false)} />
            </div>
          </div>
        )}

        {/* 飞书文档弹窗 - 全屏 */}
        {showFeishuDocs && (
          <div className="fixed inset-0 bg-black/50 z-50">
            <div className="bg-white w-full h-full overflow-hidden">
              <FeishuDocs onClose={() => setShowFeishuDocs(false)} />
            </div>
          </div>
        )}

        {/* STT 视频字幕转写弹窗 */}
        {showSTT && (
          <STTTool onClose={() => setShowSTT(false)} />
        )}
      </div>
    </div>
  );
};

export default ToolsPage;

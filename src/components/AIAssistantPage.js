import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw, Sparkles, Zap, BookOpen, Cpu, Network } from 'lucide-react';

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('Qwen/Qwen2.5-7B-Instruct');
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    { icon: <BookOpen className="w-4 h-4" />, text: '数据结构', color: 'from-blue-400 to-blue-600' },
    { icon: <Cpu className="w-4 h-4" />, text: '计算机组成', color: 'from-emerald-400 to-emerald-600' },
    { icon: <Zap className="w-4 h-4" />, text: '操作系统', color: 'from-amber-400 to-amber-600' },
    { icon: <Network className="w-4 h-4" />, text: '计算机网络', color: 'from-rose-400 to-rose-600' },
  ];

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchModels = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/ai/models');
      const data = await res.json();
      setModels(data.models || []);
    } catch (error) {
      console.error('获取模型列表失败:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          model: selectedModel
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: `错误: ${data.error || '请求失败'}` }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: `网络错误: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">408 AI 学习助手</h1>
          <p className="text-slate-500 mt-1">智能答疑 · 知识点解析 · 真题讲解</p>
          
          {/* Model Select */}
          <div className="mt-4 flex justify-center">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {models.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
          {/* Messages Area */}
          <div className="h-[55vh] overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="text-6xl mb-6">🎓</div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">开始你的学习之旅</h3>
                <p className="text-slate-400 mb-8">选择一个科目开始提问</p>
                
                {/* Subject Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-lg">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(`请帮我讲解${q.text}的重点知识`)}
                      className={`group p-4 rounded-2xl bg-gradient-to-br ${q.color} text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {q.icon}
                        <span className="text-sm font-medium">{q.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${msg.role === 'user' ? '' : ''}`}>
                      <div className={`px-4 py-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                      <div className={`text-xs text-slate-400 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                        {msg.role === 'user' ? '你' : 'AI助手'}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 px-4 py-3 rounded-2xl">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">思考中...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-100 p-4 bg-slate-50">
            <div className="flex items-center gap-3">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-3 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all"
                  title="新对话"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入你的问题，例如：什么是二叉搜索树？"
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={`p-3 rounded-2xl transition-all ${
                  input.trim() && !loading
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Tips */}
        <p className="text-center text-sm text-slate-400 mt-4">
          按 Enter 发送消息 · 支持多轮对话
        </p>
      </div>
    </div>
  );
};

export default AIAssistantPage;
